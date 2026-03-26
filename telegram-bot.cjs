/**
 * Telegram AI Chatbot - SmartJobAI ResumeBot
 * Run: node telegram-bot.cjs
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── Config ───
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3-flash-preview';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN missing! Add it to .env');
  process.exit(1);
}
if (!GEMINI_KEY) {
  console.error('❌ GEMINI_API_KEY missing! Add it to .env');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

// ─── Per-user session ───
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      step: 'idle',
      jd: '',
      resume: '',
    });
  }
  return sessions.get(chatId);
}

// ─── Gemini helpers ───
async function askGemini(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text || "Couldn't generate a response.";
  } catch (err) {
    console.error('Gemini error:', err.message);
    return `⚠️ AI Error: ${err.message}`;
  }
}

async function askGeminiJSON(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    const text = response.text || '';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error('Gemini JSON error:', err.message);
    return null;
  }
}

// ─── Download file from Telegram ───
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// ─── Extract text from PDF via Gemini ───
async function extractTextFromPDF(filePath) {
  const data = fs.readFileSync(filePath).toString('base64');
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'application/pdf', data } },
        { text: 'Extract ALL text from this document. Return ONLY the raw text content. No commentary.' }
      ]
    }]
  });
  return response.text || '';
}

// ─── Extract text from uploaded file ───
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.txt') return fs.readFileSync(filePath, 'utf-8');
  if (ext === '.pdf') return await extractTextFromPDF(filePath);
  if (ext === '.docx' || ext === '.doc') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  return '';
}

// ─── Download and extract text from Telegram document ───
async function processDocument(doc) {
  const fileLink = await bot.getFileLink(doc.file_id);
  const ext = path.extname(doc.file_name || '.tmp').toLowerCase();
  const tempPath = path.join(__dirname, `tmp_${Date.now()}${ext}`);
  
  await downloadFile(fileLink, tempPath);
  const text = await extractText(tempPath);
  
  try { fs.unlinkSync(tempPath); } catch(e) {}
  return text;
}

// ─── Resume analysis ───
const ANALYSIS_PROMPT = `You are an expert ATS Resume Analyzer. Analyze the resume against the job description thoroughly.

Return ONLY valid JSON with this exact structure:
{
  "ats_score": <number 0-100>,
  "match_percentage": <number 0-100>,
  "matched_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "ats_issues": ["issue1", "issue2", ...],
  "top_recommendations": ["rec1", "rec2", "rec3", ...],
  "future_skills": ["skill1", "skill2", ...],
  "summary": "2-3 sentence overall assessment"
}`;

function formatAnalysis(data) {
  let msg = `📊 *Resume Analysis Complete!*\n\n`;
  msg += `🎯 *ATS Score:* ${data.ats_score}/100\n`;
  msg += `📈 *Match:* ${data.match_percentage}%\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (data.matched_skills?.length) {
    msg += `✅ *Matched Skills:*\n${data.matched_skills.map(s => `  • ${s}`).join('\n')}\n\n`;
  }
  if (data.missing_skills?.length) {
    msg += `❌ *Missing Skills (Add These!):*\n${data.missing_skills.map(s => `  • ${s}`).join('\n')}\n\n`;
  }
  if (data.ats_issues?.length) {
    msg += `⚠️ *ATS Issues:*\n${data.ats_issues.map(s => `  • ${s}`).join('\n')}\n\n`;
  }
  if (data.top_recommendations?.length) {
    msg += `🚀 *Recommendations:*\n${data.top_recommendations.map(s => `  • ${s}`).join('\n')}\n\n`;
  }
  if (data.future_skills?.length) {
    msg += `🔮 *Skills to Learn:*\n${data.future_skills.map(s => `  • ${s}`).join('\n')}\n\n`;
  }
  if (data.summary) {
    msg += `📝 *Summary:* ${data.summary}`;
  }
  return msg;
}

async function runAnalysis(chatId, session) {
  await bot.sendMessage(chatId, '⏳ _Analyzing your resume against the job description... This may take a moment._', { parse_mode: 'Markdown' });
  await bot.sendChatAction(chatId, 'typing');

  const data = await askGeminiJSON(
    `${ANALYSIS_PROMPT}\n\nJOB DESCRIPTION:\n${session.jd}\n\nRESUME:\n${session.resume}\n\nAnalyze thoroughly and return ONLY valid JSON.`
  );

  if (data) {
    // Split long messages for Telegram's 4096 char limit
    const result = formatAnalysis(data);
    if (result.length > 4000) {
      const parts = result.match(/[\s\S]{1,4000}/g) || [result];
      for (const part of parts) {
        await bot.sendMessage(chatId, part, { parse_mode: 'Markdown' });
      }
    } else {
      await bot.sendMessage(chatId, result, { parse_mode: 'Markdown' });
    }

    await bot.sendMessage(chatId,
      `\n💬 *What would you like to do next?*\n\n` +
      `📝 Type *rewrite* — Get a complete ATS-optimized resume\n` +
      `🎤 Type *interview* — Get interview prep questions\n` +
      `💡 Type *tips* — Get improvement tips\n` +
      `🔄 Type *new* — Start fresh with new JD + Resume\n\n` +
      `_Or just ask me anything!_`,
      { parse_mode: 'Markdown' }
    );
    session.step = 'done';
  } else {
    await bot.sendMessage(chatId, '❌ Analysis failed. Please try again — send /analyze to restart.');
    session.step = 'idle';
  }
}

// ═══════════════════════════════════════
// ─── COMMAND HANDLERS ───
// ═══════════════════════════════════════

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'there';
  sessions.delete(chatId);
  
  await bot.sendMessage(chatId,
    `👋 Hi ${name}! I'm *SmartJobAI Bot* — your AI career assistant!\n\n` +
    `🔥 *Quick Start:* Just type *analyze* and I'll guide you through it!\n\n` +
    `*Commands:*\n` +
    `📊 *analyze* — Analyze resume vs job description\n` +
    `📝 *rewrite* — Rewrite resume for ATS\n` +
    `🎤 *interview* — Interview prep questions\n` +
    `📎 You can upload PDF/DOCX files too!\n\n` +
    `💬 Or just chat with me about anything — career advice, coding, whatever!\n\n` +
    `_Powered by Google Gemini AI_ ✨`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
// ─── DOCUMENT HANDLER (PDF/DOCX/TXT) ───
// ═══════════════════════════════════════

bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  const doc = msg.document;
  const fileName = (doc.file_name || '').toLowerCase();
  
  if (!['.pdf', '.txt', '.docx', '.doc'].some(ext => fileName.endsWith(ext))) {
    await bot.sendMessage(chatId, '⚠️ Please upload a PDF, TXT, or DOCX file.');
    return;
  }

  await bot.sendMessage(chatId, `📎 _Processing ${doc.file_name}..._`, { parse_mode: 'Markdown' });
  await bot.sendChatAction(chatId, 'typing');

  try {
    const text = await processDocument(doc);

    if (!text || text.length < 30) {
      await bot.sendMessage(chatId, '⚠️ Could not extract enough text from the file. Please try a different file or paste the text directly.');
      return;
    }

    await bot.sendMessage(chatId, `✅ Extracted ${text.length} characters from *${doc.file_name}*`, { parse_mode: 'Markdown' });

    // Determine where to store based on current step
    if (session.step === 'awaiting_jd') {
      session.jd = text;
      session.step = 'awaiting_resume';
      await bot.sendMessage(chatId,
        `✅ *Got the Job Description!*\n\n📄 *Step 2 of 2:* Now send your *Resume*\n\n` +
        `You can:\n• 📎 Upload a PDF/DOCX file\n• ✏️ Or paste the text directly`,
        { parse_mode: 'Markdown' }
      );
    } else if (session.step === 'awaiting_resume') {
      session.resume = text;
      await runAnalysis(chatId, session);
    } else if (session.step === 'idle' || session.step === 'done') {
      // Auto-detect: if no JD yet, treat as JD; if JD exists, treat as resume
      if (!session.jd) {
        session.jd = text;
        session.step = 'awaiting_resume';
        await bot.sendMessage(chatId,
          `📋 Saved as *Job Description*!\n\n📄 Now send your *Resume* (upload PDF or paste text).`,
          { parse_mode: 'Markdown' }
        );
      } else if (!session.resume) {
        session.resume = text;
        await runAnalysis(chatId, session);
      } else {
        // Both exist, ask what this is
        await bot.sendMessage(chatId,
          `📄 I already have a JD and resume. What is this file?\n\n` +
          `Reply with:\n• *jd* — to replace the job description\n• *resume* — to replace the resume\n• *new* — to start fresh`,
          { parse_mode: 'Markdown' }
        );
        session._pendingText = text;
      }
    }
  } catch (err) {
    console.error('Document error:', err);
    await bot.sendMessage(chatId, `❌ Error processing file: ${err.message}\n\nTry pasting the text directly instead.`);
  }
});

// ═══════════════════════════════════════
// ─── TEXT MESSAGE HANDLER ───
// ═══════════════════════════════════════

bot.on('message', async (msg) => {
  if (!msg.text) return;
  if (msg.document) return;
  
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  const text = msg.text.trim();
  const lower = text.toLowerCase();

  // Skip /start (handled separately)
  if (lower === '/start') return;

  try {
    // ─── Keyword commands (with or without /) ───
    if (lower === '/analyze' || lower === 'analyze' || lower === '/start_analyze') {
      session.step = 'awaiting_jd';
      session.jd = '';
      session.resume = '';
      await bot.sendMessage(chatId,
        `📊 *Resume Analysis Mode*\n\n` +
        `📋 *Step 1 of 2:* Send the *Job Description*\n\n` +
        `You can:\n• 📎 Upload a PDF/DOCX file\n• ✏️ Or paste the text directly`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    if (lower === '/cancel' || lower === 'cancel' || lower === 'stop') {
      sessions.delete(chatId);
      await bot.sendMessage(chatId, '✅ Cancelled. Type *analyze* to start again or just chat with me!', { parse_mode: 'Markdown' });
      return;
    }

    if (lower === 'new' || lower === '/new') {
      session.jd = '';
      session.resume = '';
      session.step = 'awaiting_jd';
      await bot.sendMessage(chatId,
        `🔄 *Starting fresh!*\n\n📋 *Step 1:* Send the *Job Description* (upload PDF or paste text)`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    if (lower === '/help' || lower === 'help') {
      await bot.sendMessage(chatId,
        `🤖 *SmartJobAI Bot*\n\n` +
        `📊 *analyze* — Start resume analysis\n` +
        `📝 *rewrite* — Rewrite resume for ATS\n` +
        `🎤 *interview* — Interview prep questions\n` +
        `💡 *tips* — Get improvement tips\n` +
        `🔄 *new* — Start fresh\n` +
        `❌ *cancel* — Cancel current operation\n\n` +
        `📎 Upload PDF/DOCX/TXT files anytime!\n` +
        `💬 Or just type anything to chat with AI!`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Handle pending file assignment
    if (session._pendingText) {
      if (lower === 'jd') {
        session.jd = session._pendingText;
        delete session._pendingText;
        await bot.sendMessage(chatId, '✅ Updated the Job Description! Type *analyze* to re-analyze.', { parse_mode: 'Markdown' });
        return;
      } else if (lower === 'resume') {
        session.resume = session._pendingText;
        delete session._pendingText;
        await bot.sendMessage(chatId, '✅ Updated the Resume! Type *analyze* to re-analyze.', { parse_mode: 'Markdown' });
        return;
      }
      delete session._pendingText;
    }

    // ─── Rewrite command ───
    if (lower === 'rewrite' || lower === '/rewrite' || lower === 'rewrite resume') {
      if (!session.resume || !session.jd) {
        await bot.sendMessage(chatId, '⚠️ I need both a JD and resume first. Type *analyze* to start!', { parse_mode: 'Markdown' });
        return;
      }
      await bot.sendMessage(chatId, '📝 _Generating ATS-optimized resume..._', { parse_mode: 'Markdown' });
      await bot.sendChatAction(chatId, 'typing');

      const response = await askGemini(
        `You are an expert ATS resume writer. COMPLETELY REWRITE this resume optimized for the job description.

JOB DESCRIPTION:
"${session.jd}"

ORIGINAL RESUME:
"${session.resume}"

Rules:
1. Keep same personal info (name, contact, education)
2. Rewrite ALL bullet points with strong action verbs and quantified achievements
3. Add JD keywords naturally throughout
4. Structure: PROFESSIONAL SUMMARY → TECHNICAL SKILLS → EXPERIENCE → PROJECTS → EDUCATION → CERTIFICATIONS
5. Make every bullet impactful with metrics
6. Output ONLY the resume text, no commentary`
      );

      if (response.length > 4000) {
        const parts = response.match(/[\s\S]{1,4000}/g) || [response];
        for (const part of parts) {
          await bot.sendMessage(chatId, part);
        }
      } else {
        await bot.sendMessage(chatId, `📝 *ATS-Optimized Resume:*\n\n${response}`, { parse_mode: 'Markdown' });
      }
      return;
    }

    // ─── Interview command ───
    if (lower === 'interview' || lower === '/interview' || lower === 'interview prep') {
      if (!session.jd) {
        await bot.sendMessage(chatId, '⚠️ I need a job description first. Type *analyze* to start!', { parse_mode: 'Markdown' });
        return;
      }
      await bot.sendMessage(chatId, '🎤 _Generating interview questions..._', { parse_mode: 'Markdown' });
      await bot.sendChatAction(chatId, 'typing');

      const response = await askGemini(
        `Generate 7 targeted interview questions for this role:\n"${session.jd}"\n\nFor each:\nQ: [question]\n💡 What they look for: [explanation]\n\nMix behavioral, technical, and situational questions.`
      );

      if (response.length > 4000) {
        const parts = response.match(/[\s\S]{1,4000}/g) || [response];
        for (const part of parts) {
          await bot.sendMessage(chatId, part);
        }
      } else {
        await bot.sendMessage(chatId, `🎤 *Interview Questions:*\n\n${response}`, { parse_mode: 'Markdown' });
      }
      return;
    }

    // ─── Tips command ───
    if (lower === 'tips' || lower === '/tips' || lower === 'improve') {
      if (!session.resume || !session.jd) {
        await bot.sendMessage(chatId, '⚠️ I need both a JD and resume first. Type *analyze* to start!', { parse_mode: 'Markdown' });
        return;
      }
      await bot.sendChatAction(chatId, 'typing');
      const response = await askGemini(
        `Give 7 specific, actionable tips to improve this resume for the job:\n\nJD: "${session.jd.substring(0, 500)}"\nResume: "${session.resume.substring(0, 500)}"\n\nFocus on: ATS keywords, bullet point improvements, structure, missing skills, quantified achievements. Use • for bullets.`
      );
      await bot.sendMessage(chatId, `💡 *Improvement Tips:*\n\n${response}`, { parse_mode: 'Markdown' });
      return;
    }

    // ─── Analysis flow: awaiting JD ───
    if (session.step === 'awaiting_jd') {
      if (text.length < 30) {
        await bot.sendMessage(chatId, '⚠️ That seems too short. Please paste the full job description or upload a PDF.');
        return;
      }
      session.jd = text;
      session.step = 'awaiting_resume';
      await bot.sendMessage(chatId,
        `✅ *Got the Job Description!*\n\n📄 *Step 2 of 2:* Now send your *Resume*\n\n` +
        `You can:\n• 📎 Upload a PDF/DOCX file\n• ✏️ Or paste the text directly`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // ─── Analysis flow: awaiting resume ───
    if (session.step === 'awaiting_resume') {
      if (text.length < 50) {
        await bot.sendMessage(chatId, '⚠️ Too brief. Please include your full resume — experience, skills, education, projects.');
        return;
      }
      session.resume = text;
      await runAnalysis(chatId, session);
      return;
    }

    // ─── General AI chat (responds to EVERYTHING) ───
    await bot.sendChatAction(chatId, 'typing');
    const response = await askGemini(
      `You are SmartJobAI Bot on Telegram — a friendly AI assistant. You help with career advice, coding, general knowledge, and anything the user asks.

Be concise (2-3 paragraphs max), friendly, helpful. Use emojis naturally.
If they ask about resume analysis, tell them to type "analyze".
Keep under 4000 chars.

User says: "${text}"

Respond helpfully:`
    );

    if (response.length > 4000) {
      const parts = response.match(/[\s\S]{1,4000}/g) || [response];
      for (const part of parts) {
        await bot.sendMessage(chatId, part);
      }
    } else {
      await bot.sendMessage(chatId, response);
    }

  } catch (err) {
    console.error('Message handler error:', err);
    await bot.sendMessage(chatId, '❌ Something went wrong. Please try again!');
  }
});

// ─── Error handler ───
bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});

// ─── Started ───
console.log('');
console.log('╔══════════════════════════════════════════╗');
console.log('║   🤖 SmartJobAI Telegram Bot Running!    ║');
console.log('╠══════════════════════════════════════════╣');
console.log('║  Open Telegram and message your bot      ║');
console.log('║  Send /start or type "analyze" to begin  ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');

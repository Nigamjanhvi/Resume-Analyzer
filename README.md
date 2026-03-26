# 🤖 SmartJobAI — AI-Powered Resume Analyzer

> Beat the ATS. Land the interview. Powered by Google Gemini AI.

SmartJobAI analyzes your resume against any job description and tells you exactly what's missing, what matches, and how to fix it — available as a **web app** and a **Telegram bot**.

---

## ✨ Features

### 📊 ATS Resume Analysis
Upload a **Job Description** + **Resume** → Get instant results:
- **ATS Score** (0-100) & Match percentage
- ✅ Matched skills & ❌ Missing skills
- ⚠️ ATS formatting issues
- 🚀 Actionable recommendations

### 📝 AI Resume Rewriter
Generates a **complete, rewritten resume** tailored to the specific JD — optimized with action verbs, metrics, and ATS keywords.

### 📎 Smart File Upload
Upload **PDF, DOCX, or TXT** files — text is extracted automatically:
- Web app: Client-side parsing (pdfjs-dist + mammoth)
- Telegram bot: Server-side extraction via Gemini AI

### 🎤 Interview Prep
AI-generated interview questions based on the job description, with tips on what interviewers look for.

### 🤖 Telegram Bot
Full-featured Telegram bot with the same capabilities — analyze, rewrite, interview prep, and general AI chat. Works on mobile and desktop.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Framer Motion |
| AI Engine | Google Gemini 3 Flash (`@google/genai`) |
| File Parsing | `pdfjs-dist` (PDF), `mammoth` (DOCX) |
| Telegram Bot | `node-telegram-bot-api` |
| Auth | Firebase Authentication |
| Build | Vite |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/apikey)
- [Telegram Bot Token](https://t.me/BotFather) *(for Telegram bot)*

### Setup

```bash
# Clone the repo
git clone https://github.com/Nigamjanhvi/Resume-Analyzer.git
cd Resume-Analyzer

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your API keys to .env
```

### Environment Variables

```env
GEMINI_API_KEY="your-gemini-api-key"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
```

### Run

```bash
# Web App
npm run dev
# Open http://localhost:3000

# Telegram Bot
node telegram-bot.cjs
```

---

## 📱 Usage

### Web App
1. Click the **bot icon** (bottom-right corner)
2. Paste a **Job Description**
3. Paste your **Resume** or click 📎 to upload a PDF
4. Get instant ATS analysis
5. Click **Rewrite Resume**, **Interview Prep**, or **Improve Tips**

### Telegram Bot
1. Search for your bot on Telegram
2. Send `/start`
3. Type `analyze` → upload JD PDF → upload Resume PDF
4. Get full analysis with follow-up commands

---

## 📂 Project Structure

```
├── src/
│   └── App.tsx              # Main React app with ResumeBot chatbot
├── telegram-bot.cjs         # Standalone Telegram bot
├── .env.example             # Environment variable template
├── vite.config.ts           # Vite config with env injection
└── package.json
```

---

## 👤 Author

**Janhvi Nigam**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

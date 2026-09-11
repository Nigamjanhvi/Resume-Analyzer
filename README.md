# SmartJobAI Resume Analyzer

SmartJobAI is an AI-powered career assistant that compares a resume with a job description, identifies ATS gaps, suggests improvements, rewrites resume content, generates interview preparation questions, and provides AI career chat.

The project has two interfaces:

- A responsive React web application.
- A Telegram bot with the same resume analysis workflow.

## Features

### Resume analysis

The web chatbot accepts a job description as pasted text and a resume as pasted text or an uploaded PDF, DOC, DOCX, or TXT file. Gemini returns:

- An ATS score from 0 to 100.
- A job-match percentage.
- Matched skills.
- Missing skills.
- ATS and formatting issues.
- Recommended improvements.
- Future skills to learn.
- An overall summary.

### Resume improvement

After an analysis, users can ask the assistant to:

- Rewrite the complete resume for the selected job.
- Provide specific improvement tips.
- Generate targeted interview questions.
- Answer follow-up questions about the resume or job description.
- Start a new analysis.

### Smart job matching and interview preparation

The web app also includes standalone AI actions. A user can enter a target role or skills and receive generated job matches, including a company, role, match percentage, and location. The interview preparation action generates role-specific questions.

### Authentication and contact messages

Google sign-in is implemented with Firebase Authentication. The Contact form stores messages in the Firestore `messages` collection. The configured administrator can view and delete those messages through the admin dashboard.

### Telegram bot

The Telegram bot uses polling and maintains an in-memory session for each chat. It guides the user through these steps:

1. Send `analyze` or `/start`.
2. Send the job description as text or as a PDF, DOC, DOCX, or TXT file.
3. Send the resume as text or as a file.
4. Receive the AI analysis.
5. Send `rewrite`, `tips`, or `interview` for follow-up help.

## Technology Stack

### Frontend

| Technology | How it is used |
| --- | --- |
| React 19 | Component-based user interface and application state. |
| TypeScript 5.8 | Type-safe application code and JSX. |
| Vite 6 | Development server, environment loading, and production bundling. |
| `@vitejs/plugin-react` | React support in the Vite build. |
| Tailwind CSS 4 | Utility-first styling and responsive layouts. |
| `@tailwindcss/vite` | Tailwind CSS integration with Vite. |
| Motion | Page transitions, modal animation, menus, and loading states. |
| `lucide-react` | Interface icons. |
| Google Fonts | Inter for body text and Space Grotesk for headings. |

### AI and document processing

| Technology | How it is used |
| --- | --- |
| Google Gemini API | Resume analysis, ATS scoring, job matching, rewriting, interview preparation, and career chat. |
| `@google/genai` | JavaScript/TypeScript SDK used to call Gemini. The application uses `gemini-3-flash-preview`. |
| `pdfjs-dist` | Extracts text from PDF resumes in the browser. |
| `mammoth` | Extracts raw text from DOC and DOCX files. |
| Browser File API | Reads uploaded TXT files and provides PDF/DOCX array buffers. |

### Backend services and integrations

| Technology | How it is used |
| --- | --- |
| Firebase Authentication | Google account sign-in and sign-out. |
| Cloud Firestore | Stores contact messages and streams them to the admin dashboard. |
| `firebase` SDK | Connects the React app to Firebase Auth and Firestore. |
| Node.js | Runs the standalone Telegram bot. |
| `node-telegram-bot-api` | Receives Telegram messages and documents through polling. |
| `dotenv` | Loads Telegram and Gemini secrets for the bot process. |
| HTTPS/HTTP Node modules | Downloads Telegram documents before processing. |
| Vercel rewrites | Sends all frontend routes to `index.html` for client-side routing behavior. |

### Tooling and repository configuration

| Technology | How it is used |
| --- | --- |
| TypeScript compiler | `npm run lint` performs a no-emit type check. |
| PostCSS Autoprefixer | Included in the frontend toolchain for browser-compatible CSS. |
| `tsx` | Available for running TypeScript-based Node tooling when needed. |
| Express | Installed as a server dependency for future server-side extensions; the current frontend and Telegram entry point do not start an Express server. |
| `@types/node` and `@types/express` | Type definitions for Node.js and Express APIs. |

## How the Project Works

### Web application flow

1. Vite loads `src/main.tsx`, which mounts the React `App` component.
2. `App.tsx` renders the landing page, feature sections, modals, contact form, authentication controls, admin dashboard, and floating ResumeBot interface.
3. Firebase observes the current Google authentication state. Signed-in users can sign out; the configured administrator can open the message dashboard.
4. The ResumeBot collects the job description and resume text. For uploads, `pdfjs-dist` extracts PDF text and `mammoth` extracts DOC/DOCX text in the browser.
5. The app sends a structured prompt containing the job description and resume to Gemini through `@google/genai`.
6. Gemini returns JSON for the main analysis. The app validates and renders the ATS score, match percentage, skills, issues, recommendations, and summary.
7. Follow-up commands reuse the current job description and resume text to generate a rewrite, improvement tips, interview questions, or a conversational response.
8. Contact form submissions are written to Firestore. The admin dashboard subscribes to the `messages` collection in descending creation order.

### Telegram bot flow

1. `telegram-bot.cjs` loads `TELEGRAM_BOT_TOKEN` and `GEMINI_API_KEY` with `dotenv`.
2. `node-telegram-bot-api` starts polling Telegram for messages and documents.
3. A `Map` stores each chat's current step, job description, and resume text in memory.
4. Telegram files are downloaded to a temporary path. TXT files are read directly, DOC/DOCX files are parsed with `mammoth`, and PDFs are sent to Gemini for text extraction.
5. The extracted content is included in a Gemini analysis prompt. The bot parses the JSON response and formats it for Telegram, splitting long replies when necessary.
6. Once analysis is complete, the same session supports rewrite, tips, interview, new analysis, and general career questions.

## Project Structure

```text
Resume-Analyzer/
├── src/
│   ├── App.tsx                    # Main React UI, ResumeBot, feature actions, and admin dashboard
│   ├── firebase.ts                # Firebase Auth and Firestore initialization
│   ├── index.css                  # Tailwind entry point, fonts, theme, and base styles
│   └── main.tsx                   # React application entry point
├── telegram-bot.cjs               # Standalone Telegram bot
├── firebase-applet-config.json    # Firebase project configuration used by the client
├── firestore.rules                 # Firestore access and message validation rules
├── firebase-blueprint.json         # Firebase project blueprint/configuration
├── vite.config.ts                 # Vite, React, Tailwind, and Gemini environment configuration
├── vercel.json                     # Vercel SPA rewrite configuration
├── index.html                     # HTML entry document
├── metadata.json                  # App metadata
├── .env.example                   # Environment variable template
├── package.json                   # Scripts and dependencies
└── tsconfig.json                  # TypeScript compiler configuration
```

## Requirements

- Node.js 18 or newer.
- A Google Gemini API key.
- A Firebase project with Google Authentication and Cloud Firestore enabled for the web app.
- A Telegram bot token if you want to run the Telegram bot.

## Local Setup

From the repository root:

```bash
cd Resume-Analyzer
npm install
```

Create a `.env` file in `Resume-Analyzer`:

```env
GEMINI_API_KEY="your-gemini-api-key"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
APP_URL="http://localhost:3000"
```

`GEMINI_API_KEY` is required by the web app and the Telegram bot. `TELEGRAM_BOT_TOKEN` is required only for the bot. `APP_URL` is retained for hosted app configuration and is not currently used by the React entry point.

Start the web app:

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

Run the production build locally:

```bash
npm run build
npm run preview
```

Run the TypeScript check:

```bash
npm run lint
```

Start the Telegram bot in a separate terminal:

```bash
node telegram-bot.cjs
```

## Firebase Configuration

The client Firebase settings are loaded from `firebase-applet-config.json`. Before deploying your own copy, replace that configuration with the Firebase web app configuration for your project and enable:

- Google provider in Firebase Authentication.
- Cloud Firestore.
- The rules in `firestore.rules`.

The rules allow validated contact-message creation, restrict message reads to the administrator, and prevent arbitrary access to other Firestore paths. The administrator email is currently hard-coded in `src/App.tsx` and referenced by the Firestore rules, so change it before using this project for another administrator.

## Deployment Notes

The frontend is a Vite single-page application and includes a `vercel.json` rewrite so direct routes resolve to `index.html`. Configure `GEMINI_API_KEY` in the hosting provider's environment settings and configure the Firebase authorized domains for the deployed URL.

The current Vite configuration injects `GEMINI_API_KEY` into the browser bundle. This is convenient for a prototype, but a production deployment should move Gemini calls behind a server-side API or other protected backend so the key is not exposed to browsers.

The Telegram bot is a long-running polling process and should be deployed separately on a host that supports persistent Node.js processes. It is not started by the Vite build or Vercel rewrite.

## Security and Data Notes

- Do not commit `.env` or API keys.
- Telegram sessions are stored in memory and are lost when the bot restarts.
- Uploaded web files are parsed in the browser and are not uploaded to Firebase by this application.
- Resume and job-description text is sent to Gemini for analysis according to the Gemini API configuration and terms.
- Review and customize Firebase rules, administrator identity, and API-key handling before production use.

## Author

Janhvi Nigam

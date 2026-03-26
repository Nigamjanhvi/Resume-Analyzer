# SmartJobAI - AI-Powered Career Assistant 


SmartJobAI is a modern, full-stack web application designed to revolutionize the job hunting process. Leveraging state-of-the-art AI models (Google Gemini) and a robust cloud infrastructure (Firebase), it provides job seekers with intelligent tools for matching, resume optimization, and interview preparation.

Link 
https://ai-smart-job-assistant.vercel.app/

## 🚀 Features

- **Smart Job Matching:** AI-driven analysis of your skills against thousands of job postings to find the perfect fit.
- **Resume Optimization:** Automatically tailor your resume for specific job descriptions to beat ATS filters.
- **Interview Preparation:** Generate personalized practice questions and tips based on the role and company.
- **Real-time Job Alerts:** Get notified immediately when opportunities matching your profile appear.
- **Secure Authentication:** Google-powered login for a seamless and secure user experience.
- **Admin Dashboard:** Manage user inquiries and platform data efficiently.

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Motion](https://motion.dev/) (formerly Framer Motion)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend:** [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **AI Engine:** [Google Gemini AI](https://ai.google.dev/) (`@google/genai`)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase Project
- A Google AI Studio API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/smartjobai.git
   cd smartjobai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 📦 Project Structure

```text
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utility functions and configurations
│   ├── services/       # AI and Firebase service logic
│   ├── App.tsx         # Main application entry
│   ├── firebase.ts     # Firebase initialization
│   └── index.css       # Global styles and Tailwind imports
├── public/             # Static assets
├── vercel.json         # Vercel deployment configuration
└── vite.config.ts      # Vite configuration
```

## 🌐 Deployment

This project is optimized for deployment on **Vercel**.

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add the environment variables listed above in the Vercel Project Settings.
4. The `vercel.json` file handles SPA routing automatically.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
Built with ❤️ by [Anisha Suman](https://github.com/anishasuman)

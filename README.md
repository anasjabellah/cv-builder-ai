# 📄 CV Builder AI

> Turn your old CV into a stunning, professional resume — powered by AI.

CV Builder AI is a modern web application that transforms your outdated CV into a beautiful, recruiter-ready resume. Upload your old PDF or Word document, let AI extract and enhance your data, pick a style, and get a professionally designed CV in seconds.

---

## 📸 Screenshot

<img width="1903" height="954" alt="image" src="https://github.com/user-attachments/assets/8f7675e3-8e2f-4219-aa2a-c523fb4ccb8e" />

---

## ✨ Features

- 📤 **Upload Old CV** — Drag & drop your PDF or Word (.doc/.docx) resume
- 🤖 **AI-Powered Extraction** — Groq AI automatically parses your CV data
- ✏️ **Edit Everything** — Clean form to review and refine every detail (Personal Info, Experience, Education, Skills, Languages, Certifications)
- 🎨 **3 Stunning Styles** — Modern, Classic, or Creative designs with live preview thumbnails
- ⚡ **AI Generation** — Get a beautifully designed HTML CV in seconds (OpenAI GPT‑4o)
- 📄 **Export** — Download as PDF or Word document
- 🔐 **Google Login** — Firebase Auth with automatic data save/load
- 💾 **Firestore Sync** — Auto-save and auto-load CV data per user
- 🌙 **Premium Dark UI** — Sleek, modern interface built for professionals

---

## 🛠 Tech Stack

| Technology | Description |
|-------------|-------------|
| **Next.js 15** | App Router, TypeScript, Server Actions |
| **React 19** | Client-side state, hooks, modern UI |
| **Tailwind CSS v4** | Utility-first styling, dark theme |
| **Groq API** | Free, fast AI model for CV parsing |
| **OpenAI GPT‑4o** | Vision-powered design generation |
| **Firebase** | Auth (Google login), Firestore (per-user data) |
| **Puppeteer** | Generate print-ready PDF exports |
| **docx** | Generate editable Word exports |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Groq API key (free)
- Firebase project set up (for Auth & Firestore)
- OpenAI API key (for design generation)

### 1. Clone the repository
```bash
git clone https://github.com/anasjabellah/cv-builder-ai.git
cd cv-builder-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
Create a `.env` file in the project root with the following variables:

```bash
# Groq AI (required for CV parsing)
GROQ_API_KEY=your_groq_api_key_here

# OpenAI (required for CV design generation)
OPENAI_API_KEY=your_openai_api_key_here

# Firebase (required for login & data sync)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Get API keys
- **Groq**: Visit [Groq Console](https://console.groq.com) for a free API key.
- **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com) for a GPT‑4o API key.
- **Firebase**: Create a project at [Firebase Console](https://console.firebase.google.com), enable Google Auth, and copy the web app credentials.

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for AI CV parsing | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI GPT‑4o for design generation | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ Yes (for Auth) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ Yes (for Auth) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ Yes (for Auth) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ Yes (for Auth) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | ✅ Yes (for Auth) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ Yes (for Auth) |

---

## 📦 How It Works

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Upload CV  │──>│  AI Extract │──>│  Edit Form   │──>│  AI Design  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
                                                                │
                                                                v
                                                         ┌─────────────────┐
                                                         │ Export PDF/Word │
                                                         └─────────────────┘
```

1. **Upload** your old CV (PDF or Word)
2. **AI extracts** all your data automatically (Groq)
3. **Edit** any details in the clean form interface
4. **Pick a style**: Modern, Classic, or Creative (with live thumbnail previews)
5. **Generate** — AI creates a stunning CV design (OpenAI GPT‑4o)
6. **Export** as PDF or Word
7. **Login** with Google to auto-save and sync your CV data across devices

---

## 🎨 CV Styles

| Style | Description |
|-------|-------------|
| 🏙 **Modern** | Two-column layout with navy sidebar, electric blue accents |
| 📜 **Classic** | Traditional single-column, serif typography, formal design |
| 🎨 **Creative** | Bold purple gradient sidebar, modern cards, eye-catching |

---

## 📂 Project Structure

```
cv-builder-ai/
├── src/
│   ├── app/              # Next.js app router pages & API routes
│   ├── components/       # React UI components (form, preview, export)
│   ├── lib/              # AI, parsing & export logic
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── package.json
```

---

## 📄 License

MIT License — feel free to use this project for personal or commercial purposes.

---

<p align="center">
  Built with ❤️ using Next.js + Groq AI + OpenAI + Firebase
</p>

<p align="center">
  <a href="https://github.com/anasjabellah/cv-builder-ai">GitHub</a> •
  <a href="https://console.groq.com">Get Groq Key</a> •
  <a href="https://platform.openai.com">Get OpenAI Key</a> •
  <a href="https://console.firebase.google.com">Firebase Console</a>
</p>

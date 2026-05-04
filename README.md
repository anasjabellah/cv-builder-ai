# 📄 CV Builder AI

> Turn your old CV into a stunning, professional resume — powered by AI.

CV Builder AI is a modern web application that transforms your outdated CV into a beautiful, recruiter-ready resume. Upload your old PDF or Word document, let AI extract and enhance your data, pick a style, and get a professionally designed CV in seconds.

---

## 📸 Screenshot

<img width="1903" height="954" alt="image" src="https://github.com/user-attachments/assets/8f7675e3-8e2f-4219-aa2a-c523fb4ccb8e" />


---

## ✨ Features

- 📤 **Upload Old CV** — Drag & drop your PDF or Word (.doc/.docx) resume
- 🤖 **AI-Powered Extraction** — Google Gemini AI automatically parses your CV data
- ✏️ **Edit Everything** — Clean form to review and refine every detail
- 🎨 **3 Stunning Styles** — Modern, Classic, or Creative designs
- ⚡ **AI Generation** — Get a beautifully designed HTML CV in seconds
- 📄 **Export** — Download as PDF or Word document
- 🌙 **Premium Dark UI** — Sleek, modern interface built for professionals

---

## 🛠 Tech Stack

| Technology | Description |
|-------------|-------------|
| **Next.js 15** | App Router, TypeScript, Server Actions |
| **Tailwind CSS v4** | Utility-first styling, dark theme |
| **Google Gemini AI** | Free AI model for CV parsing & generation |
| **pdf-parse** | Extract text from PDF files |
| **mammoth** | Extract text from Word documents |
| **puppeteer** | Generate print-ready PDF exports |
| **docx** | Generate editable Word exports |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key (free)

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
Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Get a free API key
Visit [Google AI Studio](https://aistudio.google.com) to get your free Gemini API key.

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | ✅ Yes |

Get your free key at: https://aistudio.google.com

---

## 📦 How It Works

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Upload CV  │──>│  AI Extract │──>│ Edit Form  │──>│  AI Design  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
                                                                │
                                                                v
                                                         ┌─────────────┐
                                                         │ Export PDF/Word│
                                                         └─────────────┘
```

1. **Upload** your old CV (PDF or Word)
2. **AI extracts** all your data automatically
3. **Edit** any details in the clean form interface
4. **Pick a style**: Modern, Classic, or Creative
5. **Generate** — AI creates a stunning CV design
6. **Export** as PDF or Word

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
│   ├── components/       # React UI components
│   ├── lib/             # AI, parsing & export logic
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── package.json
```

---

## 📄 License

MIT License — feel free to use this project for personal or commercial purposes.

---

<p align="center">
  Built with ❤️ using Next.js + Google Gemini AI
</p>

<p align="center">
  <a href="https://github.com/anasjabellah/cv-builder-ai">GitHub</a> •
  <a href="https://aistudio.google.com">Get API Key</a>
</p>

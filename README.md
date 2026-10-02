# 📊 AI-Powered Data Analyst

> Turn raw CSV and Excel spreadsheets into actionable insights, automated visualizations, and intelligent AI reports instantly.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Upload your CSV or Excel (`.xlsx`) files, connect your preferred AI provider (or run 100% locally via Ollama), and get instant intelligent charts, anomaly detection, data quality audits, and natural language query answers — completely private and secure.

---

## ✨ Features

- 🧠 **AI-Powered Data Analysis** — Instant insights, anomaly detection, statistical summaries, and automated chart recommendations.
- 📊 **Smart Interactive Charts** — Dynamic visualizations powered by Recharts (Bar, Line, Area, Scatter, Pie, Radar, Composites).
- 🔒 **Privacy-First Architecture** — Your data and API keys stay local in your browser or self-hosted backend.
- 🤖 **Multi-Provider AI Support** — Native integration with **OpenAI**, **Anthropic (Claude)**, **Google Gemini**, **Mistral**, **Together AI**, and **Custom/Ollama** endpoints.
- 🦙 **100% Offline AI via Ollama** — Run local LLMs like `llama3.1` or `llama3.2` with zero API costs and total data privacy.
- 🗄️ **Supabase Integration** — Optional cloud synchronization for saved analysis results, chat history, and cloud file storage.
- 📄 **Professional PDF Reports** — Export formatted analysis reports complete with tables and insights to PDF.
- 💬 **Chat with Your Spreadsheet** — Ask natural language questions about your CSV/Excel datasets.
- 🌗 **Adaptive UI Theme** — Full support for Light, Dark, and System automatic themes.
- ⚡ **Turbopack & Monorepo Powered** — Built with Next.js 16 (App Router), React 19, and a dedicated `csv-charts-ai` workspace package.

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript 5.9 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4 + PostCSS |
| **AI SDK** | Vercel AI SDK v4 (`ai`, `@ai-sdk/*`) |
| **Database & Storage** | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| **Charts** | Recharts 3 |
| **Data Parsing** | PapaParse (CSV), `read-excel-file` (Excel) |
| **Export** | jsPDF & jsPDF-AutoTable |
| **Package Manager** | pnpm v10 (Workspace monorepo) |

---

## 📋 Prerequisites

Before setting up the project, ensure you have installed:

- **Node.js**: `v20.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **pnpm**: `v10.0.0` or higher
  ```bash
  npm install -g pnpm
  ```
- **Docker Desktop** *(Optional, for containerized running)* — [Download Docker](https://www.docker.com/)

---

## 🚀 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Tirtha2005/Ai-powered-data-analyst.git
cd Ai-powered-data-analyst
```

### 2. Install dependencies

This repository is structured as a pnpm workspace. Installing at the root sets up all packages (`csv-charts-ai` and Next.js app):

```bash
pnpm install
```

### 3. Environment Configuration

Copy `.env.example` to create your local environment file:

```bash
cp .env.example .env
```

To enable Supabase sync features, fill in your Supabase credentials in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> *Note: For basic usage and local AI processing, no environment variables are strictly required — API keys can be entered directly in the web UI.*

### 4. Run the development server

```bash
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 Project Structure

```
.
├── src/
│   ├── app/                    # Next.js 16 App Router pages and API endpoints
│   │   ├── _components/        # UI Components (Charts, Tables, FileUpload, AI Views)
│   │   ├── api/                # Streaming AI proxy & Supabase API routes
│   │   ├── legal/              # Privacy & Terms pages
│   │   └── page.tsx            # Application entrypoint
│   ├── lib/                    # Core application logic & utilities
│   │   ├── supabase/           # Supabase client, services & migrations
│   │   ├── ai-service.ts       # Unified multi-provider AI engine
│   │   ├── csv-parser.ts       # Robust CSV stream parser
│   │   └── pdf-export.ts       # Report generation utility
│   └── styles/                 # Global styling and CSS variables
│
├── packages/
│   └── csv-charts-ai/          # Standalone workspace package for chart AI & data parsing
│
├── supabase/
│   └── migrations/             # Database SQL schema & storage policies
│
├── public/                     # Static icons, models, and assets
├── Dockerfile                  # Multi-stage production build container
├── docker-compose.yml          # Container orchestration config
└── package.json                # Root workspace configuration
```

---

## 🐳 Docker Setup

### Option 1: Docker Compose (Recommended)

Start the production container using Docker Desktop or Docker CLI:

```bash
docker-compose up --build -d
```

Access the application at **[http://localhost:3000](http://localhost:3000)**.

To stop the container:

```bash
docker-compose down
```

### Option 2: Docker CLI

```bash
# Build Docker image
docker build -t ai-powered-data-analyst .

# Run container
docker run -p 3000:3000 ai-powered-data-analyst
```

---

## 🦙 Running Free Local AI (Ollama + Llama 3)

Run complete AI analysis offline on your computer without sharing data or paying API fees.

### Step 1: Install Ollama

- **macOS / Linux:**
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```
- **Windows:** Download from [ollama.com/download](https://ollama.com/download)

### Step 2: Download Model

```bash
# Recommended for laptops (Requires ~8 GB RAM)
ollama pull llama3.1

# Lightweight alternative for lower RAM (~4 GB RAM)
ollama pull llama3.2
```

### Step 3: Start Ollama Server

```bash
ollama serve
```

### Step 4: Configure App UI

1. Open the app at **[http://localhost:3000](http://localhost:3000)**
2. Click the ⚙️ **Settings** button in the top right header.
3. Choose **Custom / Self-hosted (OpenAI Compatible)**.
4. Input settings:
   - **Base URL:** `http://localhost:11434/v1`
   - **API Key:** `ollama` *(any string)*
   - **Model Name:** `llama3.1` (or `llama3.2`)
5. Click **Save Configuration**.

---

## 🧪 Testing & Code Quality

```bash
# Run unit tests (Vitest)
pnpm test

# Run all workspace unit tests
pnpm test:all

# Run End-to-End browser tests (Playwright)
pnpm test:e2e

# Run linter
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Check TypeScript types
pnpm typecheck

# Format codebase
pnpm format:write
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

# AI-powered Data Analyst

> Turn raw spreadsheets into actionable insights instantly.

Upload your CSV or Excel (.xlsx) files, connect your preferred AI provider, and instantly get intelligent charts, anomaly detection, and natural language insights — completely privately in your browser.

---

## ✨ Features

- 🧠 **AI-Powered Analysis** — Get instant insights, anomaly detection, and chart suggestions from your data.
- 📊 **Smart Chart Generation** — Automatically generates beautiful interactive charts via Recharts.
- 🔐 **Privacy-First** — Your data and API keys never leave your browser unless you explicitly call an AI endpoint. Keys are stored in your browser's local storage.
- 🤖 **Multiple AI Providers** — Works with OpenAI, Anthropic (Claude), Google Gemini, Mistral, Together AI, and any OpenAI-compatible custom endpoint.
- 📄 **PDF Export** — Download full analysis reports as professional PDF files.
- 💬 **Chat with your Data** — Ask natural language questions about your CSV/Excel data.
- 🌗 **Dark / Light Mode** — Fully themed with cookie-persisted dark/light/auto preference.
- ⚡ **Blazing Fast** — Built with Next.js 16 (App Router + Turbopack) and React 19.

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 + CSS Variables |
| AI SDK | Vercel AI SDK v4 |
| Charts | Recharts |
| CSV Parsing | PapaParse |
| Excel Parsing | read-excel-file |
| PDF Export | jsPDF |
| Package Manager | pnpm (v10) |

---

## 📋 Prerequisites

Make sure you have the following installed before starting:

- **Node.js** v20 or higher — [Download here](https://nodejs.org/)
- **pnpm** v10 or higher — Install with:
  ```bash
  npm install -g pnpm
  ```

---

## 🚀 Local Development Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Install dependencies

This project is a monorepo. A single `pnpm install` installs all dependencies for both the web app and the internal `csv-charts-ai` package.

```bash
pnpm install
```

### 3. Set up environment variables (optional)

Copy the example env file. For most features, no environment variables are needed — API keys are entered directly in the browser UI.

```bash
cp .env.example .env
```

### 4. Start the development server

```bash
pnpm dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

The dev server uses **Turbopack** for fast hot-reloading. On first run, it also builds the internal `csv-charts-ai` workspace package automatically.

---

## 📁 Project Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router pages & layouts
│   │   ├── _components/        # UI components (charts, landing page, settings, etc.)
│   │   ├── api/                # Next.js API routes (AI streaming)
│   │   ├── legal/              # Legal & privacy page
│   │   └── page.tsx            # Main application page
│   ├── lib/                    # Shared utilities (AI service, CSV parser, chat store, PDF export)
│   └── styles/
│       └── globals.css         # Global CSS with Tailwind v4 + theme variables
│
├── packages/
│   └── csv-charts-ai/          # Core standalone package: AI analysis, chart logic, XLSX parsing
│
├── public/                     # Static assets
├── scripts/                    # Build & utility scripts
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Docker Compose for easy deployment
├── next.config.js              # Next.js configuration
└── package.json                # Root workspace manifest
```

---

## 🐳 Docker Deployment

A production-ready **multi-stage Dockerfile** is included. It uses Node 24 Alpine and runs the app as a non-root user.

### Using Docker Compose (Recommended)

```bash
# Build the image and start the container in the background
docker-compose up --build -d
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

### Using Docker directly

```bash
# Build the image
docker build -t ai-data-analyst .

# Run the container
docker run -p 3000:3000 ai-data-analyst
```

### Passing API Keys via Docker (Optional)

```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key_here \
  -e ANTHROPIC_API_KEY=your_key_here \
  -e GOOGLE_GENERATIVE_AI_API_KEY=your_key_here \
  ai-data-analyst
```

---

## 🧪 Testing & Linting

```bash
# Run all unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run end-to-end tests (Playwright)
pnpm test:e2e

# Run all tests (package + app)
pnpm test:all

# Lint the codebase
pnpm lint

# Auto-fix lint & formatting issues
pnpm lint:fix

# Check TypeScript types
pnpm typecheck

# Check formatting
pnpm format:check

# Auto-format code
pnpm format:write
```

---

## 🔑 AI Provider Setup

No environment variables are required. API keys are configured directly inside the app through the **Settings panel**.

Supported providers:
- **OpenAI** — GPT-4o, GPT-4, GPT-3.5-turbo, etc.
- **Anthropic** — Claude 3.5 Sonnet, Claude 3 Haiku, etc.
- **Google** — Gemini 1.5 Pro, Gemini Flash, etc.
- **Mistral** — Mistral Large, Mistral 8x7B, etc.
- **Together AI** — Llama 3, Mixtral, etc.
- **Custom / Self-hosted** — Any OpenAI-compatible endpoint (e.g., Ollama, LM Studio).

---

## 🦙 Running Llama 3 Locally (Free & Private)

You can run **Llama 3 completely offline and for free** on your own machine using [Ollama](https://ollama.com). This means zero API costs and 100% private — no data ever leaves your computer.

### Step 1 — Install Ollama

**macOS / Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download and run the installer from [https://ollama.com/download](https://ollama.com/download)

Verify the installation:
```bash
ollama --version
```

---

### Step 2 — Download the Llama 3 Model

Choose the version that fits your machine's RAM:

```bash
# Llama 3.2 3B — Lightweight, great for low-RAM machines (~4 GB RAM)
ollama pull llama3.2

# Llama 3.1 8B — Recommended for most laptops (requires ~8 GB RAM)
ollama pull llama3.1

# Llama 3 8B — Stable older release
ollama pull llama3

# Llama 3 70B — Most powerful, requires ~40 GB RAM
ollama pull llama3:70b
```

> 💡 **Not sure which to pick?** Use `llama3.1` on modern laptops (8 GB+ RAM) and `llama3.2` on older or low-RAM machines.

---

### Step 3 — Start the Ollama Server

```bash
ollama serve
```

This starts a local API server at `http://localhost:11434`. Keep this terminal open and running.

Verify it is working by opening a second terminal:
```bash
curl http://localhost:11434
# Expected response: Ollama is running
```

---

### Step 4 — Test Llama 3 in Your Terminal (Optional)

Chat with Llama 3 directly from your terminal before connecting it to the app:

```bash
ollama run llama3.1
```

Type your message and press **Enter**. Type `/bye` or press **Ctrl+D** to exit.

---

### Step 5 — Connect Llama 3 to This App

1. Open the app at [http://localhost:3000](http://localhost:3000)
2. Click the ⚙️ **Settings** icon (top-right corner)
3. Select **"Custom / Self-hosted"** as the AI provider
4. Fill in the following values:

   | Field | Value |
   |-------|-------|
   | **Base URL** | `http://localhost:11434/v1` |
   | **API Key** | `ollama` *(any non-empty string works)* |
   | **Model Name** | `llama3.1` *(or whichever model you pulled)* |

5. Click **Save** — you're done! 🎉

The app will now send all AI requests to your local Llama 3 instance.

---

### Quick Reference — Common Ollama Commands

```bash
# List all models you have downloaded
ollama list

# Download a model
ollama pull llama3.1

# Run a model interactively in your terminal
ollama run llama3.1

# Check which models are currently loaded/running
ollama ps

# Show detailed info about a model
ollama show llama3.1

# Remove a model to free up disk space
ollama rm llama3

# Stop the Ollama background service (Linux)
sudo systemctl stop ollama

# View live Ollama server logs (Linux)
journalctl -u ollama -f
```

---

### Troubleshooting Ollama

| Problem | Solution |
|---------|----------|
| `connection refused` on port 11434 | Run `ollama serve` in a separate terminal first |
| App shows "model not found" | Run `ollama pull llama3.1` to download the model |
| Very slow responses | Use a smaller model like `llama3.2` or `phi3:mini` |
| App crashes / out of memory | Switch to a smaller model and close other apps |
| CORS error in browser | Ollama already allows localhost — no extra config needed |

---

## 📜 License

MIT

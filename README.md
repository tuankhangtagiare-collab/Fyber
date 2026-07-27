# Fyber

Fyber is a production-grade, highly sophisticated AI Agent Workspace designed for the web. It is built as a complete AI agent workspace with planning, tool use, structured reasoning, multimodal capabilities, session branching, project organization, and secure provider routing.

## 🚀 Features
- **Local-First Architecture:** Uses Dexie.js (IndexedDB) and Zustand for lightning-fast, offline-capable local storage of your projects, sessions, and messages.
- **Provider Agnostic Agent Loop:** Connects to powerful models like **Qwen Max** and **DeepSeek v4 Pro (VenesusAI)** through a unified server-side proxy, safely keeping API keys hidden.
- **5-Tiered Thinking System:** From "Thinking Off" up to "Thinking Max", dynamically tuning the system prompts and enabling internal chain-of-thought routing.
- **Skill Engine:** Toggle distinct agent behaviors (Vision, Docs, Code Writer, Web Reasoning, Video Gen) which hot-swap the agent's internal prompt configuration.
- **Multimodal Built-In:** Proxies standard requests for Image Generation and Video Generation, ready for expansion.
- **Session Branching:** Create parallel conversational universes instantly by clicking "Branch from here" on any message block.
- **Command Palette:** Press `Cmd+K` from anywhere in the application to instantly create projects, sessions, or wipe your workspace clean.
- **Quota Management:** Tracks anonymous users natively using Prisma and automatically throttles usage on the backend.

## 📦 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Prisma (Postgres/SQLite) + Dexie (IndexedDB local fallback)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **State:** Zustand

## 🔧 Getting Started

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   Create a `.env` file and populate:
   ```env
   QWEN_API_KEY=your_key
   VENESUS_API_KEY=your_key
   DATABASE_URL=file:./dev.db
   ```

3. **Initialize Database**
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

## ☁️ Deployment (Railway)
This project is configured out-of-the-box for [Railway](https://railway.app). It utilizes a `Dockerfile` customized for Next.js `standalone` mode, drastically reducing image size, and a `railway.json` configuration file. Just connect the repository to Railway and it will deploy instantly.

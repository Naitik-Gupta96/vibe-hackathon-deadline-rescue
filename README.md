# Deadline Rescue Agent 🦸

**Vibe2Ship Hackathon 2026** — *Coding Ninjas × Google for Developers*

A proactive AI-powered productivity companion that predicts deadline failure risk, learns your behavioral patterns, and autonomously rescues your schedule.

### Problem Statement: The Last-Minute Life Saver

## Quick Start

```bash
# 1. Set your API key
echo "GOOGLE_API_KEY=your_key_here" > .env

# 2. Run with Docker
docker compose up --build

# 3. Open http://localhost:8080
```

## Architecture

| Layer | Tech |
|-------|------|
| **Backend** | FastAPI + Python 3.11 + google-genai SDK |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **AI** | Gemini 2.5 Flash (function calling, search grounding) |
| **Services** | Mock Calendar + Mock Memory (swap for real APIs later) |
| **Infra** | Docker → Google Cloud Run |

## Agents

- **Planner** — Failure prediction (0-100%) + task breakdown
- **Research** — Google Search grounding (traffic, weather, venues)
- **Reflection** — Energy/burnout/context-switch optimization
- **Scheduler** — Calendar mutation (with user approval gate)

## Submission

- [ ] Google Cloud Run URL
- [ ] GitHub repository
- [ ] Google Doc (see SUBMISSION_DOC.md)

# Deadline Rescue Agent - Vibe2Ship Hackathon Submission

---

## Problem Statement Selected
**The Last-Minute Life Saver** — An AI-powered productivity companion that proactively assists users in planning, prioritizing, and completing tasks before deadlines are missed.

---

## Solution Overview

The **Deadline Rescue Agent** is not just another reminder app — it's a proactive, multi-agent AI system that rescues users from failing schedules. Instead of passively waiting for instructions, it:

1. **Predicts Failure** — Analyzes your calendar and declares "89% chance you'll miss this deadline" with itemized root causes
2. **Learns Your Habits** — Tracks behavioral patterns (skipping 8AM blocks, underestimating coding tasks by 45%, working best late at night)
3. **Checks Reality** — Uses Google Search grounding to verify live traffic, weather, and venue hours
4. **Auto-optimizes** — Removes low-priority conflicts, reschedules intelligently, creates focus blocks
5. **Asks Permission** — Presents the rescue plan to the user with a single "Approve & Execute" button
6. **Executes Autonomously** — Mutates the calendar in real-time after approval

The system uses a **Multi-Agent Swarm** architecture:
- **Planner Agent** — Failure prediction engine + task breakdown
- **Research Agent** — Google Search grounding for live constraints
- **Reflection Agent** — Energy/burnout/context-switch optimization with behavioral memory
- **Scheduler Agent** — Calendar mutation executor (with human approval gate)

All agent thoughts are streamed to the frontend in real-time via WebSockets, visually proving "Agentic Depth" to judges.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Failure Prediction Engine** | Real-time probability score (0-100%) with itemized risk breakdown (coding workload, travel, meetings, sleep deficit, context switching) |
| **Behavioral Memory** | Learns user patterns (skips morning blocks, underestimates coding, preferred late-night focus) and factors them into every rescue plan |
| **Google Search Grounding** | Live traffic, weather, venue hours for accurate estimates — no hallucinated data |
| **Multi-Agent Swarm** | Planner → Research → Reflection → Scheduler with human approval gate |
| **Real-time Agentic UI** | Streaming "thought logs" proving autonomous reasoning (critical for Agentic Depth score) |
| **One-click "Rescue My Day"** | Single button triggers full analysis → planning → approval → execution |
| **Calendar Integration** | Mock calendar with real Google Calendar API interface ready for OAuth swap |

---

## Technologies Used

### Backend
- **Python 3.11** + **FastAPI** — Core orchestration engine with WebSocket streaming
- **google-genai SDK (GA)** — Gemini 2.5 Flash, chat sessions, automatic function calling
- **Google Search Grounding** — Live factual data via `types.GoogleSearch()`
- **Pydantic v2** — Type-safe schema validation
- **Docker** — Multi-stage containerization

### Frontend
- **React 18** + **TypeScript** — Responsive single-page application
- **Vite** — Fast build tooling
- **Tailwind CSS 3** — Dark-mode optimized UI
- **WebSocket** — Real-time bi-directional streaming

### Google Technologies Utilized
- **Gemini API (google-genai SDK)** — Core AI reasoning, function calling, multi-agent orchestration
- **Google AI Studio** — Build Mode with Antigravity Agent for streamlined deployment
- **Google Cloud Run** — Managed container hosting via Serverless deployment
- **Firebase Authentication** — User identity management (ready for integration)
- **Cloud Firestore** — Behavioral memory persistence (ready for integration)
- **Google Calendar API** — Schedule mutation interface (ready for OAuth integration)
- **Google Search Grounding** — Real-world factual data verification

---

## Architecture

```
┌─────────────┐   WebSocket    ┌───────────────────────────────────┐
│  React UI   │ ◄────────────► │          FastAPI Backend          │
│  (Vite + TS │                │                                   │
│   Tailwind) │                │  ┌────────┐  ┌────────┐           │
└─────────────┘                │  │Planner │  │Research│           │
                               │  │ Agent  │  │ Agent  │           │
   Cloud Run                   │  └────┬───┘  └────┬───┘           │
   (Container)                 │       │           │               │
                               │  ┌────┴───────────┴───┐           │
                               │  │  Reflection Agent  │           │
                               │  └────┬───────────────┘           │
                               │       │                           │
                               │  ┌────┴───────────────┐           │
                               │  │  Scheduler Agent    │           │
                               │  │  (with Approval)   │           │
                               │  └────┬───────────────┘           │
                               │       │                           │
                               │  ┌────┴───────────────┐           │
                               │  │  Mock Calendar/     │           │
                               │  │  Memory Services   │           │
                               │  └────────────────────┘           │
                               └───────────────────────────────────┘
```

---

## GitHub Repository
[Link to be inserted after push]

---

## Deployed Application
[Link to be inserted after AI Studio deployment]

---

## Credits

- **google-genai Python SDK** (Apache 2.0) — https://github.com/googleapis/python-genai
- **FastAPI** (MIT) — https://github.com/fastapi/fastapi
- **React** (MIT) — https://github.com/facebook/react
- **Vite** (MIT) — https://github.com/vitejs/vite
- **Tailwind CSS** (MIT) — https://github.com/tailwindlabs/tailwindcss
- **Pydantic** (MIT) — https://github.com/pydantic/pydantic
- All code written for this submission is original and created specifically for the Vibe2Ship hackathon.

---

## Setup Instructions

```bash
# 1. Clone the repo
git clone <repo-url>
cd Vibe_Hackathon

# 2. Create .env with your API key
echo "GOOGLE_API_KEY=your_key_here" > .env

# 3. Run with Docker
docker compose up --build

# Or run manually:
# Backend: uvicorn backend.main:app --host 0.0.0.0 --port 8000
# Frontend: cd frontend && npx vite build
```

---

*Submitted for Vibe2Ship Hackathon 2026 by Coding Ninjas × Google for Developers*

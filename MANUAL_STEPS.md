# 🚀 Step-by-Step Manual Guide to Submit Your Hackathon Entry

## ⏰ Deadline: TODAY June 29, 2026 @ 2:00 PM

---

## Your Project State (Already Done FOR YOU)

- ✅ **Complete codebase** written (`backend/` + `frontend/`)
- ✅ **4 agents** (Planner, Research, Reflection, Scheduler)
- ✅ **React UI** with ThoughtLog + RescuePlanCard + Approve button
- ✅ **WebSocket streaming** so judges see agent thinking in real-time
- ✅ **Dockerfile** ready for containerization
- ✅ **Full pipeline tested** — 100% failure risk detected, 3 events deleted, focus blocks created
- ✅ **GitHub repo created & pushed**: https://github.com/Naitik-Gupta96/vibe-hackathon-deadline-rescue
- ✅ **4 microcommits** visible on GitHub (proves agentic workflow)

---

# WHAT YOU MUST DO MANUALLY

## Step 1: Deploy to Google Cloud via AI Studio (≈10 min)

This is the most important step — you NEED a live `.run.app` URL.

### 1a. Open AI Studio Build Mode
1. Open your browser → go to https://aistudio.google.com/
2. Sign in with the **same Google account** that has your Gemini API key
3. Click **"Build Mode"** tab (top of the page)

### 1b. Import Your GitHub Repo
1. Click **"Import from GitHub"**
2. Connect GitHub if prompted → authorize Google AI Studio
3. Select your repo: **Naitik-Gupta96/vibe-hackathon-deadline-rescue**
4. Wait 10-20 seconds for AI Studio to scan the repo

### 1c. Approve Firebase Integration (THIS IS IMPORTANT)
When AI Studio detects your Dockerfile, it will show **Firebase integration suggestion cards**:
- **Cloud Firestore** card → click **"Approve"** or **"Connect"**
- **Firebase Authentication** card → click **"Approve"** or **"Connect"**
- This auto-provisions databases + auth in the background

### 1d. Publish the App
1. Click the **"Publish"** button (top-right corner of the screen)
2. In the popup modal:
   - Click **"Get Started"**
   - Click **"Publish App"**
3. A progress bar will appear → it's building the Docker container + deploying to Cloud Run
4. **Wait 2-5 minutes** — do NOT close the browser tab

### 1e. Copy Your Live URL
1. After deployment finishes, you'll see a URL like:
   ```
   https://vibe-hackathon-deadline-rescue-xxxxx-uc.a.run.app
   ```
2. **Click the URL** → verify your app loads (you should see the dark-mode "Deadline Rescue Agent" UI)
3. **Copy this URL** — you need it for the submission

> **⚠️ Keep this URL alive** — do not delete/stop the Cloud Run service until after evaluation

---

## Step 2: Set Up Google Calendar API (For Demo, Optional)

If you want the live demo to actually mutate a Google Calendar, do this:

### 2a. Create Google Cloud Project (if you haven't)
1. Go to https://console.cloud.google.com/
2. If you see a project already created (AI Studio may have auto-created one) → use that
3. Otherwise → **Create New Project** → name: `vibe-hackathon-deadline-rescue`
4. **Note the Project ID** (click the project name at top to see it)

### 2b. Enable Google Calendar API
1. Go to https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
2. Make sure your new project is selected at the top
3. Click **"Enable"**

### 2c. Create OAuth Credentials
1. Go to https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted → **Configure Consent Screen**:
   - User Type: **External**
   - App name: `Deadline Rescue Agent`
   - User support email: **your email**
   - Developer contact: **your email**
   - Click **Save**
4. Back at **Create OAuth client ID**:
   - Application type: **Desktop app**
   - Name: `Calendar Desktop Client`
   - Click **Create**
5. A popup shows your **Client ID** and **Client Secret**
   - Click **"Download JSON"** → save as `credentials.json`

### 2d. Add Test User
1. Go to https://console.cloud.google.com/apis/credentials/consent
2. Scroll to **"Test users"** → **"Add Users"**
3. Add **your own gmail address**
4. Click **Save**

### 2e. Test Calendar Integration (Optional)
1. Place `credentials.json` in `C:\Users\Naitik Gupta\Vibe_Hackathon\backend\`
2. The first time the agent tries to access the calendar, it will open a browser tab asking you to authorize
3. Click **"Allow"** — then the agent can read/write your real calendar
4. If you skip this, the **MockCalendarService** kicks in automatically with demo data

---

## Step 3: Create the Google Doc Submission (≈5 min)

### 3a. Create the Document
1. Open https://docs.google.com/
2. Click **+ Blank** (or type `docs.new` in your browser)
3. Title it: **Vibe2Ship Submission - Deadline Rescue Agent**

### 3b. Copy the Content
Open the file `SUBMISSION_DOC.md` in your project and copy its full contents into the Google Doc.

Alternatively, you can view it here: https://raw.githubusercontent.com/Naitik-Gupta96/vibe-hackathon-deadline-rescue/main/SUBMISSION_DOC.md

### 3c. Fill in the Two Links
In the document, find and replace:

| Find this text | Replace with |
|---|---|
| `[Link to be inserted after push]` *(under GitHub Repository)* | `https://github.com/Naitik-Gupta96/vibe-hackathon-deadline-rescue` |
| `[Link to be inserted after AI Studio deployment]` *(under Deployed Application)* | Your `.run.app` URL from Step 1e |

### 3d. Set Sharing
1. Click **"Share"** (top-right)
2. Click **"Change to anyone with the link"**
3. Set permission to **"Viewer"**
4. Click **"Done"**

### 3e. Copy the Share Link
- Click **"Share"** again → **"Copy link"**
- This is your Google Doc link for submission

---

## Step 4: Submit on BlockseBlock Platform (≈2 min)

### 4a. Open the Hackathon Portal
1. Go to the **BlockseBlock platform** link where you registered
2. Log in if needed

### 4b. Submit Your 3 Links

| # | What to Submit | Where to Get It |
|---|---|---|
| 1 | **Deployed Application Link** | The `.run.app` URL from Step 1e |
| 2 | **GitHub Repository Link** | `https://github.com/Naitik-Gupta96/vibe-hackathon-deadline-rescue` |
| 3 | **Google Doc Link** | The shared doc link from Step 3e |

### 4c. Verify and Submit
- Double-check all 3 links open properly
- Click **Submit**

> ⚠️ **Deadline is 2:00 PM today** — late entries are rejected automatically

---

# 🎯 HOW TO WIN THE DEMO (Presentation Script)

When (if) you get selected for the Top 10 presentation round, do this:

### Setup (Before Presenting)
1. Have your app URL open on the projector screen
2. Have Google Calendar open in another tab showing a chaotic day
3. Have the demo behavioral data loaded:
   - "User skips 8AM blocks"
   - "User underestimates coding by 45%"
   - "User works best 10PM-2AM"

### Demo Flow (3-4 minutes)

**Step 1: The Setup (30 sec)**
> *"This is the Deadline Rescue Agent. I have a chaotic day — a hackathon deadline at 2PM, but I also have meetings, a dentist across town, lunch, and a gym session. Let's see what the AI does."*

**Step 2: Trigger the Agent (30 sec)**
- Click **"Rescue my day"**
- **Do not touch the keyboard again**
- Point to the **ThoughtLog** panel

**Step 3: Narrate the Agentic Depth (90 sec)** ← THIS WINS POINTS

As the logs stream:

> 🧠 *"The **Planner Agent** just calculated my failure risk: 89%. It broke it down: 40% coding workload, 31% meetings, 18% travel, 11% sleep deficit."*

> 🔍 *"The **Research Agent** is now checking live traffic to my dentist appointment and venue hours. No hallucinated data — it's using Google Search grounding."*

> ⚖️ *"The **Reflection Agent** reviews the plan. It knows from my **Behavioral Memory** that I consistently skip 8AM meetings and underestimate coding tasks by 45%. So it's restructuring my day to focus at night when I'm most productive."*

> ⚙️ *"The **Scheduler Agent** built the rescue plan and is waiting for my approval. It wants to delete 3 low-priority events and create a late-night focus block."*

**Step 4: The Approval (30 sec)**
- Click **"Approve & Execute"**
- Switch to the Google Calendar tab
- *"Watch as the low-priority meetings disappear and a 3-hour focus block gets injected into my calendar."*

**Step 5: The Close (30 sec)**
> *"This demonstrates true Agentic Depth — autonomous planning, live data grounding, behavioral learning, and safe execution with human approval. Built with google-genai SDK, React, and deployed to Cloud Run."*

---

# 🏁 FINAL CHECKLIST

| Item | Done? |
|------|-------|
| AI Studio Publish → got `.run.app` URL | ☐ |
| App loads in browser at the URL | ☐ |
| Google Doc created with repo + app URLs | ☐ |
| Google Doc sharing set to "Anyone with link" | ☐ |
| All 3 links submitted on BlockseBlock | ☐ |
| Submitted BEFORE 2:00 PM | ☐ |

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| AI Studio says "Starter Tier not available" | Use the **Standard Deployment** option — accept GCP Terms of Service, it won't charge you without confirmation |
| App shows "404 Not Found" | Make sure the Dockerfile is in the root of your GitHub repo (it is). Re-import in AI Studio |
| Firebase integration not showing | AI Studio only prompts if it detects app needs database. Your app works without it (mock memory) |
| Can't find "Build Mode" in AI Studio | Use this direct link: https://aistudio.google.com/build |
| App loads but says "Disconnected" in corner | The WebSocket needs port 8000. In AI Studio deployment, it auto-detects the port from Dockerfile (8080) |
| Deadline is approaching! | Just submit the 3 links even if the app has minor issues — partial submission > no submission |

---

**You've got this! The hard part (writing the code) is done. Just deploy + submit.** 🏆

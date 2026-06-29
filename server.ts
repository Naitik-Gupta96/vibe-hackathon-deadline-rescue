import "dotenv/config"
import express from "express"
import http from "http"
import path from "path"
import { WebSocketServer, WebSocket } from "ws"
import { GoogleGenAI } from "@google/genai"
import { PlannerAgent } from "./server/agents/planner"
import { ResearchAgent } from "./server/agents/research"
import { ReflectionAgent } from "./server/agents/reflection"
import { SchedulerAgent } from "./server/agents/scheduler"
import { MockCalendarService } from "./server/services/calendarService"
import { MockMemoryService } from "./server/services/memoryService"
import { RescuePlan, ThoughtEntry } from "./server/types"

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: "/ws/chat" })

const PORT = parseInt(process.env.PORT || "3000", 10)

// --- Initialize services & agents ---
const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
const calendarService = new MockCalendarService()
const memoryService = new MockMemoryService()
const planner = new PlannerAgent(client)
const research = new ResearchAgent(client)
const reflection = new ReflectionAgent(client)
const scheduler = new SchedulerAgent(calendarService)

// --- Middleware ---
app.use(express.json())

// Serve built React frontend
const frontendDist = path.resolve(__dirname, "..", "frontend", "dist")
app.use(express.static(frontendDist))

// --- REST endpoints ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() })
})

// --- WebSocket handler ---
wss.on("connection", (ws: WebSocket) => {
  const userMessages: any[] = []
  let pendingPlan: RescuePlan | null = null
  const userId = "demo-user"

  const send = (msg: any) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
    }
  }

  const addThought = async (agent: string, message: string, status = "thinking"): Promise<ThoughtEntry> => {
    const thought: ThoughtEntry = { agent, message, status }
    send({ type: "agent_thought", payload: thought, timestamp: new Date().toISOString() })
    return thought
  }

  send({
    type: "agent_thought",
    payload: { agent: "system", message: "Deadline Rescue Agent ready. Describe your critical deadline or say 'Rescue my day'.", status: "complete" },
    timestamp: new Date().toISOString(),
  })

  ws.on("message", async (raw) => {
    try {
      const data = JSON.parse(raw.toString())
      const msgType = data.type || "user_message"
      const payload = data.payload || {}

      if (msgType === "user_message") {
        const text = (payload.text || "").toString().toLowerCase()

        if (["approve", "approve & execute", "approve and execute"].includes(text)) {
          if (pendingPlan) {
            await addThought("scheduler", "Executing rescue plan on your calendar...")
            const result = await scheduler.executeRescuePlan(pendingPlan)
            send({ type: "execution_result", payload: { result, message: result.success ? `Rescue executed! Deleted ${result.deleted_events.length} events, created ${result.created_events.length} focus blocks.` : "Execution had errors." }, timestamp: new Date().toISOString() })
            pendingPlan = null
          }
          return
        }

        // Run the full pipeline
        await addThought("planner", "Loading calendar events and analyzing schedule...")
        const events = await calendarService.getEvents(7)
        await addThought("planner", `Found ${events.length} upcoming events. Calculating failure probability...`)
        const habits = await memoryService.getHabits(userId)

        const failurePrediction = await planner.analyzeFailureRisk(events, habits, text)
        await addThought("planner", `Failure prediction complete: ${failurePrediction.probability}% risk`, "complete")

        await addThought("research", "Checking external constraints: traffic, weather, venue hours...")
        const constraints = await research.checkExternalConstraints(events)
        await addThought("research", `Found ${Object.keys(constraints.traffic_minutes).length} location constraints`, "complete")

        await addThought("reflection", "Reviewing plan for feasibility, energy distribution, and burnout risk...")
        const optimizedPlan = await reflection.optimize(events, failurePrediction, constraints, habits)
        await addThought("reflection", `Optimization complete. Burnout risk: ${optimizedPlan.burnout_risk}%. Context switches: ${optimizedPlan.context_switches}`, "complete")

        await addThought("scheduler", "Building rescue plan with proposed schedule...")
        const rescuePlan = await scheduler.buildRescuePlan(events, failurePrediction, constraints, optimizedPlan)
        pendingPlan = rescuePlan
        await addThought("scheduler", "Rescue plan ready. Awaiting your approval...", "complete")

        send({ type: "plan_ready", payload: { rescue_plan: rescuePlan, message: "Rescue plan is ready. Review and click 'Approve & Execute' to implement." }, timestamp: new Date().toISOString() })
      }

      if (msgType === "approval") {
        if (pendingPlan) {
          await addThought("scheduler", "Executing rescue plan on your calendar...")
          const result = await scheduler.executeRescuePlan(pendingPlan)
          send({ type: "execution_result", payload: { result, message: result.success ? `Rescue executed! Deleted ${result.deleted_events.length} events, created ${result.created_events.length} focus blocks.` : "Execution had errors." }, timestamp: new Date().toISOString() })
          pendingPlan = null
        }
      }
    } catch (e: any) {
      send({ type: "error", payload: { message: `Error: ${e.message}` }, timestamp: new Date().toISOString() })
    }
  })
})

// Fallback to index.html for SPA routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"))
})

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Deadline Rescue Agent running on http://0.0.0.0:${PORT}`)
})

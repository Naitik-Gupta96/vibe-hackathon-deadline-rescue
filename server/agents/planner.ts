import { GoogleGenAI } from "@google/genai"
import { CalendarEvent, FailurePrediction, FailureBreakdown, UserHabits } from "../types"

export class PlannerAgent {
  private client: GoogleGenAI

  constructor(client: GoogleGenAI) {
    this.client = client
  }

  async analyzeFailureRisk(events: CalendarEvent[], habits: UserHabits, userGoal: string): Promise<FailurePrediction> {
    const eventsSummary = events.map(e =>
      `- ${e.summary}: ${e.start.toLocaleTimeString()} → ${e.end.toLocaleTimeString()}`
    ).join("\n")

    const prompt = `You are a Deadline Rescue Planner AI. Your job is to analyze a user's calendar and calculate the probability they will miss their critical deadline.

User Goal: ${userGoal}
User Habits:
- Skips morning blocks: ${habits.skips_morning_blocks}
- Underestimates coding tasks by: ${habits.underestimates_coding_minutes}%
- Preferred focus hours: ${habits.preferred_focus_hours}
- Average meeting overrun: ${habits.avg_meeting_overrun_minutes} min

Current Schedule:
${eventsSummary}

Analyze the schedule and return a JSON object with:
1. "probability": 0-100 integer failure risk score
2. "breakdown": object with percentages for "coding_workload", "travel", "meetings", "sleep_deficit", "context_switching", "other"
3. "explanation": brief explanation of the risk
4. "critical_path": list of critical items that must happen for success

Return ONLY valid JSON. No markdown, no code blocks, no explanation outside the JSON.`

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      })
      let text = response.text?.trim() || "{}"
      if (text.startsWith("```")) text = text.split("\n").slice(1).join("\n").replace(/```/g, "").trim()
      const data = JSON.parse(text)
      return {
        probability: data.probability ?? 50,
        breakdown: data.breakdown as FailureBreakdown,
        explanation: data.explanation ?? "",
        critical_path: data.critical_path ?? [],
      }
    } catch (e) {
      return {
        probability: 50,
        breakdown: { coding_workload: 0, travel: 0, meetings: 0, sleep_deficit: 0, context_switching: 0, other: 0 },
        explanation: `Error during analysis: ${e}`,
        critical_path: ["Complete analysis manually"],
      }
    }
  }
}

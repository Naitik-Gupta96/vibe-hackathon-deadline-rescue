import { GoogleGenAI } from "@google/genai"
import { CalendarEvent, FailurePrediction, ExternalConstraints, UserHabits, OptimizedPlan, Task } from "../types"

export class ReflectionAgent {
  private client: GoogleGenAI

  constructor(client: GoogleGenAI) {
    this.client = client
  }

  async optimize(events: CalendarEvent[], failurePrediction: FailurePrediction, constraints: ExternalConstraints, habits: UserHabits): Promise<OptimizedPlan> {
    const eventsSummary = events.map(e =>
      `- ${e.summary}: ${e.start.toLocaleTimeString()}→${e.end.toLocaleTimeString()} (${e.location || "no location"})`
    ).join("\n")

    const prompt = `You are an optimization AI. Review the following schedule analysis and user profile.

Failure Risk: ${failurePrediction.probability}%
Breakdown: ${JSON.stringify(failurePrediction.breakdown)}
User Habits: ${JSON.stringify(habits)}
Constraints: ${JSON.stringify(constraints)}
Schedule: ${eventsSummary}

Your job is to optimize the plan considering:
1. Energy distribution - user's most productive hours
2. Context switching costs - minimize switching
3. Burnout risk - ensure breaks and sleep
4. User habits - they skip morning blocks, underestimate coding, etc.

Return a JSON object with:
- "adjusted_tasks": array of task objects with id, title, description, estimated_minutes, priority, preferred_time_window, dependencies
- "energy_distribution": dict mapping time slots to productivity 0-100
- "burnout_risk": 0-100 integer
- "context_switches": integer count
- "sleep_window_preserved": boolean

Return ONLY valid JSON. No markdown.`

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      })
      let text = response.text?.trim() || "{}"
      if (text.startsWith("```")) text = text.split("\n").slice(1).join("\n").replace(/```/g, "").trim()
      const data = JSON.parse(text)
      return {
        adjusted_tasks: (data.adjusted_tasks || []) as Task[],
        energy_distribution: data.energy_distribution ?? {},
        burnout_risk: data.burnout_risk ?? 50,
        context_switches: data.context_switches ?? 5,
        sleep_window_preserved: data.sleep_window_preserved ?? true,
      }
    } catch {
      return {
        adjusted_tasks: [],
        energy_distribution: {},
        burnout_risk: 50,
        context_switches: 5,
        sleep_window_preserved: true,
      }
    }
  }
}

from typing import List
from google import genai
from backend.schemas import (
    CalendarEvent, FailurePrediction, ExternalConstraints,
    UserHabits, OptimizedPlan, Task
)


class ReflectionAgent:
    def __init__(self, client: genai.Client):
        self.client = client

    async def optimize(
        self,
        events: List[CalendarEvent],
        failure_prediction: FailurePrediction,
        constraints: ExternalConstraints,
        habits: UserHabits
    ) -> OptimizedPlan:
        events_summary = "\n".join([
            f"- {e.summary}: {e.start.strftime('%H:%M')}→{e.end.strftime('%H:%M')} ({e.location or 'no location'})"
            for e in events
        ])

        prompt = f"""You are an optimization AI. Review the following schedule analysis and user profile.

Failure Risk: {failure_prediction.probability}%
Breakdown: {failure_prediction.breakdown.model_dump_json()}
User Habits: {habits.model_dump_json()}
Constraints: {constraints.model_dump_json()}
Schedule: {events_summary}

Your job is to optimize the plan considering:
1. Energy distribution - user's most productive hours
2. Context switching costs - minimize switching
3. Burnout risk - ensure breaks and sleep
4. User habits - they skip morning blocks, underestimate coding, etc.

Return a JSON object with:
- "adjusted_tasks": array of task objects with id, title, description, estimated_minutes, priority, preferred_time_window, dependencies
- "energy_distribution": dict mapping time slots (like "morning", "afternoon", "evening", "late_night") to productivity 0-100
- "burnout_risk": 0-100 integer
- "context_switches": integer count
- "sleep_window_preserved": boolean

Return ONLY valid JSON. No markdown."""
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            import json
            data = json.loads(text)
            return OptimizedPlan(
                adjusted_tasks=[Task(**t) for t in data.get("adjusted_tasks", [])],
                energy_distribution=data.get("energy_distribution", {}),
                burnout_risk=data.get("burnout_risk", 50),
                context_switches=data.get("context_switches", 5),
                sleep_window_preserved=data.get("sleep_window_preserved", True)
            )
        except Exception as e:
            return OptimizedPlan(
                adjusted_tasks=[],
                energy_distribution={},
                burnout_risk=50,
                context_switches=5,
                sleep_window_preserved=True
            )
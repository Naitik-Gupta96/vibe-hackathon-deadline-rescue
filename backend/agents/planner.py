from datetime import datetime, timedelta
from typing import List
from google import genai
from backend.schemas import (
    CalendarEvent, FailurePrediction, FailureBreakdown,
    Task, UserHabits
)
from backend.services.memory_service import MemoryService


class PlannerAgent:
    def __init__(self, client: genai.Client, memory_service: MemoryService):
        self.client = client
        self.memory_service = memory_service

    async def analyze_failure_risk(
        self,
        events: List[CalendarEvent],
        habits: UserHabits,
        user_goal: str
    ) -> FailurePrediction:
        events_summary = "\n".join([
            f"- {e.summary}: {e.start.strftime('%H:%M')} → {e.end.strftime('%H:%M')}"
            for e in events
        ])

        prompt = f"""You are a Deadline Rescue Planner AI. Your job is to analyze a user's calendar and calculate the probability they will miss their critical deadline.

User Goal: {user_goal}
User Habits:
- Skips morning blocks: {habits.skips_morning_blocks}
- Underestimates coding tasks by: {habits.underestimates_coding_minutes}%
- Preferred focus hours: {habits.preferred_focus_hours}
- Average meeting overrun: {habits.avg_meeting_overrun_minutes} min

Current Schedule:
{events_summary}

Analyze the schedule and return a JSON object with:
1. "probability": 0-100 integer failure risk score
2. "breakdown": object with percentages for "coding_workload", "travel", "meetings", "sleep_deficit", "context_switching", "other"
3. "explanation": brief explanation of the risk
4. "critical_path": list of critical items that must happen for success

Return ONLY valid JSON. No markdown, no code blocks, no explanation outside the JSON."""
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
            return FailurePrediction(
                probability=data.get("probability", 50),
                breakdown=FailureBreakdown(**data.get("breakdown", {})),
                explanation=data.get("explanation", ""),
                critical_path=data.get("critical_path", [])
            )
        except Exception as e:
            return FailurePrediction(
                probability=50,
                breakdown=FailureBreakdown(),
                explanation=f"Error during analysis: {str(e)}",
                critical_path=["Complete analysis manually"]
            )
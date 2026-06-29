import os
import json
from typing import Optional, Dict, Any, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
from backend.schemas import (
    FailurePrediction, FailureBreakdown, Task, UserHabits,
    ExternalConstraints, OptimizedPlan, RescuePlan, CalendarEvent
)
from backend.services.calendar_service import CalendarService, get_calendar_service
from backend.services.memory_service import MemoryService, get_memory_service
from backend.agents.planner import PlannerAgent
from backend.agents.research import ResearchAgent
from backend.agents.reflection import ReflectionAgent
from backend.agents.scheduler import SchedulerAgent

load_dotenv()


class DeadlineRescueAgent:
    def __init__(
        self,
        calendar_service: Optional[CalendarService] = None,
        memory_service: Optional[MemoryService] = None
    ):
        self.client = genai.Client()
        self.calendar_service = calendar_service or get_calendar_service()
        self.memory_service = memory_service or get_memory_service()

        search_tool = types.Tool(google_search=types.GoogleSearch())
        self.generation_config = types.GenerateContentConfig(
            tools=[search_tool],
            temperature=0.7,
            top_p=0.95,
        )

        self.chat = self.client.chats.create(
            model="gemini-2.5-flash",
            config=self.generation_config
        )

        self.planner = PlannerAgent(self.client, self.memory_service)
        self.research = ResearchAgent(self.client)
        self.reflection = ReflectionAgent(self.client)
        self.scheduler = SchedulerAgent(self.client, self.calendar_service)

    async def process_message(
        self, user_message: str, user_id: str = "demo-user"
    ) -> Dict[str, Any]:
        thought_log = []

        async def add_thought(agent: str, message: str, status: str = "thinking"):
            thought = {"agent": agent, "message": message, "status": status}
            thought_log.append(thought)
            return thought

        await add_thought("planner", "Loading calendar events and analyzing schedule...")
        events = await self.calendar_service.get_events(days_ahead=7)
        await add_thought("planner", f"Found {len(events)} upcoming events. Calculating failure probability...")
        habits = await self.memory_service.get_habits(user_id)

        failure_prediction = await self.planner.analyze_failure_risk(events, habits, user_message)
        await add_thought("planner", f"Failure prediction complete: {failure_prediction.probability}% risk", "complete")

        await add_thought("research", "Checking external constraints: traffic, weather, venue hours...")
        constraints = await self.research.check_external_constraints(events)
        await add_thought("research", f"Found {len(constraints.traffic_minutes)} location constraints and transit data", "complete")

        await add_thought("reflection", "Reviewing plan for feasibility, energy distribution, and burnout risk...")
        optimized_plan = await self.reflection.optimize(events, failure_prediction, constraints, habits)
        await add_thought("reflection", f"Optimization complete. Burnout risk: {optimized_plan.burnout_risk}%. Context switches: {optimized_plan.context_switches}", "complete")

        await add_thought("scheduler", "Building rescue plan with proposed schedule...")
        rescue_plan = await self.scheduler.build_rescue_plan(
            events, failure_prediction, constraints, optimized_plan
        )
        await add_thought("scheduler", "Rescue plan ready. Awaiting your approval...", "complete")

        return {
            "thought_log": thought_log,
            "rescue_plan": rescue_plan.model_dump(mode="json")
        }

    async def execute_plan(self, rescue_plan: RescuePlan, user_id: str = "demo-user") -> Dict[str, Any]:
        result = await self.scheduler.execute_rescue_plan(rescue_plan)
        if result.success:
            msg = (
                f"Rescue executed! Deleted {len(result.deleted_events)} conflicting events, "
                f"created {len(result.created_events)} focus blocks, "
                f"rescheduled {len(result.rescheduled_events)} events."
            )
        else:
            msg = f"Execution partially failed: {', '.join(result.errors)}"
        return {"result": result.model_dump(mode="json"), "message": msg}


agent_instance: Optional[DeadlineRescueAgent] = None


def get_agent() -> DeadlineRescueAgent:
    global agent_instance
    if agent_instance is None:
        agent_instance = DeadlineRescueAgent()
    return agent_instance
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json
from google import genai
from backend.schemas import (
    CalendarEvent, FailurePrediction, ExternalConstraints,
    OptimizedPlan, RescuePlan, ExecutionResult
)
from backend.services.calendar_service import CalendarService
from backend.tools import delete_event, create_focus_block, reschedule_event


class SchedulerAgent:
    def __init__(self, client: genai.Client, calendar_service: CalendarService):
        self.client = client
        self.calendar_service = calendar_service

    async def build_rescue_plan(
        self,
        events: List[CalendarEvent],
        failure_prediction: FailurePrediction,
        constraints: ExternalConstraints,
        optimized_plan: OptimizedPlan
    ) -> RescuePlan:
        high_priority = [e for e in events if "deadline" in e.summary.lower() or "hackathon" in e.summary.lower()]
        low_priority = [e for e in events if e not in high_priority]

        focus_blocks = []
        events_to_delete = []
        events_to_reschedule = []

        now = datetime.now()
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        for event in low_priority:
            if event.summary.lower() in ["gym / workout", "team happy hour", "lunch with sarah"]:
                events_to_delete.append(event.id)
            elif event.summary.lower() in ["design review"]:
                events_to_reschedule.append({
                    "event_id": event.id,
                    "summary": event.summary,
                    "suggested_new_start": (day_start + timedelta(hours=16)).isoformat(),
                    "duration_minutes": 30
                })

        focus_start = day_start + timedelta(hours=22)
        focus_block = CalendarEvent(
            id="focus_001",
            summary="FOCUS BLOCK: Hackathon Submission",
            start=focus_start,
            end=focus_start + timedelta(hours=3),
            description="Deep work on hackathon - highest priority",
            location="Focus Block"
        )
        focus_blocks.append(focus_block)

        return RescuePlan(
            failure_prediction=failure_prediction,
            tasks=optimized_plan.adjusted_tasks,
            external_constraints=constraints,
            optimized_plan=optimized_plan,
            proposed_schedule=focus_blocks + high_priority,
            events_to_delete=events_to_delete,
            events_to_reschedule=events_to_reschedule,
            focus_blocks_to_create=focus_blocks
        )

    async def execute_rescue_plan(self, plan: RescuePlan) -> ExecutionResult:
        deleted = []
        created = []
        rescheduled = []
        errors = []

        for event_id in plan.events_to_delete:
            try:
                result = await self.calendar_service.delete_event(event_id)
                if result:
                    deleted.append(event_id)
                else:
                    errors.append(f"Could not delete {event_id}")
            except Exception as e:
                errors.append(f"Delete failed for {event_id}: {str(e)}")

        for block in plan.focus_blocks_to_create:
            try:
                created_event = await self.calendar_service.create_event(
                    title=block.summary,
                    start=block.start,
                    duration_min=int((block.end - block.start).total_seconds() / 60),
                    description=block.description or "",
                    location=block.location or ""
                )
                created.append(created_event)
            except Exception as e:
                errors.append(f"Create failed for {block.summary}: {str(e)}")

        for item in plan.events_to_reschedule:
            try:
                rescheduled_event = await self.calendar_service.update_event(
                    event_id=item["event_id"],
                    new_start=datetime.fromisoformat(item["suggested_new_start"]),
                    new_duration_min=item.get("duration_minutes", 30)
                )
                rescheduled.append({
                    "event_id": item["event_id"],
                    "new_start": rescheduled_event.start.isoformat(),
                    "new_end": rescheduled_event.end.isoformat()
                })
            except Exception as e:
                errors.append(f"Reschedule failed for {item.get('event_id', 'unknown')}: {str(e)}")

        return ExecutionResult(
            success=len(errors) == 0,
            deleted_events=deleted,
            created_events=created,
            rescheduled_events=rescheduled,
            errors=errors
        )
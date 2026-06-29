from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum


class AgentType(str, Enum):
    PLANNER = "planner"
    RESEARCH = "research"
    REFLECTION = "reflection"
    SCHEDULER = "scheduler"


class ThoughtStatus(str, Enum):
    THINKING = "thinking"
    TOOL_CALL = "tool_call"
    COMPLETE = "complete"


class CalendarEvent(BaseModel):
    id: str
    summary: str
    start: datetime
    end: datetime
    description: Optional[str] = None
    location: Optional[str] = None


class FreeBusySlot(BaseModel):
    start: datetime
    end: datetime


class FailureBreakdown(BaseModel):
    coding_workload: int = Field(ge=0, le=100, default=0)
    travel: int = Field(ge=0, le=100, default=0)
    meetings: int = Field(ge=0, le=100, default=0)
    sleep_deficit: int = Field(ge=0, le=100, default=0)
    context_switching: int = Field(ge=0, le=100, default=0)
    other: int = Field(ge=0, le=100, default=0)


class FailurePrediction(BaseModel):
    probability: int = Field(ge=0, le=100)
    breakdown: FailureBreakdown
    explanation: str
    critical_path: List[str]


class Task(BaseModel):
    id: str
    title: str
    description: str
    estimated_minutes: int
    priority: Literal["critical", "high", "medium", "low"]
    preferred_time_window: Optional[str] = None
    dependencies: List[str] = []


class ExternalConstraints(BaseModel):
    traffic_minutes: Dict[str, int] = {}
    weather: Optional[str] = None
    venue_hours: Dict[str, str] = {}
    transit_options: List[str] = []


class UserHabits(BaseModel):
    skips_morning_blocks: bool = False
    underestimates_coding_minutes: int = 0
    preferred_focus_hours: List[int] = []
    avg_meeting_overrun_minutes: int = 0
    productivity_patterns: Dict[str, Any] = {}


class OptimizedPlan(BaseModel):
    adjusted_tasks: List[Task]
    energy_distribution: Dict[str, int]
    burnout_risk: int = Field(ge=0, le=100)
    context_switches: int
    sleep_window_preserved: bool


class RescuePlan(BaseModel):
    failure_prediction: FailurePrediction
    tasks: List[Task]
    external_constraints: ExternalConstraints
    optimized_plan: OptimizedPlan
    proposed_schedule: List[CalendarEvent]
    events_to_delete: List[str]
    events_to_reschedule: List[Dict[str, Any]]
    focus_blocks_to_create: List[CalendarEvent]


class WSMessage(BaseModel):
    type: Literal[
        "user_message",
        "agent_thought",
        "tool_call",
        "tool_result",
        "plan_ready",
        "approval_request",
        "execution_result",
        "error"
    ]
    payload: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)


class ApprovalRequest(BaseModel):
    plan_id: str
    rescue_plan: RescuePlan
    message: str


class ExecutionResult(BaseModel):
    success: bool
    deleted_events: List[str] = []
    created_events: List[CalendarEvent] = []
    rescheduled_events: List[Dict[str, Any]] = []
    errors: List[str] = []
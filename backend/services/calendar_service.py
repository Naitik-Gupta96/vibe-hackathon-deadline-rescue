from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from backend.schemas import CalendarEvent, FreeBusySlot
import json
import os
import random


class CalendarService(ABC):
    @abstractmethod
    async def get_events(self, days_ahead: int = 7) -> List[CalendarEvent]:
        pass

    @abstractmethod
    async def create_event(
        self, title: str, start: datetime, duration_min: int, description: str = "", location: str = ""
    ) -> CalendarEvent:
        pass

    @abstractmethod
    async def update_event(
        self, event_id: str, new_start: datetime, new_duration_min: int
    ) -> CalendarEvent:
        pass

    @abstractmethod
    async def delete_event(self, event_id: str) -> bool:
        pass

    @abstractmethod
    async def get_free_busy(
        self, start: datetime, end: datetime
    ) -> List[Tuple[datetime, datetime]]:
        pass


class MockCalendarService(CalendarService):
    def __init__(self):
        self._events = self._seed_demo_data()
        self._event_counter = 1000

    def _seed_demo_data(self) -> List[CalendarEvent]:
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        return [
            CalendarEvent(
                id="evt_001",
                summary="Team Standup",
                start=today_start + timedelta(hours=9),
                end=today_start + timedelta(hours=9, minutes=30),
                description="Daily sync with the team",
                location="Meeting Room A"
            ),
            CalendarEvent(
                id="evt_002",
                summary="Client Call - Project Alpha",
                start=today_start + timedelta(hours=10),
                end=today_start + timedelta(hours=11),
                description="Review deliverables and timeline",
                location="Zoom"
            ),
            CalendarEvent(
                id="evt_003",
                summary="Code Review Session",
                start=today_start + timedelta(hours=11, minutes=30),
                end=today_start + timedelta(hours=13),
                description="Review PRs for sprint",
                location="Meeting Room B"
            ),
            CalendarEvent(
                id="evt_004",
                summary="Lunch with Sarah",
                start=today_start + timedelta(hours=13),
                end=today_start + timedelta(hours=14),
                description="Catch up lunch",
                location="Cafe Downtown"
            ),
            CalendarEvent(
                id="evt_005",
                summary="Design Review",
                start=today_start + timedelta(hours=14),
                end=today_start + timedelta(hours=15, minutes=30),
                description="Review new UI mockups",
                location="Figma / Meeting Room C"
            ),
            CalendarEvent(
                id="evt_006",
                summary="Hackathon Deadline: Vibe2Ship Submission",
                start=today_start + timedelta(hours=14, minutes=30),
                end=today_start + timedelta(hours=15),
                description="Final submission - 2:00 PM sharp!",
                location="Online"
            ),
            CalendarEvent(
                id="evt_007",
                summary="Dentist Appointment",
                start=today_start + timedelta(hours=15, minutes=30),
                end=today_start + timedelta(hours=16, minutes=30),
                description="Routine checkup",
                location="Downtown Dental Clinic"
            ),
            CalendarEvent(
                id="evt_008",
                summary="Gym / Workout",
                start=today_start + timedelta(hours=18),
                end=today_start + timedelta(hours=19),
                description="Evening workout",
                location="Local Gym"
            ),
            CalendarEvent(
                id="evt_009",
                summary="Team Happy Hour",
                start=today_start + timedelta(hours=19, minutes=30),
                end=today_start + timedelta(hours=21),
                description="Monthly team social",
                location="Brewery Downtown"
            ),
        ]

    async def get_events(self, days_ahead: int = 7) -> List[CalendarEvent]:
        cutoff = datetime.now() + timedelta(days=days_ahead)
        return [e for e in self._events if e.start <= cutoff]

    async def create_event(
        self, title: str, start: datetime, duration_min: int, description: str = "", location: str = ""
    ) -> CalendarEvent:
        self._event_counter += 1
        event = CalendarEvent(
            id=f"evt_{self._event_counter}",
            summary=title,
            start=start,
            end=start + timedelta(minutes=duration_min),
            description=description,
            location=location
        )
        self._events.append(event)
        return event

    async def update_event(
        self, event_id: str, new_start: datetime, new_duration_min: int
    ) -> CalendarEvent:
        for i, event in enumerate(self._events):
            if event.id == event_id:
                updated = CalendarEvent(
                    id=event.id,
                    summary=event.summary,
                    start=new_start,
                    end=new_start + timedelta(minutes=new_duration_min),
                    description=event.description,
                    location=event.location
                )
                self._events[i] = updated
                return updated
        raise ValueError(f"Event {event_id} not found")

    async def delete_event(self, event_id: str) -> bool:
        for i, event in enumerate(self._events):
            if event.id == event_id:
                self._events.pop(i)
                return True
        return False

    async def get_free_busy(
        self, start: datetime, end: datetime
    ) -> List[Tuple[datetime, datetime]]:
        busy = []
        for event in self._events:
            if event.start < end and event.end > start:
                busy.append((max(event.start, start), min(event.end, end)))
        busy.sort(key=lambda x: x[0])
        return busy


# TODO: Replace with real implementation when credentials available
# class GoogleCalendarService(CalendarService):
#     def __init__(self, credentials_path: str):
#         from google.oauth2.credentials import Credentials
#         from googleapiclient.discovery import build
#         self.creds = Credentials.from_authorized_user_file(credentials_path)
#         self.service = build('calendar', 'v3', credentials=self.creds)
#     
#     async def get_events(self, days_ahead: int = 7) -> List[CalendarEvent]:
#         # Implementation using Google Calendar API
#         pass
#     
#     async def create_event(...): pass
#     async def update_event(...): pass
#     async def delete_event(...): pass
#     async def get_free_busy(...): pass


def get_calendar_service() -> CalendarService:
    return MockCalendarService()
from datetime import datetime, timedelta
from typing import List, Optional
from backend.services.calendar_service import CalendarService


def get_upcoming_events(service: CalendarService, days_ahead: int = 7) -> str:
    """Retrieves all calendar events scheduled within the specified number of days from the current time.

    Args:
        service: The calendar service instance to query.
        days_ahead: The number of days into the future to search for events (default: 7).

    Returns:
        A JSON-formatted string containing the list of events with their summaries, start/end times, and locations.
    """
    import asyncio
    events = asyncio.run(service.get_events(days_ahead))
    result = []
    for e in events:
        result.append({
            "id": e.id,
            "summary": e.summary,
            "start": e.start.isoformat(),
            "end": e.end.isoformat(),
            "description": e.description or "",
            "location": e.location or ""
        })
    import json
    return json.dumps(result, indent=2)


def create_focus_block(
    service: CalendarService,
    title: str,
    start_time: str,
    duration_minutes: int,
    description: str = ""
) -> str:
    """Creates a new calendar event for focused work time, blocking out distractions.

    Args:
        service: The calendar service instance.
        title: The name or label for this focus block (e.g., 'Deep Work: Hackathon Submission').
        start_time: ISO 8601 formatted string representing the exact start time (e.g., '2026-06-29T22:00:00').
        duration_minutes: The length of the focus period in minutes.
        description: Optional context about what the focus block is for.

    Returns:
        A JSON string confirming the created event with its ID and scheduled timeframe.
    """
    import asyncio
    start = datetime.fromisoformat(start_time)
    event = asyncio.run(service.create_event(title, start, duration_minutes, description, "Focus Block"))
    return json.dumps({
        "id": event.id,
        "summary": event.summary,
        "start": event.start.isoformat(),
        "end": event.end.isoformat(),
        "status": "created"
    })


def delete_event(service: CalendarService, event_id: str) -> str:
    """Permanently removes a calendar event by its unique identifier to free up time in the schedule.

    Args:
        service: The calendar service instance.
        event_id: The unique Google Calendar identifier for the event to delete.

    Returns:
        A confirmation string indicating the event was deleted or an error message.
    """
    import asyncio
    success = asyncio.run(service.delete_event(event_id))
    if success:
        return f"Event {event_id} successfully deleted."
    return f"Error: Event {event_id} could not be found or deleted."


def reschedule_event(
    service: CalendarService,
    event_id: str,
    new_start_time: str,
    duration_minutes: int
) -> str:
    """Moves an existing event to a new time slot and adjusts its duration to resolve scheduling conflicts.

    Args:
        service: The calendar service instance.
        event_id: The unique identifier of the event to move.
        new_start_time: ISO 8601 formatted string for the desired new start time.
        duration_minutes: The new duration in minutes for the rescheduled event.

    Returns:
        A JSON string with the updated event details including the new time slot.
    """
    import asyncio
    import json
    start = datetime.fromisoformat(new_start_time)
    event = asyncio.run(service.update_event(event_id, start, duration_minutes))
    return json.dumps({
        "id": event.id,
        "summary": event.summary,
        "start": event.start.isoformat(),
        "end": event.end.isoformat(),
        "status": "rescheduled"
    })


def get_free_time_slots(service: CalendarService, date: str) -> str:
    """Analyzes the schedule for the given date and returns all open time slots available for booking.

    Args:
        service: The calendar service instance.
        date: ISO 8601 date string (e.g., '2026-06-29') to check for availability.

    Returns:
        A JSON string listing all free time slots with start and end times on the specified date.
    """
    import asyncio
    import json
    start = datetime.fromisoformat(f"{date}T00:00:00")
    end = datetime.fromisoformat(f"{date}T23:59:00")
    busy = asyncio.run(service.get_free_busy(start, end))

    free_slots = []
    cursor = start
    for b_start, b_end in sorted(busy, key=lambda x: x[0]):
        if cursor < b_start:
            free_slots.append({
                "start": cursor.isoformat(),
                "end": b_start.isoformat()
            })
        cursor = max(cursor, b_end)
    if cursor < end:
        free_slots.append({
            "start": cursor.isoformat(),
            "end": end.isoformat()
        })

    return json.dumps(free_slots, indent=2)


import json
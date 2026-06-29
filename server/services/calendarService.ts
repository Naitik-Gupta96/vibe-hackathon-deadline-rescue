import { CalendarEvent } from "../types"

export interface ICalendarService {
  getEvents(daysAhead?: number): Promise<CalendarEvent[]>
  createEvent(title: string, start: Date, durationMin: number, description?: string, location?: string): Promise<CalendarEvent>
  updateEvent(eventId: string, newStart: Date, newDurationMin: number): Promise<CalendarEvent>
  deleteEvent(eventId: string): Promise<boolean>
  getFreeBusy(start: Date, end: Date): Promise<Array<{ start: Date; end: Date }>>
}

export class MockCalendarService implements ICalendarService {
  private events: CalendarEvent[] = []
  private eventCounter = 1000

  constructor() {
    this.events = this.seedDemoData()
  }

  private seedDemoData(): CalendarEvent[] {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)

    return [
      { id: "evt_001", summary: "Team Standup", start: new Date(todayStart.getTime() + 9 * 3600000), end: new Date(todayStart.getTime() + 9.5 * 3600000), description: "Daily sync with the team", location: "Meeting Room A" },
      { id: "evt_002", summary: "Client Call - Project Alpha", start: new Date(todayStart.getTime() + 10 * 3600000), end: new Date(todayStart.getTime() + 11 * 3600000), description: "Review deliverables and timeline", location: "Zoom" },
      { id: "evt_003", summary: "Code Review Session", start: new Date(todayStart.getTime() + 11.5 * 3600000), end: new Date(todayStart.getTime() + 13 * 3600000), description: "Review PRs for sprint", location: "Meeting Room B" },
      { id: "evt_004", summary: "Lunch with Sarah", start: new Date(todayStart.getTime() + 13 * 3600000), end: new Date(todayStart.getTime() + 14 * 3600000), description: "Catch up lunch", location: "Cafe Downtown" },
      { id: "evt_005", summary: "Design Review", start: new Date(todayStart.getTime() + 14 * 3600000), end: new Date(todayStart.getTime() + 15.5 * 3600000), description: "Review new UI mockups", location: "Figma / Meeting Room C" },
      { id: "evt_006", summary: "Hackathon Deadline: Vibe2Ship Submission", start: new Date(todayStart.getTime() + 14.5 * 3600000), end: new Date(todayStart.getTime() + 15 * 3600000), description: "Final submission - 2:00 PM sharp!", location: "Online" },
      { id: "evt_007", summary: "Dentist Appointment", start: new Date(todayStart.getTime() + 15.5 * 3600000), end: new Date(todayStart.getTime() + 16.5 * 3600000), description: "Routine checkup", location: "Downtown Dental Clinic" },
      { id: "evt_008", summary: "Gym / Workout", start: new Date(todayStart.getTime() + 18 * 3600000), end: new Date(todayStart.getTime() + 19 * 3600000), description: "Evening workout", location: "Local Gym" },
      { id: "evt_009", summary: "Team Happy Hour", start: new Date(todayStart.getTime() + 19.5 * 3600000), end: new Date(todayStart.getTime() + 21 * 3600000), description: "Monthly team social", location: "Brewery Downtown" },
    ]
  }

  async getEvents(daysAhead = 7): Promise<CalendarEvent[]> {
    const cutoff = new Date(Date.now() + daysAhead * 86400000)
    return this.events.filter(e => e.start <= cutoff)
  }

  async createEvent(title: string, start: Date, durationMin: number, description = "", location = ""): Promise<CalendarEvent> {
    this.eventCounter++
    const event: CalendarEvent = {
      id: `evt_${this.eventCounter}`,
      summary: title,
      start,
      end: new Date(start.getTime() + durationMin * 60000),
      description,
      location,
    }
    this.events.push(event)
    return event
  }

  async updateEvent(eventId: string, newStart: Date, newDurationMin: number): Promise<CalendarEvent> {
    const idx = this.events.findIndex(e => e.id === eventId)
    if (idx === -1) throw new Error(`Event ${eventId} not found`)
    this.events[idx] = {
      ...this.events[idx],
      start: newStart,
      end: new Date(newStart.getTime() + newDurationMin * 60000),
    }
    return this.events[idx]
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const idx = this.events.findIndex(e => e.id === eventId)
    if (idx === -1) return false
    this.events.splice(idx, 1)
    return true
  }

  async getFreeBusy(start: Date, end: Date): Promise<Array<{ start: Date; end: Date }>> {
    const busy: Array<{ start: Date; end: Date }> = []
    for (const event of this.events) {
      if (event.start < end && event.end > start) {
        busy.push({
          start: event.start > start ? event.start : start,
          end: event.end < end ? event.end : end,
        })
      }
    }
    busy.sort((a, b) => a.start.getTime() - b.start.getTime())
    return busy
  }
}

// TODO: Replace with real Google Calendar API implementation
// export class GoogleCalendarService implements ICalendarService { ... }

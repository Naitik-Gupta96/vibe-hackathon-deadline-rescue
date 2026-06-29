import { CalendarEvent, FailurePrediction, ExternalConstraints, OptimizedPlan, RescuePlan, ExecutionResult } from "../types"
import { ICalendarService } from "../services/calendarService"

export class SchedulerAgent {
  private calendarService: ICalendarService

  constructor(calendarService: ICalendarService) {
    this.calendarService = calendarService
  }

  async buildRescuePlan(
    events: CalendarEvent[],
    failurePrediction: FailurePrediction,
    constraints: ExternalConstraints,
    optimizedPlan: OptimizedPlan
  ): Promise<RescuePlan> {
    const highPriority = events.filter(e =>
      e.summary.toLowerCase().includes("deadline") || e.summary.toLowerCase().includes("hackathon")
    )
    const lowPriority = events.filter(e => !highPriority.includes(e))

    const focusBlocks: CalendarEvent[] = []
    const eventsToDelete: string[] = []
    const eventsToReschedule: Array<{ event_id: string; summary: string; suggested_new_start: string; duration_minutes: number }> = []

    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)

    for (const event of lowPriority) {
      const lower = event.summary.toLowerCase()
      if (["gym / workout", "team happy hour", "lunch with sarah"].includes(lower)) {
        eventsToDelete.push(event.id)
      } else if (lower === "design review") {
        eventsToReschedule.push({
          event_id: event.id,
          summary: event.summary,
          suggested_new_start: new Date(dayStart.getTime() + 16 * 3600000).toISOString(),
          duration_minutes: 30,
        })
      }
    }

    const focusStart = new Date(dayStart.getTime() + 22 * 3600000)
    focusBlocks.push({
      id: "focus_001",
      summary: "FOCUS BLOCK: Hackathon Submission",
      start: focusStart,
      end: new Date(focusStart.getTime() + 3 * 3600000),
      description: "Deep work on hackathon - highest priority",
      location: "Focus Block",
    })

    return {
      failure_prediction: failurePrediction,
      tasks: optimizedPlan.adjusted_tasks,
      external_constraints: constraints,
      optimized_plan: optimizedPlan,
      proposed_schedule: [...focusBlocks, ...highPriority],
      events_to_delete: eventsToDelete,
      events_to_reschedule: eventsToReschedule,
      focus_blocks_to_create: focusBlocks,
    }
  }

  async executeRescuePlan(plan: RescuePlan): Promise<ExecutionResult> {
    const deleted: string[] = []
    const created: CalendarEvent[] = []
    const rescheduled: Array<{ event_id: string; new_start: string; new_end: string }> = []
    const errors: string[] = []

    for (const eventId of plan.events_to_delete) {
      try {
        const ok = await this.calendarService.deleteEvent(eventId)
        if (ok) deleted.push(eventId)
        else errors.push(`Could not delete ${eventId}`)
      } catch (e: any) {
        errors.push(`Delete failed for ${eventId}: ${e.message}`)
      }
    }

    for (const block of plan.focus_blocks_to_create) {
      try {
        const createdEvent = await this.calendarService.createEvent(
          block.summary,
          block.start,
          (block.end.getTime() - block.start.getTime()) / 60000,
          block.description,
          block.location
        )
        created.push(createdEvent)
      } catch (e: any) {
        errors.push(`Create failed for ${block.summary}: ${e.message}`)
      }
    }

    for (const item of plan.events_to_reschedule) {
      try {
        const rescheduledEvent = await this.calendarService.updateEvent(
          item.event_id,
          new Date(item.suggested_new_start),
          item.duration_minutes
        )
        rescheduled.push({
          event_id: item.event_id,
          new_start: rescheduledEvent.start.toISOString(),
          new_end: rescheduledEvent.end.toISOString(),
        })
      } catch (e: any) {
        errors.push(`Reschedule failed for ${item.event_id}: ${e.message}`)
      }
    }

    return {
      success: errors.length === 0,
      deleted_events: deleted,
      created_events: created,
      rescheduled_events: rescheduled,
      errors,
    }
  }
}

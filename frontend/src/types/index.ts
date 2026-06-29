export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  description?: string
  location?: string
}

export interface FailureBreakdown {
  coding_workload: number
  travel: number
  meetings: number
  sleep_deficit: number
  context_switching: number
  other: number
}

export interface FailurePrediction {
  probability: number
  breakdown: FailureBreakdown
  explanation: string
  critical_path: string[]
}

export interface Task {
  id: string
  title: string
  description: string
  estimated_minutes: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  preferred_time_window?: string
  dependencies: string[]
}

export interface ExternalConstraints {
  traffic_minutes: Record<string, number>
  weather?: string
  venue_hours: Record<string, string>
  transit_options: string[]
}

export interface OptimizedPlan {
  adjusted_tasks: Task[]
  energy_distribution: Record<string, number>
  burnout_risk: number
  context_switches: number
  sleep_window_preserved: boolean
}

export interface RescuePlan {
  failure_prediction: FailurePrediction
  tasks: Task[]
  external_constraints: ExternalConstraints
  optimized_plan: OptimizedPlan
  proposed_schedule: CalendarEvent[]
  events_to_delete: string[]
  events_to_reschedule: Array<{
    event_id: string
    summary: string
    suggested_new_start: string
    duration_minutes: number
  }>
  focus_blocks_to_create: CalendarEvent[]
}

export interface ThoughtEntry {
  agent: string
  message: string
  status: string
}

export interface WSMessage {
  type: string
  payload: any
  timestamp: string
}
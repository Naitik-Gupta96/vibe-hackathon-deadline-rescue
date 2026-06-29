import { CalendarEvent } from '../types'

interface CalendarPreviewProps {
  events: CalendarEvent[]
}

export function CalendarPreview({ events }: CalendarPreviewProps) {
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Calendar Preview</h3>
      {sorted.map((event) => (
        <div
          key={event.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-surface-700/50 border border-surface-600"
        >
          <div className="flex flex-col items-center min-w-[4rem]">
            <span className="text-xs text-gray-400">
              {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-gray-500">→</span>
            <span className="text-xs text-gray-400">
              {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{event.summary}</p>
            {event.location && (
              <p className="text-xs text-gray-400 truncate">{event.location}</p>
            )}
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="text-sm text-gray-500 italic">No events to preview</p>
      )}
    </div>
  )
}
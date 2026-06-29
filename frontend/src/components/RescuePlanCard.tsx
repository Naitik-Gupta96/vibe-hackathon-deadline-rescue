import { RescuePlan, FailureBreakdown } from '../types'
import { useState } from 'react'

interface RescuePlanCardProps {
  plan: RescuePlan
  onApprove: () => void
}

function FailureGauge({ probability }: { probability: number }) {
  const color = probability >= 80 ? 'text-red-400' : probability >= 50 ? 'text-yellow-400' : 'text-green-400'
  const bgColor = probability >= 80 ? 'bg-red-500/20' : probability >= 50 ? 'bg-yellow-500/20' : 'bg-green-500/20'
  const barColor = probability >= 80 ? 'bg-red-500' : probability >= 50 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="text-center p-4">
      <div className={`text-5xl font-black ${color}`}>{probability}%</div>
      <div className="text-xs text-gray-400 mt-1 uppercase">Failure Risk</div>
      <div className={`w-full ${bgColor} rounded-full h-3 mt-3`}>
        <div
          className={`${barColor} h-3 rounded-full transition-all duration-1000`}
          style={{ width: `${probability}%` }}
        />
      </div>
    </div>
  )
}

function BreakdownBar({ label, value, maxValue }: { label: string; value: number; maxValue: number }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-gray-400 text-right">{label}</span>
      <div className="flex-1 bg-surface-700 rounded-full h-2">
        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-gray-300 font-mono">{value}%</span>
    </div>
  )
}

export function RescuePlanCard({ plan, onApprove }: RescuePlanCardProps) {
  const [approved, setApproved] = useState(false)
  const fp = plan.failure_prediction
  const breakdown = fp.breakdown
  const maxBreakdown = Math.max(
    breakdown.coding_workload, breakdown.travel, breakdown.meetings,
    breakdown.sleep_deficit, breakdown.context_switching, breakdown.other, 1
  )

  const handleApprove = () => {
    setApproved(true)
    onApprove()
  }

  return (
    <div className="bg-surface-800 rounded-lg border border-surface-600 overflow-hidden">
      <div className="p-4 border-b border-surface-600">
        <h2 className="text-lg font-bold text-white">Rescue Plan</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="space-y-4">
          <div className="bg-surface-900/50 rounded-lg">
            <FailureGauge probability={fp.probability} />
          </div>

          <div className="bg-surface-900/50 rounded-lg p-3 space-y-1.5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Risk Breakdown</h3>
            <BreakdownBar label="Coding Workload" value={breakdown.coding_workload} maxValue={maxBreakdown} />
            <BreakdownBar label="Travel" value={breakdown.travel} maxValue={maxBreakdown} />
            <BreakdownBar label="Meetings" value={breakdown.meetings} maxValue={maxBreakdown} />
            <BreakdownBar label="Sleep Deficit" value={breakdown.sleep_deficit} maxValue={maxBreakdown} />
            <BreakdownBar label="Context Switching" value={breakdown.context_switching} maxValue={maxBreakdown} />
            <BreakdownBar label="Other" value={breakdown.other} maxValue={maxBreakdown} />
          </div>

          {fp.explanation && (
            <div className="bg-surface-900/50 rounded-lg p-3">
              <p className="text-sm text-gray-300">{fp.explanation}</p>
            </div>
          )}

          {fp.critical_path.length > 0 && (
            <div className="bg-surface-900/50 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Critical Path</h3>
              <ul className="space-y-1">
                {fp.critical_path.map((item, i) => (
                  <li key={i} className="text-sm text-red-300 flex items-center gap-1">
                    <span className="text-red-400">⚠</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-surface-900/50 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Proposed Schedule</h3>
            <div className="space-y-2">
              {plan.proposed_schedule.map((evt) => (
                <div key={evt.id} className="flex items-center gap-2 text-sm p-2 rounded bg-surface-700/50">
                  <span className={`w-2 h-2 rounded-full ${evt.summary.includes('FOCUS') ? 'bg-green-400' : 'bg-blue-400'}`} />
                  <div className="flex-1">
                    <p className="text-gray-200 font-medium">{evt.summary}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {evt.location ? ` · ${evt.location}` : ''}
                    </p>
                  </div>
                  {evt.summary.includes('FOCUS') && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">New</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-900/50 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Actions</h3>
            {plan.events_to_delete.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-red-400 mb-1">Will delete ({plan.events_to_delete.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {plan.events_to_delete.map((id) => (
                    <span key={id} className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">{id}</span>
                  ))}
                </div>
              </div>
            )}
            {plan.events_to_reschedule.length > 0 && (
              <div>
                <p className="text-xs text-yellow-400 mb-1">Will reschedule ({plan.events_to_reschedule.length}):</p>
                <div className="space-y-1">
                  {plan.events_to_reschedule.map((evt) => (
                    <div key={evt.event_id} className="text-xs text-yellow-300">
                      {evt.summary} → {new Date(evt.suggested_new_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!approved ? (
            <button
              onClick={handleApprove}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 flex items-center justify-center gap-2"
            >
              <span>⚡</span> Approve & Execute
            </button>
          ) : (
            <div className="w-full py-3 px-4 bg-green-500/20 text-green-400 font-bold rounded-lg text-center flex items-center justify-center gap-2">
              <span>✓</span> Executing Rescue Plan...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
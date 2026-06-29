import { ThoughtEntry } from '../types'

const agentIcons: Record<string, string> = {
  planner: '🧠',
  research: '🔍',
  reflection: '⚖️',
  scheduler: '⚙️',
  system: '🤖'
}

const agentColors: Record<string, string> = {
  planner: 'text-blue-400',
  research: 'text-purple-400',
  reflection: 'text-amber-400',
  scheduler: 'text-cyan-400',
  system: 'text-green-400'
}

interface ThoughtLogProps {
  thoughts: ThoughtEntry[]
}

export function ThoughtLog({ thoughts }: ThoughtLogProps) {
  return (
    <div className="bg-surface-800 rounded-lg p-4 h-full overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Agent Activity Log
      </h3>
      <div className="space-y-2">
        {thoughts.length === 0 && (
          <p className="text-gray-500 text-sm italic">Waiting for input...</p>
        )}
        {thoughts.map((thought, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-sm p-2 rounded bg-surface-700/50 animate-fadeIn"
          >
            <span className="text-lg">{agentIcons[thought.agent] || '🤖'}</span>
            <div className="flex-1 min-w-0">
              <span className={`font-medium ${agentColors[thought.agent] || 'text-gray-300'}`}>
                {thought.agent.charAt(0).toUpperCase() + thought.agent.slice(1)}
              </span>
              <p className="text-gray-300 mt-0.5">{thought.message}</p>
              {thought.status === 'thinking' && (
                <span className="inline-flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-yellow-400 text-xs">Processing...</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
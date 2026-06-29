import { useState, useRef, useEffect } from 'react'
import { ThoughtEntry, RescuePlan } from '../types'
import { ThoughtLog } from './ThoughtLog'
import { RescuePlanCard } from './RescuePlanCard'

interface ChatInterfaceProps {
  messages: any[]
  connected: boolean
  onSendMessage: (text: string) => void
  onApprove: () => void
}

export function ChatInterface({ messages, connected, onSendMessage, onApprove }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [lastPlan, setLastPlan] = useState<RescuePlan | null>(null)
  const thoughtsEndRef = useRef<HTMLDivElement>(null)
  const thoughts: ThoughtEntry[] = []
  let planData: RescuePlan | null = lastPlan

  messages.forEach((msg) => {
    if (msg.type === 'agent_thought') {
      thoughts.push(msg.payload)
    } else if (msg.type === 'plan_ready') {
      planData = msg.payload.rescue_plan
      setLastPlan(msg.payload.rescue_plan)
    } else if (msg.type === 'execution_result') {
      thoughts.push({
        agent: 'scheduler',
        message: msg.payload.message,
        status: 'complete'
      })
    } else if (msg.type === 'error') {
      thoughts.push({
        agent: 'system',
        message: msg.payload.message,
        status: 'complete'
      })
    }
  })

  useEffect(() => {
    thoughtsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thoughts.length])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    onSendMessage(text)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-surface-700">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg">
          🦸
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Deadline Rescue Agent</h1>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400">{connected ? 'Connected' : 'Reconnecting...'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        <div className="lg:col-span-2 space-y-4 overflow-y-auto">
          {planData && (
            <RescuePlanCard
              key={JSON.stringify(planData.failure_prediction.probability)}
              plan={planData}
              onApprove={onApprove}
            />
          )}

          {thoughts.filter(t => t.agent !== 'system').length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-6xl mb-4">🦸</div>
              <h2 className="text-xl font-bold text-white mb-2">Your Deadline Rescue Agent</h2>
              <p className="text-gray-400 max-w-md">
                I'll analyze your calendar, predict deadline risks, and autonomously
                restructure your day. Just tell me your critical deadline!
              </p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-sm">
                <button
                  onClick={() => onSendMessage("Rescue my day")}
                  className="text-left px-4 py-3 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-300 text-sm transition-colors border border-surface-600"
                >
                  ⚡ Rescue my day
                </button>
                <button
                  onClick={() => onSendMessage("I have a hackathon deadline at 2PM today")}
                  className="text-left px-4 py-3 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-300 text-sm transition-colors border border-surface-600"
                >
                  📝 I have a hackathon deadline at 2PM
                </button>
              </div>
            </div>
          )}
          <div ref={thoughtsEndRef} />
        </div>

        <div className="h-full">
          <ThoughtLog thoughts={thoughts} />
        </div>
      </div>

      <div className="p-4 border-t border-surface-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your deadline or say 'Rescue my day'..."
            className="flex-1 bg-surface-700 border border-surface-600 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            disabled={!connected}
          />
          <button
            onClick={handleSend}
            disabled={!connected || !input.trim()}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useRef, useCallback, useState } from 'react'
import { WSMessage } from '../types'

const WS_URL = `ws://${window.location.hostname}:8000/ws/chat`

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const [messages, setMessages] = useState<WSMessage[]>([])
  const [connected, setConnected] = useState(false)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>()

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data)
      setMessages((prev) => [...prev, msg])
    }

    ws.onclose = () => {
      setConnected(false)
      reconnectTimeout.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimeout.current)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  const sendMessage = useCallback((text: string) => {
    send({
      type: 'user_message',
      payload: { text },
      timestamp: new Date().toISOString()
    })
  }, [send])

  const sendApproval = useCallback(() => {
    send({
      type: 'approval',
      payload: { approved: true },
      timestamp: new Date().toISOString()
    })
  }, [send])

  return { messages, connected, sendMessage, sendApproval, clearMessages: () => setMessages([]) }
}
import { useWebSocket } from './hooks/useWebSocket'
import { ChatInterface } from './components/ChatInterface'

function App() {
  const { messages, connected, sendMessage, sendApproval } = useWebSocket()

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-900 overflow-hidden">
      <ChatInterface
        messages={messages}
        connected={connected}
        onSendMessage={sendMessage}
        onApprove={sendApproval}
      />
    </div>
  )
}

export default App
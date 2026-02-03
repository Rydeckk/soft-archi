import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000'

interface Message {
  id: number
  content: string
  createdAt: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  const fetchMessages = async () => {
    console.log('[FRONTEND] Fetching messages from API...')
    try {
      const response = await fetch(`${API_URL}/messages`)
      const data = await response.json()
      console.log('[FRONTEND] Received messages:', data.length)
      setMessages(data)
    } catch (error) {
      console.error('[FRONTEND] Error fetching messages:', error)
    }
  }

  const createMessage = async () => {
    if (!newMessage.trim()) return

    console.log('[FRONTEND] Sending message to API:', newMessage)
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[FRONTEND] Message created:', data.id)
        setNewMessage('')
        await fetchMessages()
      }
    } catch (error) {
      console.error('[FRONTEND] Error creating message:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px' }}>
      <h1>Walking Skeleton</h1>

      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Enter a message..."
        />
        <button onClick={createMessage}>Send</button>
      </div>

      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.content} - {new Date(message.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App

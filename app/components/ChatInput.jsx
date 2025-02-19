import { useState } from 'react'

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入消息..."
        className="flex-1 p-2 border rounded-lg resize-none"
        rows={1}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className={`px-4 py-2 rounded-lg ${
          disabled || !message.trim()
            ? 'bg-gray-300'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        发送
      </button>
    </form>
  )
} 
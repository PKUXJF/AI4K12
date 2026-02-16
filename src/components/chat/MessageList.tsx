// src/components/chat/MessageList.tsx
import { MessageBubble } from './MessageBubble'
import type { Message } from '../../types'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}
    </div>
  )
}

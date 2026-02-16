// src/components/chat/ChatContainer.tsx
import { useEffect, useRef } from 'react'
import { useChatStore } from '../../stores/chat'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'
import { WelcomeScreen } from './WelcomeScreen'

export function ChatContainer() {
  const { messages, currentConversationId, createConversation } = useChatStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 如果没有当前对话，自动创建
    if (!currentConversationId) {
      createConversation()
    }
  }, [currentConversationId, createConversation])

  useEffect(() => {
    // 滚动到底部
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 消息列表区域 */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
        <InputArea />
      </div>
    </div>
  )
}

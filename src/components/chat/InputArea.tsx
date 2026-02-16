// src/components/chat/InputArea.tsx
import { useState } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'
import { useChatStore } from '../../stores/chat'

export function InputArea() {
  const [input, setInput] = useState('')
  const { sendMessage, isLoading } = useChatStore()

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    await sendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative flex items-end gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-2">
        {/* 附件按钮 */}
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <Paperclip size={20} />
        </button>

        {/* 输入框 */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息，或点击上方选项..."
          className="
            flex-1 max-h-32 min-h-[44px] py-2.5 px-2
            bg-transparent border-0 resize-none
            focus:outline-none focus:ring-0
            text-gray-900 dark:text-gray-100
            placeholder-gray-400
          "
          rows={1}
        />

        {/* 语音按钮 */}
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <Mic size={20} />
        </button>

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`
            p-2 rounded-lg
            ${input.trim() && !isLoading
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
            transition-colors
          `}
        >
          <Send size={20} />
        </button>
      </div>

      {/* 提示文字 */}
      <div className="text-center mt-2 text-xs text-gray-400">
        AI 生成的内容仅供参考，请审核后使用
      </div>
    </div>
  )
}

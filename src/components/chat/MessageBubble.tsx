// src/components/chat/MessageBubble.tsx
import { User, Bot } from 'lucide-react'
import { ChoiceCard } from './ChoiceCard'
import { GuidedQuestionGenerator } from './GuidedQuestionGenerator'
import { GuidedPPTGenerator } from './GuidedPPTGenerator'
import { ExportButtons } from './ExportButtons'
import type { Message } from '../../types'
import 'katex/dist/katex.min.css'

interface MessageBubbleProps {
  message: Message
  isLast: boolean
}

// 简单的LaTeX渲染函数
function renderLatex(text: string) {
  // 分割文本，提取LaTeX公式
  const parts = text.split(/(\$[^$]+\$)/g)
  return parts.map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      // 这是一个LaTeX公式
      const formula = part.slice(1, -1)
      return <span key={index} className="katex-inline">{formula}</span>
    }
    return <span key={index}>{part}</span>
  })
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  // 检查是否是特殊指令消息
  const isQuestionGenerator = message.content === '[START_QUESTION_GENERATOR]'
  const isPPTGenerator = message.content === '[START_PPT_GENERATOR]'
  const isQuestionAdapt = message.content === '[START_QUESTION_ADAPT]'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* 头像 */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser 
            ? 'bg-primary-500 text-white ml-2' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-2'
          }
        `}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* 消息内容 */}
        <div className={`
          rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-primary-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
          }
        `}>
          {/* 特殊组件：智能出题引导 */}
          {isQuestionGenerator && isLast && (
            <GuidedQuestionGenerator />
          )}
          
          {/* 特殊组件：PPT生成引导 */}
          {isPPTGenerator && isLast && (
            <GuidedPPTGenerator />
          )}
          
          {/* 特殊组件：题目改编引导 */}
          {isQuestionAdapt && isLast && (
            <div className="text-gray-600 dark:text-gray-400">
              🚧 题目改编功能开发中...
            </div>
          )}
          
          {/* 普通文本内容 */}
          {!isQuestionGenerator && !isPPTGenerator && !isQuestionAdapt && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{renderLatex(message.content)}</p>
            </div>
          )}

          {/* 引导选项（AI消息且有选项时显示） */}
          {!isUser && message.choices && message.choices.length > 0 && (
            <ChoiceCard choices={message.choices} />
          )}
          
          {/* 导出按钮（AI消息且有实际内容时显示） */}
          {!isUser && !isQuestionGenerator && !isPPTGenerator && !isQuestionAdapt && 
           message.content.length > 50 && (
            <ExportButtons content={message.content} title="AI生成内容" />
          )}
        </div>
      </div>
    </div>
  )
}

// src/components/chat/WelcomeScreen.tsx
import { Calculator, Presentation, FileText, Sparkles } from 'lucide-react'
import { useChatStore } from '../../stores/chat'

const quickActions = [
  {
    id: 'generate',
    icon: Calculator,
    title: '智能出题',
    description: '生成高中数学练习题',
    example: '出5道导数应用题，难度中等',
  },
  {
    id: 'ppt',
    icon: Presentation,
    title: '试卷讲评',
    description: '制作试卷讲评课PPT',
    example: '制作期中试卷讲评课件',
  },
  {
    id: 'adapt',
    icon: FileText,
    title: '改编题目',
    description: '改编现有题目',
    example: '把这道题改成含参数讨论的形式',
  },
  {
    id: 'help',
    icon: Sparkles,
    title: '其他帮助',
    description: '知识点讲解、答疑解惑',
    example: '讲解函数单调性的判断方法',
  },
]

export function WelcomeScreen() {
  const { sendMessage } = useChatStore()

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'generate':
        sendMessage('[START_QUESTION_GENERATOR]')
        break
      case 'ppt':
        sendMessage('[START_PPT_GENERATOR]')
        break
      case 'adapt':
        sendMessage('[START_QUESTION_ADAPT]')
        break
      case 'help':
        sendMessage('你好，我需要一些帮助')
        break
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI4Edu 高中数学助手
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          专为高中数学教师设计的智能教学助手
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {quickActions.map((action) => {
          const IconComponent = action.icon
          return (
            <button
              key={action.title}
              onClick={() => handleActionClick(action.id)}
              className="
                flex flex-col items-start p-4
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                hover:border-primary-300 dark:hover:border-primary-700
                rounded-xl
                transition-all duration-200
                group
                text-left
              "
            >
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mb-3">
                <IconComponent size={24} className="text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {action.description}
              </p>
              <p className="text-xs text-primary-500">
                例如："{action.example}"
              </p>
            </button>
          )
        })}
      </div>

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>💡 提示：您可以直接描述需求，或点击卡片快速开始</p>
      </div>
    </div>
  )
}

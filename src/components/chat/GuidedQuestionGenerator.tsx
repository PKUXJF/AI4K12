// src/components/chat/GuidedQuestionGenerator.tsx
import { useState } from 'react'
import { Calculator, BookOpen, BarChart3, Layers } from 'lucide-react'
import { useChatStore } from '../../stores/chat'

interface QuestionParams {
  topic: string
  difficulty: 'basic' | 'medium' | 'hard'
  count: number
  questionTypes: string[]
  requireGraph: boolean
}

const MATH_TOPICS = [
  { id: 'functions', label: '函数', icon: '📈', description: '函数性质、图像、应用' },
  { id: 'derivatives', label: '导数', icon: '📉', description: '导数计算、单调性、极值' },
  { id: 'trigonometry', label: '三角函数', icon: '📐', description: '三角恒等变换、图像' },
  { id: 'sequences', label: '数列', icon: '🔢', description: '等差/等比数列、求和' },
  { id: 'geometry', label: '立体几何', icon: '📦', description: '空间向量、位置关系' },
  { id: 'analytic-geometry', label: '解析几何', icon: '📊', description: '直线、圆、圆锥曲线' },
  { id: 'probability', label: '概率统计', icon: '🎲', description: '概率、分布、统计' },
]

const DIFFICULTY_LEVELS = [
  { id: 'basic', label: '基础', color: 'text-green-600', desc: '直接应用公式定理' },
  { id: 'medium', label: '中档', color: 'text-yellow-600', desc: '2-3个知识点结合' },
  { id: 'hard', label: '困难', color: 'text-red-600', desc: '多知识点综合应用' },
]

export function GuidedQuestionGenerator() {
  const [step, setStep] = useState<'topic' | 'difficulty' | 'count' | 'confirm'>('topic')
  const [params, setParams] = useState<Partial<QuestionParams>>({})
  const { sendMessage } = useChatStore()

  const handleTopicSelect = (topicId: string) => {
    setParams(prev => ({ ...prev, topic: topicId }))
    setStep('difficulty')
  }

  const handleDifficultySelect = (difficulty: QuestionParams['difficulty']) => {
    setParams(prev => ({ ...prev, difficulty }))
    setStep('count')
  }

  const handleCountSelect = (count: number) => {
    setParams(prev => ({ ...prev, count }))
    setStep('confirm')
  }

  const handleConfirm = () => {
    const topic = MATH_TOPICS.find(t => t.id === params.topic)?.label
    const difficulty = DIFFICULTY_LEVELS.find(d => d.id === params.difficulty)?.label
    
    const message = `请为我生成${params.count}道${difficulty}难度的${topic}题目，包含详细解答。`
    sendMessage(message)
  }

  const handleBack = () => {
    if (step === 'difficulty') setStep('topic')
    if (step === 'count') setStep('difficulty')
    if (step === 'confirm') setStep('count')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md">
      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 mb-4">
        {['topic', 'difficulty', 'count', 'confirm'].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
              ${step === s ? 'bg-primary-500 text-white' : 
                ['topic', 'difficulty', 'count', 'confirm'].indexOf(step) > idx 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-200 text-gray-500'}
            `}>
              {idx + 1}
            </div>
            {idx < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* 步骤内容 */}
      {step === 'topic' && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen size={20} className="text-primary-500" />
            选择知识点
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {MATH_TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                className="
                  p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600
                  hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-all
                "
              >
                <div className="text-2xl mb-1">{topic.icon}</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {topic.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{topic.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'difficulty' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-primary-500" />
              选择难度
            </h3>
            <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
          </div>
          <div className="space-y-2">
            {DIFFICULTY_LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => handleDifficultySelect(level.id as QuestionParams['difficulty'])}
                className="
                  w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600
                  hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-all flex items-center justify-between
                "
              >
                <div>
                  <div className={`font-medium ${level.color}`}>{level.label}</div>
                  <div className="text-xs text-gray-500">{level.desc}</div>
                </div>
                <div className="text-gray-400">→</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'count' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers size={20} className="text-primary-500" />
              选择题目数量
            </h3>
            <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[3, 5, 8, 10].map(count => (
              <button
                key={count}
                onClick={() => handleCountSelect(count)}
                className="
                  p-4 text-center rounded-lg border border-gray-200 dark:border-gray-600
                  hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-all
                "
              >
                <div className="text-2xl font-bold text-primary-600">{count}</div>
                <div className="text-xs text-gray-500">道</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator size={20} className="text-primary-500" />
              确认生成
            </h3>
            <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">知识点：</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {MATH_TOPICS.find(t => t.id === params.topic)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">难度：</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {DIFFICULTY_LEVELS.find(d => d.id === params.difficulty)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">数量：</span>
                <span className="font-medium text-gray-900 dark:text-white">{params.count} 道</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="
              w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg
              font-medium transition-colors flex items-center justify-center gap-2
            "
          >
            <Calculator size={18} />
            开始生成题目
          </button>
        </div>
      )}
    </div>
  )
}

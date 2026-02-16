// src/components/chat/GuidedPPTGenerator.tsx
import { useState } from 'react'
import { Presentation, FileUp, BarChart3, Layers } from 'lucide-react'
import { useChatStore } from '../../stores/chat'

interface PPTParams {
  examName: string
  focusAreas: string[]
  slideCount: number
  includeAnalysis: boolean
  includeRemediation: boolean
}

const FOCUS_AREAS = [
  { id: 'high-error', label: '高频错题', description: '错误率 > 50% 的题目' },
  { id: 'concept', label: '概念混淆', description: '基础概念理解不清' },
  { id: 'calculation', label: '计算失误', description: '计算过程和结果错误' },
  { id: 'method', label: '方法不当', description: '解题方法选择不合适' },
  { id: 'key-points', label: '重点难点', description: '考试重点和学生难点' },
]

export function GuidedPPTGenerator() {
  const [step, setStep] = useState<'upload' | 'focus' | 'config' | 'confirm'>('upload')
  const [params, setParams] = useState<Partial<PPTParams>>({
    focusAreas: [],
    includeAnalysis: true,
    includeRemediation: true,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const { sendMessage } = useChatStore()

  const handleFileUpload = () => {
    // 模拟文件上传
    setParams(prev => ({ ...prev, examName: '期中数学试卷' }))
    setStep('focus')
  }

  const handleFocusSelect = (areaId: string) => {
    setParams(prev => {
      const current = prev.focusAreas || []
      if (current.includes(areaId)) {
        return { ...prev, focusAreas: current.filter(id => id !== areaId) }
      } else {
        return { ...prev, focusAreas: [...current, areaId] }
      }
    })
  }

  const handleConfigNext = () => {
    if (params.focusAreas && params.focusAreas.length > 0) {
      setStep('confirm')
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // 模拟生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const message = `已为您生成《${params.examName}》讲评课件，包含${params.slideCount}页幻灯片。`
    sendMessage(message)
    
    setIsGenerating(false)
  }

  const handleBack = () => {
    if (step === 'focus') setStep('upload')
    if (step === 'config') setStep('focus')
    if (step === 'confirm') setStep('config')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md">
      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 mb-4">
        {['upload', 'focus', 'config', 'confirm'].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
              ${step === s ? 'bg-primary-500 text-white' : 
                ['upload', 'focus', 'config', 'confirm'].indexOf(step) > idx 
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
      {step === 'upload' && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileUp size={20} className="text-primary-500" />
            上传试卷
          </h3>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <FileUp size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              拖拽试卷文件到此处，或点击上传
            </p>
            <p className="text-xs text-gray-500 mb-4">
              支持 PDF、Word、图片格式
            </p>
            <button
              onClick={handleFileUpload}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              选择文件
            </button>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => setStep('focus')}
              className="text-sm text-gray-500 hover:text-primary-600"
            >
              跳过上传，手动选择 →
            </button>
          </div>
        </div>
      )}

      {step === 'focus' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-primary-500" />
              选择讲评重点
            </h3>
            <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
          </div>
          <div className="space-y-2">
            {FOCUS_AREAS.map(area => (
              <button
                key={area.id}
                onClick={() => handleFocusSelect(area.id)}
                className={`
                  w-full p-3 text-left rounded-lg border transition-all
                  ${params.focusAreas?.includes(area.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`
                    w-4 h-4 rounded border flex items-center justify-center
                    ${params.focusAreas?.includes(area.id)
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-gray-300'
                    }
                  `}>
                    {params.focusAreas?.includes(area.id) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {area.label}
                    </div>
                    <div className="text-xs text-gray-500">{area.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={handleConfigNext}
            disabled={!params.focusAreas || params.focusAreas.length === 0}
            className="
              w-full mt-4 py-2 rounded-lg font-medium
              bg-primary-500 text-white hover:bg-primary-600
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors
            "
          >
            下一步
          </button>
        </div>
      )}

      {step === 'config' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers size={20} className="text-primary-500" />
              课件配置
            </h3>
            <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                幻灯片数量
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[8, 12, 16, 20].map(count => (
                  <button
                    key={count}
                    onClick={() => setParams(prev => ({ ...prev, slideCount: count }))}
                    className={`
                      p-3 text-center rounded-lg border transition-all
                      ${params.slideCount === count
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                      }
                    `}
                  >
                    <div className="text-lg font-bold text-primary-600">{count}</div>
                    <div className="text-xs text-gray-500">页</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={params.includeAnalysis}
                  onChange={(e) => setParams(prev => ({ ...prev, includeAnalysis: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  包含错题分析（错误率、常见错误）
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={params.includeRemediation}
                  onChange={(e) => setParams(prev => ({ ...prev, includeRemediation: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  包含补救练习（变式题）
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={() => setStep('confirm')}
            className="w-full mt-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            下一步
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Presentation size={20} className="text-primary-500" />
              确认生成
            </h3>
            <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">试卷名称：</span>
                <span className="font-medium text-gray-900 dark:text-white">{params.examName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">讲评重点：</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {params.focusAreas?.length} 项
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">幻灯片数量：</span>
                <span className="font-medium text-gray-900 dark:text-white">{params.slideCount} 页</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">包含分析：</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {params.includeAnalysis ? '是' : '否'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">包含练习：</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {params.includeRemediation ? '是' : '否'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="
              w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg
              font-medium transition-colors flex items-center justify-center gap-2
              disabled:bg-gray-400 disabled:cursor-not-allowed
            "
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                正在生成课件...
              </>
            ) : (
              <>
                <Presentation size={18} />
                生成讲评课件
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

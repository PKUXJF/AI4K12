// src/components/settings/AISettings.tsx
import { useState } from 'react'
import { Key, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { useAppStore } from '../../stores/app'

export function AISettings() {
  const { settings, updateSettings } = useAppStore()
  const [apiKey, setApiKey] = useState(settings.apiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const handleSave = () => {
    updateSettings({ apiKey })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleTest = async () => {
    if (!apiKey) return
    
    setIsTesting(true)
    setTestResult(null)
    
    try {
      // 测试API连接
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })
      
      if (response.ok) {
        setTestResult('success')
      } else {
        setTestResult('error')
      }
    } catch {
      setTestResult('error')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        AI 模型配置
      </h2>

      <div className="space-y-6">
        {/* API Key 设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="text-primary-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              OpenAI API Key
            </h3>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            请输入您的 OpenAI API Key。您的 Key 将本地存储，不会上传到任何服务器。
            <br />
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              获取 API Key →
            </a>
          </p>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="
                w-full px-4 py-3 pr-12
                border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="
                px-4 py-2 bg-primary-500 text-white rounded-lg
                hover:bg-primary-600 transition-colors
                flex items-center gap-2
              "
            >
              {isSaved ? (
                <>
                  <Check size={18} />
                  已保存
                </>
              ) : (
                '保存设置'
              )}
            </button>

            <button
              onClick={handleTest}
              disabled={!apiKey || isTesting}
              className="
                px-4 py-2 border border-gray-300 dark:border-gray-600
                text-gray-700 dark:text-gray-300 rounded-lg
                hover:bg-gray-50 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              {isTesting ? '测试中...' : '测试连接'}
            </button>
          </div>

          {testResult === 'success' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
              <Check size={18} />
              API 连接成功！
            </div>
          )}

          {testResult === 'error' && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              API 连接失败，请检查 Key 是否正确
            </div>
          )}
        </div>

        {/* 模型选择 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            模型选择
          </h3>
          
          <div className="space-y-3">
            {[
              { id: 'gpt-4', name: 'GPT-4', desc: '最强性能，适合复杂题目生成' },
              { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', desc: '性价比高，响应速度快' },
            ].map((model) => (
              <label
                key={model.id}
                className="
                  flex items-start gap-3 p-4 rounded-lg border cursor-pointer
                  border-gray-200 dark:border-gray-600
                  hover:border-primary-300 dark:hover:border-primary-700
                  transition-colors
                "
              >
                <input
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={settings.model === model.id}
                  onChange={(e) => updateSettings({ model: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {model.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-400">
          <h4 className="font-semibold mb-2">💡 使用提示</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>API Key 仅保存在您的本地设备上</li>
            <li>每次生成题目会消耗一定的 API 额度</li>
            <li>建议先使用 GPT-3.5 测试，确认效果后再切换到 GPT-4</li>
            <li>如果遇到生成失败，请检查网络连接和 API Key 有效性</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

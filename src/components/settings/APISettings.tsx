// src/components/settings/APISettings.tsx
import { useState } from 'react'
import { Key, Eye, EyeOff, Save, TestTube, Server } from 'lucide-react'
import { testKIMIConnection } from '../../services/kimiApi'
import { getTeacherProfile, saveTeacherProfile } from '../../services/teacherProfile'
import type { Subject } from '../../types'

interface APISettingsProps {
  onClose?: () => void
}

export function APISettings({ onClose }: APISettingsProps) {
  const teacherProfile = getTeacherProfile()

  const [apiKey, setApiKey] = useState(localStorage.getItem('kimi_api_key') || '')
  const [apiBase, setApiBase] = useState(localStorage.getItem('kimi_api_base') || '')
  const [apiModel, setApiModel] = useState(localStorage.getItem('kimi_api_model') || 'Pro/moonshotai/Kimi-K2.5')
  const [teacherName, setTeacherName] = useState(teacherProfile?.name || '')
  const [school, setSchool] = useState(teacherProfile?.school || '')
  const [position, setPosition] = useState(teacherProfile?.position || '数学教师')
  const [subject, setSubject] = useState<Subject>(teacherProfile?.subject || 'math')
  const [gradeLevel, setGradeLevel] = useState(teacherProfile?.gradeLevel || '高一')
  const [classCount, setClassCount] = useState(teacherProfile?.classCount || 1)
  const [classSize, setClassSize] = useState(teacherProfile?.classSize || 45)
  const [textbookVersion, setTextbookVersion] = useState(teacherProfile?.textbookVersion || '人教A版')
  const [examRegion, setExamRegion] = useState(teacherProfile?.examRegion || '新高考I卷')
  const [showKey, setShowKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)

    saveTeacherProfile({
      name: teacherName.trim(),
      school: school.trim(),
      position: position.trim() || '数学教师',
      subject,
      gradeLevel: gradeLevel.trim() || '高一',
      classCount: Math.max(1, Number(classCount) || 1),
      classSize: Math.max(1, Number(classSize) || 45),
      textbookVersion: textbookVersion.trim() || '人教A版',
      examRegion: examRegion.trim() || '新高考I卷',
    })

    localStorage.setItem('kimi_api_key', apiKey)
    localStorage.setItem('kimi_api_base', apiBase)
    localStorage.setItem('kimi_api_model', apiModel)
    setTimeout(() => {
      setIsSaving(false)
      onClose?.()
    }, 500)
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: '请输入API Key' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    // 使用Tauri后端测试连接（避免CORS问题）
    const result = await testKIMIConnection(apiKey, apiBase)
    setTestResult(result)
    setIsTesting(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Key size={20} className="text-primary-500" />
        API 设置
      </h2>

      <div className="space-y-4">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入您的 KIMI API Key"
              className="
                w-full px-4 py-2 pr-10
                border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
              "
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            API Key 仅存储在本地浏览器中，不会上传到服务器
          </p>
        </div>

        {/* API Base URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-1">
              <Server size={14} />
              API 地址 (OpenAI Compatible)
            </span>
          </label>
          <input
            type="text"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            placeholder="https://api.siliconflow.cn/v1"
            className="
              w-full px-4 py-2
              border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
            "
          />
          <p className="mt-1 text-xs text-gray-500">
            支持 SiliconFlow、OpenAI 等 Compatible API
          </p>
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            模型名称
          </label>
          <input
            type="text"
            value={apiModel}
            onChange={(e) => setApiModel(e.target.value)}
            placeholder="Pro/moonshotai/Kimi-K2.5"
            className="
              w-full px-4 py-2
              border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
            "
          />
          <p className="mt-1 text-xs text-green-600">
            ✅ 推荐：Pro/moonshotai/Kimi-K2.5 (SiliconFlow)
          </p>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">教师信息（用于动态提示词）</h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="王老师"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">学校</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="实验中学"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">职位</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="高二数学教师"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">学科</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="math">数学</option>
                  <option value="physics">物理</option>
                  <option value="chemistry">化学</option>
                  <option value="biology">生物</option>
                  <option value="chinese">语文</option>
                  <option value="english">英语</option>
                  <option value="history">历史</option>
                  <option value="geography">地理</option>
                  <option value="politics">政治</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">年级</label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="高二"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">教材版本</label>
                <input
                  type="text"
                  value={textbookVersion}
                  onChange={(e) => setTextbookVersion(e.target.value)}
                  placeholder="人教A版"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">带班数量</label>
                <input
                  type="number"
                  min={1}
                  value={classCount}
                  onChange={(e) => setClassCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">每班人数</label>
                <input
                  type="number"
                  min={1}
                  value={classSize}
                  onChange={(e) => setClassSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">考试地区/卷型</label>
              <input
                type="text"
                value={examRegion}
                onChange={(e) => setExamRegion(e.target.value)}
                placeholder="新高考I卷"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {testResult && (
          <div className={`
            p-3 rounded-lg text-sm
            ${testResult.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
            }
          `}>
            {testResult.message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleTest}
            disabled={isTesting || !apiKey.trim()}
            className="
              flex-1 flex items-center justify-center gap-2
              px-4 py-2
              border border-gray-300 dark:border-gray-600
              text-gray-700 dark:text-gray-300
              rounded-lg
              hover:bg-gray-50 dark:hover:bg-gray-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {isTesting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                测试中...
              </>
            ) : (
              <>
                <TestTube size={18} />
                测试连接
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="
              flex-1 flex items-center justify-center gap-2
              px-4 py-2
              bg-primary-500 text-white
              rounded-lg
              hover:bg-primary-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save size={18} />
                保存
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500">
          💡 提示：API 与教师画像都仅保存在本地浏览器中
        </p>
      </div>
    </div>
  )
}

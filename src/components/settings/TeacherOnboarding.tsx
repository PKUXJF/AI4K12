import { useMemo, useState } from 'react'
import { BookOpen, School, UserRound, Users } from 'lucide-react'
import type { Subject } from '../../types'
import { getDefaultTeacherProfile, saveTeacherProfile } from '../../services/teacherProfile'

interface TeacherOnboardingProps {
  onComplete: () => void
}

const SUBJECT_OPTIONS: Array<{ value: Subject; label: string }> = [
  { value: 'math', label: '数学' },
  { value: 'physics', label: '物理' },
  { value: 'chemistry', label: '化学' },
  { value: 'biology', label: '生物' },
  { value: 'chinese', label: '语文' },
  { value: 'english', label: '英语' },
  { value: 'history', label: '历史' },
  { value: 'geography', label: '地理' },
  { value: 'politics', label: '政治' },
]

const GRADE_OPTIONS = ['高一', '高二', '高三', '初一', '初二', '初三']

export function TeacherOnboarding({ onComplete }: TeacherOnboardingProps) {
  const defaultProfile = useMemo(() => getDefaultTeacherProfile(), [])

  const [name, setName] = useState(defaultProfile.name)
  const [school, setSchool] = useState(defaultProfile.school)
  const [position, setPosition] = useState(defaultProfile.position)
  const [subject, setSubject] = useState<Subject>(defaultProfile.subject)
  const [gradeLevel, setGradeLevel] = useState(defaultProfile.gradeLevel)
  const [classCount, setClassCount] = useState(defaultProfile.classCount)
  const [classSize, setClassSize] = useState(defaultProfile.classSize)
  const [textbookVersion, setTextbookVersion] = useState(defaultProfile.textbookVersion)
  const [examRegion, setExamRegion] = useState(defaultProfile.examRegion)

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = () => {
    if (!name.trim() || !school.trim() || !position.trim()) {
      setError('请先填写姓名、学校和职位')
      return
    }

    setSaving(true)
    saveTeacherProfile({
      name: name.trim(),
      school: school.trim(),
      position: position.trim(),
      subject,
      gradeLevel: gradeLevel.trim() || '高一',
      classCount: Math.max(1, Number(classCount) || 1),
      classSize: Math.max(1, Number(classSize) || 45),
      textbookVersion: textbookVersion.trim() || '人教A版',
      examRegion: examRegion.trim() || '新高考I卷',
    })

    setTimeout(() => {
      setSaving(false)
      onComplete()
    }, 250)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">首次初始化教学信息</h2>
          <p className="text-sm text-gray-500 mt-1">系统会把这些信息自动注入提示词，用于个性化出题与教学建议。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <UserRound size={14} /> 姓名
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例如：王老师"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <School size={14} /> 学校
            </span>
            <input
              value={school}
              onChange={(event) => setSchool(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例如：实验中学"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">职位</span>
            <input
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例如：高二数学教师"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <BookOpen size={14} /> 学科
            </span>
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value as Subject)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">学段/年级</span>
            <select
              value={gradeLevel}
              onChange={(event) => setGradeLevel(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">教材版本</span>
            <input
              value={textbookVersion}
              onChange={(event) => setTextbookVersion(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例如：人教A版"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Users size={14} /> 带班数量
            </span>
            <input
              type="number"
              min={1}
              value={classCount}
              onChange={(event) => setClassCount(Number(event.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">每班人数</span>
            <input
              type="number"
              min={1}
              value={classSize}
              onChange={(event) => setClassSize(Number(event.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">考试地区/卷型</span>
            <input
              value={examRegion}
              onChange={(event) => setExamRegion(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例如：新高考I卷"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {saving ? '保存中...' : '完成初始化'}
          </button>
        </div>
      </div>
    </div>
  )
}

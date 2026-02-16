import type { Subject, TeacherProfile } from '../types'

const TEACHER_PROFILE_STORAGE_KEY = 'ai4edu_teacher_profile_v1'

const DEFAULT_PROFILE: TeacherProfile = {
  name: '',
  school: '',
  position: '数学教师',
  subject: 'math',
  gradeLevel: '高一',
  classSize: 45,
  classCount: 1,
  textbookVersion: '人教A版',
  examRegion: '新高考I卷',
  updatedAt: new Date().toISOString(),
}

function normalizeSubject(subject: string): Subject {
  const allowedSubjects: Subject[] = [
    'math',
    'physics',
    'chemistry',
    'biology',
    'chinese',
    'english',
    'history',
    'geography',
    'politics',
  ]

  return allowedSubjects.includes(subject as Subject) ? (subject as Subject) : 'math'
}

export function getDefaultTeacherProfile(): TeacherProfile {
  return { ...DEFAULT_PROFILE }
}

export function getTeacherProfile(): TeacherProfile | null {
  try {
    const raw = localStorage.getItem(TEACHER_PROFILE_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<TeacherProfile>

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      subject: normalizeSubject(String(parsed.subject ?? DEFAULT_PROFILE.subject)),
      classSize: Number(parsed.classSize ?? DEFAULT_PROFILE.classSize),
      classCount: Number(parsed.classCount ?? DEFAULT_PROFILE.classCount),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function hasTeacherProfile(): boolean {
  const profile = getTeacherProfile()
  if (!profile) {
    return false
  }

  return Boolean(profile.name.trim() && profile.school.trim() && profile.position.trim())
}

export function saveTeacherProfile(profile: Omit<TeacherProfile, 'updatedAt'> | TeacherProfile): TeacherProfile {
  const normalized: TeacherProfile = {
    ...DEFAULT_PROFILE,
    ...profile,
    subject: normalizeSubject(String(profile.subject ?? DEFAULT_PROFILE.subject)),
    classSize: Number(profile.classSize ?? DEFAULT_PROFILE.classSize),
    classCount: Number(profile.classCount ?? DEFAULT_PROFILE.classCount),
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(TEACHER_PROFILE_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

// src/types/index.ts

// 聊天相关类型
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  choices?: ChoiceOption[]
  metadata?: Record<string, any>
  createdAt: string
}

export interface ChoiceOption {
  id: string
  label: string
  description?: string
  icon?: string
  action?: string
}

export interface Conversation {
  id: string
  title: string
  subject: string
  grade: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// 学科相关类型
export type Subject = 'math' | 'physics' | 'chemistry' | 'biology' | 
                     'chinese' | 'english' | 'history' | 'geography' | 'politics'

export type Grade = 'elementary' | 'middle' | 'high'

export interface SubjectInfo {
  id: Subject
  name: string
  icon: string
  category: 'science' | 'arts' | 'art' | 'tech'
}

export interface TeacherProfile {
  name: string
  school: string
  position: string
  subject: Subject
  gradeLevel: string
  classSize: number
  classCount: number
  textbookVersion: string
  examRegion: string
  updatedAt: string
}

// 题目相关类型
export interface Question {
  id: string
  content: string
  answer: string
  explanation: string
  difficulty: 'basic' | 'medium' | 'hard' | 'veryHard'
  questionType: 'singleChoice' | 'multipleChoice' | 'fillBlank' | 'essay'
  knowledgePoints: string[]
  hasGraph: boolean
  graphData?: string
  latexFormulas: string[]
}

export interface GenerateQuestionsParams {
  topic: string
  difficulty: string
  questionTypes: string[]
  count: number
  requireGraph: boolean
  requireLatex: boolean
}

// 设置类型
export interface Settings {
  apiKey?: string
  apiBase?: string
  model: string
  theme: 'light' | 'dark' | 'system'
  language: string
  autoSave: boolean
  subject: string
  grade: string
}

// PPT相关类型
export interface PPTSlide {
  id: string
  type: 'title' | 'content' | 'question' | 'analysis' | 'summary'
  title: string
  content: string
  questionData?: Question
}

export interface PPTTemplate {
  id: string
  name: string
  description: string
  slides: PPTSlide[]
}

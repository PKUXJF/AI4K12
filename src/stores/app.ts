// src/stores/app.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject, Grade, Settings } from '../types'

interface AppState {
  // 用户学科信息
  currentSubject: Subject
  currentGrade: Grade
  
  // 侧边栏状态
  sidebarOpen: boolean
  
  // 当前会话
  currentConversationId: string | null
  
  // 设置
  settings: Settings
  
  // 操作
  setSubject: (subject: Subject) => void
  setGrade: (grade: Grade) => void
  toggleSidebar: () => void
  setCurrentConversation: (id: string | null) => void
  updateSettings: (settings: Partial<Settings>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentSubject: 'math',
      currentGrade: 'high',
      sidebarOpen: true,
      currentConversationId: null,
      settings: {
        model: 'gpt-3.5-turbo',
        theme: 'light',
        language: 'zh-CN',
        autoSave: true,
        subject: 'math',
        grade: 'high',
        apiKey: '',
      },
      
      setSubject: (subject) => set({ currentSubject: subject }),
      setGrade: (grade) => set({ currentGrade: grade }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentConversation: (id) => set({ currentConversationId: id }),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'ai4edu-app-storage',
    }
  )
)

// src/stores/chat.ts
import { create } from 'zustand'
import { generateQuestions, canUseRealAPI } from '../services/questionApi'
import type { Message, Conversation } from '../types'

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  messages: Message[]
  
  // 操作
  createConversation: () => string
  loadConversation: (id: string) => void
  sendMessage: (content: string) => Promise<void>
  selectChoice: (choiceId: string) => Promise<void>
  deleteConversation: (id: string) => void
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  messages: [],
  
  createConversation: () => {
    const id = Date.now().toString()
    const newConversation: Conversation = {
      id,
      title: '新对话',
      subject: 'math',
      grade: 'high',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: id,
      messages: [],
    }))
    
    return id
  },
  
  loadConversation: (id) => {
    const conversation = get().conversations.find((c) => c.id === id)
    if (conversation) {
      set({
        currentConversationId: id,
        messages: conversation.messages,
      })
    }
  },
  
  sendMessage: async (content) => {
    const { currentConversationId } = get()
    
    if (!currentConversationId) {
      get().createConversation()
    }
    
    // 特殊指令：直接显示引导组件
    if (content === '[START_QUESTION_GENERATOR]') {
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '[START_QUESTION_GENERATOR]',
        createdAt: new Date().toISOString(),
      }
      set((state) => ({
        messages: [...state.messages, systemMessage],
      }))
      return
    }
    
    if (content === '[START_PPT_GENERATOR]') {
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '[START_PPT_GENERATOR]',
        createdAt: new Date().toISOString(),
      }
      set((state) => ({
        messages: [...state.messages, systemMessage],
      }))
      return
    }
    
    if (content === '[START_QUESTION_ADAPT]') {
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '[START_QUESTION_ADAPT]',
        createdAt: new Date().toISOString(),
      }
      set((state) => ({
        messages: [...state.messages, systemMessage],
      }))
      return
    }
    
    // 处理实际的题目生成请求
    if (content.includes('请为我生成') && content.includes('题目')) {
      // 解析参数
      const countMatch = content.match(/(\d+)道/)
      const count = countMatch ? parseInt(countMatch[1]) : 3
      
      const difficultyMatch = content.match(/(基础|中档|困难)/)
      const difficultyMap: Record<string, string> = {
        '基础': 'basic',
        '中档': 'medium',
        '困难': 'hard'
      }
      const difficulty = difficultyMatch ? difficultyMap[difficultyMatch[1]] : 'medium'
      
      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }
      
      set((state) => ({
        messages: [...state.messages, userMessage],
        isLoading: true,
      }))
      
      // 添加加载状态消息（在try外部声明以便catch可以访问）
      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⏳ 正在生成题目，请稍候...',
        createdAt: new Date().toISOString(),
      }
      set((state) => ({
        messages: [...state.messages, loadingMessage],
      }))
      
      try {
        // 调用API生成题目
        const questions = await generateQuestions({
          topic: 'derivatives', // 简化处理
          difficulty,
          count,
          onProgress: (_status, message) => {
            // 更新加载消息
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === loadingMessage.id
                  ? { ...msg, content: `⏳ ${message}` }
                  : msg
              ),
            }))
          },
        })
        
        // 构建回复内容
        let responseContent = `✅ 已为您生成 ${questions.length} 道题目：\n\n`
        questions.forEach((q, idx) => {
          responseContent += `**第 ${idx + 1} 题**\n`
          responseContent += `${q.content}\n\n`
          responseContent += `**答案：** ${q.answer}\n`
          responseContent += `**解析：** ${q.explanation}\n\n`
          responseContent += `---\n\n`
        })
        
        // 移除加载消息并添加最终回复
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: responseContent,
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          messages: [...state.messages.filter(m => m.id !== loadingMessage.id), aiMessage],
          isLoading: false,
        }))
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知错误'
        const isUsingAPI = canUseRealAPI()
        
        const errorContent = isUsingAPI
          ? `❌ API调用失败：${errorMsg}\n\n请检查：\n1. API Key是否正确\n2. 网络连接是否正常\n3. 稍后重试或暂时使用模拟数据`
          : '❌ 生成题目时出错，请稍后重试。'
        
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: errorContent,
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          messages: [...state.messages.filter(m => m.id !== loadingMessage.id), errorMessage],
          isLoading: false,
        }))
      }
      return
    }
    
    // 普通消息处理
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }))
    
    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '收到您的消息！我可以帮您：\n\n1. **智能出题** - 生成高中数学练习题\n2. **制作课件** - 生成试卷讲评PPT\n3. **改编题目** - 调整题目难度和类型\n\n请点击下方按钮或输入您的需求。',
        choices: [
          { id: '1', label: '出题', icon: 'Pencil', description: '生成练习题' },
          { id: '2', label: '做课件', icon: 'Presentation', description: '生成PPT' },
          { id: '3', label: '改题目', icon: 'Edit', description: '改编题目' },
        ],
        createdAt: new Date().toISOString(),
      }
      
      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
      }))
    }, 800)
  },
  
  selectChoice: async (choiceId) => {
    const { sendMessage } = get()
    
    // 处理不同的选择
    switch (choiceId) {
      case '1': // 出题
        sendMessage('[START_QUESTION_GENERATOR]')
        break
      case '2': // 做课件
        sendMessage('[START_PPT_GENERATOR]')
        break
      case '3': // 改题目
        sendMessage('[START_QUESTION_ADAPT]')
        break
      default:
        console.log('Selected choice:', choiceId)
    }
  },
  
  deleteConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId:
        state.currentConversationId === id ? null : state.currentConversationId,
    }))
  },
}))

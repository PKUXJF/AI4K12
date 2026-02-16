// src/services/ai.ts
import { useAppStore } from '../stores/app'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GenerateOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

// 系统Prompt：高中数学题目生成专家
const QUESTION_GENERATOR_PROMPT = `你是一位资深的高中数学教师，专门负责设计高质量的数学练习题。

你的任务是根据用户的要求，生成符合高考标准的高中数学题目。

生成要求：
1. 题目必须准确、严谨，符合数学规范
2. 难度要符合用户指定的级别（基础/中档/困难）
3. 每道题都要包含：题目内容、详细解答、解题思路
4. 使用 LaTeX 格式书写数学公式（用 $ 包裹）
5. 题目要有代表性，能考查核心知识点

输出格式：
【第X题】
题目：[题目内容，包含LaTeX公式]

【解答】
[详细解答步骤]

【解析】
[解题思路和方法总结]

---`

// 生成题目
export async function generateQuestions(
  params: {
    topic: string
    difficulty: string
    count: number
  },
  onStream?: (chunk: string) => void
): Promise<string> {
  const { settings } = useAppStore.getState()
  
  if (!settings.apiKey) {
    throw new Error('请先配置 OpenAI API Key')
  }

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: QUESTION_GENERATOR_PROMPT
    },
    {
      role: 'user',
      content: `请生成${params.count}道${params.difficulty}难度的${params.topic}题目，要求：
1. 题目质量高，符合高考标准
2. 包含详细解答和解析
3. 使用LaTeX格式书写公式`
    }
  ]

  if (onStream) {
    return streamChat(messages, onStream)
  } else {
    const response = await chat(messages)
    return response
  }
}

// 普通对话
export async function chat(
  messages: ChatMessage[],
  options: GenerateOptions = {}
): Promise<string> {
  const { settings } = useAppStore.getState()
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || settings.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'API 请求失败')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 流式对话
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  options: GenerateOptions = {}
): Promise<string> {
  const { settings } = useAppStore.getState()
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || settings.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'API 请求失败')
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''

  if (!reader) {
    throw new Error('无法读取响应流')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') continue
          
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            
            if (content) {
              fullContent += content
              onChunk(content)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullContent
}

// 测试API连接
export async function testConnection(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

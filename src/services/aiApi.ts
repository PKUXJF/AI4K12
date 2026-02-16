// src/services/aiApi.ts - 使用硅基流动 SiliconFlow API 调用方案
import type { Question } from '../types'
import { getTeacherProfile } from './teacherProfile'

interface GenerateQuestionsParams {
  topic: string
  difficulty: string
  count: number
}

// 基础系统提示词
const BASE_SYSTEM_PROMPT = `你是高中数学特级教师，请根据要求生成数学题。

【输出格式】
请按以下格式输出每道题：

【第1题】
题目：（题目内容，使用LaTeX公式用$包裹）

解答：（详细解题步骤）

答案：（最终答案）

---

【第2题】
...

【要求】
1. 符合高考命题风格
2. 包含完整题目、详细解答和答案  
3. 使用LaTeX格式编写数学公式（用$包裹）`;

function buildSystemPrompt(): string {
  const profile = getTeacherProfile()

  if (!profile) {
    return BASE_SYSTEM_PROMPT
  }

  const subjectMap: Record<string, string> = {
    math: '数学',
    physics: '物理',
    chemistry: '化学',
    biology: '生物',
    chinese: '语文',
    english: '英语',
    history: '历史',
    geography: '地理',
    politics: '政治',
  }

  const teacherContext = [
    '【教师画像】',
    `姓名：${profile.name || '未填写'}`,
    `学校：${profile.school || '未填写'}`,
    `职位：${profile.position || '未填写'}`,
    `学科：${subjectMap[profile.subject] || profile.subject}`,
    `年级：${profile.gradeLevel || '未填写'}`,
    `教材版本：${profile.textbookVersion || '未填写'}`,
    `带班情况：${profile.classCount}个班，每班约${profile.classSize}人`,
    `考试地区/卷型：${profile.examRegion || '未填写'}`,
    '',
    '【行为要求】',
    '1. 题目风格要匹配该教师学段、教材和考区。',
    '2. 如果用户未说明关键条件（知识点、难度、题量），先给出最短的澄清问题，再生成题目。',
    '3. 不要重复追问已经在教师画像中给出的信息。',
  ].join('\n')

  return `${BASE_SYSTEM_PROMPT}\n\n${teacherContext}`
}

// 测试API连接
export async function testSiliconFlowConnection(
  apiKey: string,
  apiBase?: string
): Promise<{ success: boolean; message: string }> {
  const base = apiBase || localStorage.getItem('ai_api_base') || 'https://api.siliconflow.cn/v1'
  
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(`${base}/models`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: controller.signal
    })
    
    if (response.ok) {
      return { success: true, message: '连接成功' }
    } else {
      const error = await response.json().catch(() => ({ error: { message: '未知错误' } }))
      return { success: false, message: error.error?.message || `错误 ${response.status}` }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, message: '连接超时' }
    }
    return { success: false, message: `连接失败: ${error.message}` }
  }
}

// 生成题目（带重试机制）
export async function generateQuestionsWithAI(
  params: GenerateQuestionsParams,
  onProgress?: (message: string) => void
): Promise<Question[]> {
  const apiKey = localStorage.getItem('ai_api_key')
  const apiBase = localStorage.getItem('ai_api_base') || 'https://api.siliconflow.cn/v1'
  const model = localStorage.getItem('ai_api_model') || 'Pro/Qwen/Qwen2.5-72B-Instruct'

  if (!apiKey) {
    throw new Error('未配置 API Key')
  }

  const topicNames: Record<string, string> = {
    'functions': '函数',
    'derivatives': '导数',
    'trigonometry': '三角函数',
    'sequences': '数列',
    'geometry': '立体几何',
    'analytic-geometry': '解析几何',
    'probability': '概率统计'
  }

  const difficultyNames: Record<string, string> = {
    'basic': '基础',
    'medium': '中档',
    'hard': '困难'
  }

  const userPrompt = `请为${topicNames[params.topic] || params.topic}出${params.count}道${difficultyNames[params.difficulty] || params.difficulty}难度的数学题。`

  onProgress?.('正在调用 AI 生成题目...')

  // 第一次尝试
  try {
    return await callAI(apiBase, apiKey, model, userPrompt, params)
  } catch (err: any) {
    console.warn('第一次请求失败:', err.message)
    onProgress?.('第一次请求失败，2秒后重试...')
    
    // 等待2秒后重试
    await new Promise(r => setTimeout(r, 2000))
    
    try {
      return await callAI(apiBase, apiKey, model, userPrompt, params)
    } catch (err2: any) {
      throw new Error(`生成失败: ${err2.message}`)
    }
  }
}

// 核心 API 调用
async function callAI(
  apiBase: string,
  apiKey: string,
  model: string,
  userPrompt: string,
  params: GenerateQuestionsParams
): Promise<Question[]> {
  const controller = new AbortController()
  
  // R1 模型需要更长的超时时间
  const isR1Model = model.includes('R1') || model.includes('r1')
  const timeoutMs = isR1Model ? 300000 : 90000 // 5分钟或90秒
  
  setTimeout(() => controller.abort(), timeoutMs)

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: userPrompt }
      ],
      temperature: isR1Model ? 0.2 : 0.7,
      max_tokens: 4096,
      stream: false
    }),
    signal: controller.signal
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  
  if (!content) {
    throw new Error('API 返回内容为空')
  }

  return parseQuestions(content, params)
}

// 解析题目
function parseQuestions(content: string, params: GenerateQuestionsParams): Question[] {
  const questions: Question[] = []
  const blocks = content.split(/【第\d+题】/).filter(b => b.trim())
  
  blocks.forEach((block, index) => {
    const lines = block.trim().split('\n')
    let content_text = ''
    let answer = ''
    let explanation = ''
    let current = 'content'
    
    for (const line of lines) {
      const t = line.trim()
      if (!t || t === '---') continue
      
      if (t.startsWith('题目：')) {
        current = 'content'
        content_text = t.slice(3).trim()
      } else if (t.startsWith('解答：')) {
        current = 'explanation'
        explanation = t.slice(3).trim()
      } else if (t.startsWith('答案：')) {
        current = 'answer'
        answer = t.slice(3).trim()
      } else {
        if (current === 'content') content_text += '\n' + t
        else if (current === 'explanation') explanation += '\n' + t
        else if (current === 'answer') answer += '\n' + t
      }
    }
    
    if (content_text) {
      questions.push({
        id: `q-${Date.now()}-${index}`,
        content: content_text.trim(),
        answer: answer.trim() || '详见解答',
        explanation: explanation.trim() || content_text.trim(),
        difficulty: params.difficulty as 'basic' | 'medium' | 'hard' | 'veryHard',
        questionType: 'essay',
        knowledgePoints: [params.topic],
        hasGraph: false,
        latexFormulas: extractFormulas(content_text)
      })
    }
  })
  
  if (questions.length === 0) {
    // 如果解析失败，把整个内容作为一道题
    questions.push({
      id: `q-${Date.now()}-0`,
      content: content,
      answer: '详见上述内容',
      explanation: content,
      difficulty: params.difficulty as 'basic' | 'medium' | 'hard' | 'veryHard',
      questionType: 'essay',
      knowledgePoints: [params.topic],
      hasGraph: false,
      latexFormulas: extractFormulas(content)
    })
  }
  
  return questions
}

function extractFormulas(text: string): string[] {
  const formulas: string[] = []
  const matches = text.match(/\$([^$]+)\$/g)
  if (matches) {
    matches.forEach(m => formulas.push(m.slice(1, -1)))
  }
  return formulas
}

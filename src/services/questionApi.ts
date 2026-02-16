// src/services/questionApi.ts
import type { Question } from '../types'
import { generateQuestionsWithKIMI } from './kimiApi'

export interface GenerateQuestionsOptions {
  topic: string
  difficulty: string
  count: number
  onProgress?: (status: 'checking' | 'generating' | 'parsing' | 'complete' | 'fallback', message: string) => void
}

// 智能题目生成API - 优先使用KIMI API，失败则回退到模拟数据
export async function generateQuestions(options: GenerateQuestionsOptions): Promise<Question[]> {
  const { topic, difficulty, count, onProgress } = options
  
  // 检查是否有API Key
  const apiKey = localStorage.getItem('kimi_api_key')
  
  if (apiKey) {
    try {
      onProgress?.('checking', '正在检查API连接...')
      
      // 调用KIMI API，设置60秒超时
      onProgress?.('generating', '正在使用KIMI AI生成题目...')
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('请求超时（60秒）')), 60000)
      })
      
      const questions = await Promise.race([
        generateQuestionsWithKIMI({ topic, difficulty, count }),
        timeoutPromise
      ])
      
      onProgress?.('complete', `成功生成 ${questions.length} 道题目`)
      return questions
    } catch (error) {
      console.error('KIMI API调用失败:', error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      onProgress?.('fallback', `API调用失败: ${errorMsg}，使用本地模拟数据...`)
      // 继续执行模拟数据生成
    }
  } else {
    onProgress?.('fallback', '未配置API Key，使用本地模拟数据...')
  }
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 模拟生成的题目
  const questions: Question[] = []
  
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q-${Date.now()}-${i}`,
      content: generateMockContent(topic, difficulty, i),
      answer: generateMockAnswer(topic, i),
      explanation: generateMockExplanation(topic, i),
      difficulty: difficulty as any,
      questionType: 'essay',
      knowledgePoints: [topic],
      hasGraph: false,
      latexFormulas: ['$f(x)$', "$f'(x)$"],
    })
  }
  
  onProgress?.('complete', `已生成 ${questions.length} 道模拟题目`)
  return questions
}

// 检查是否可以使用真实API
export function canUseRealAPI(): boolean {
  return !!localStorage.getItem('kimi_api_key')
}

function generateMockContent(topic: string, difficulty: string, index: number): string {
  const templates: Record<string, string[]> = {
    derivatives: [
      '已知函数 $f(x) = x^3 - 3x^2 + 2$，求函数的单调区间和极值。',
      '设函数 $f(x) = \\ln x - ax$，讨论函数的单调性。',
      '已知 $f(x) = e^x - x - 1$，证明 $f(x) \\geq 0$ 对所有实数 $x$ 成立。',
    ],
    functions: [
      '已知函数 $f(x) = \\frac{1}{x+1}$，求函数的定义域和值域。',
      '设 $f(x)$ 是定义在 $R$ 上的奇函数，当 $x > 0$ 时，$f(x) = x^2 - 2x$，求 $f(x)$ 的解析式。',
    ],
    trigonometry: [
      '已知 $\\sin \\alpha = \\frac{3}{5}$，$\\alpha \\in (\\frac{\\pi}{2}, \\pi)$，求 $\\sin 2\\alpha$ 的值。',
      '求函数 $f(x) = \\sin(2x + \\frac{\\pi}{3})$ 的最小正周期和单调递增区间。',
    ],
    sequences: [
      '已知等差数列 $\{a_n\}$ 中，$a_3 = 5$，$a_7 = 13$，求通项公式和前 $n$ 项和 $S_n$。',
      '设等比数列 $\{a_n\}$ 的公比 $q > 0$，若 $a_1 + a_2 = 6$，$a_3 = 8$，求 $q$ 和 $a_1$。',
    ],
    geometry: [
      '在正方体 $ABCD-A_1B_1C_1D_1$ 中，求证：$A_1C \\perp$ 平面 $BC_1D$。',
      '已知三棱锥 $P-ABC$ 中，$PA\\perp$ 平面 $ABC$，$PA=AB=AC=2$，求该三棱锥的体积。',
    ],
    'analytic-geometry': [
      '求过点 $(1, 2)$ 且与直线 $2x - 3y + 1 = 0$ 平行的直线方程。',
      '已知圆的方程为 $x^2 + y^2 - 4x + 2y - 4 = 0$，求圆心坐标和半径。',
    ],
    probability: [
      '从5名男生和3名女生中任选3人，求至少有1名女生的概率。',
      '某射手每次射击命中目标的概率为0.8，求射击3次至少命中2次的概率。',
    ],
    default: [
      `【${topic}】这是一道${difficulty}难度的测试题目，内容正在开发中...`,
    ]
  }
  
  const topicTemplates = templates[topic] || templates.default
  return topicTemplates[index % topicTemplates.length]
}

function generateMockAnswer(topic: string, index: number): string {
  const answers: Record<string, string[]> = {
    derivatives: [
      '单调递增区间：$(-\infty, 0)$ 和 $(2, +\infty)$；单调递减区间：$(0, 2)$；极大值 $f(0)=2$，极小值 $f(2)=-2$。',
      '当 $a \leq 0$ 时，$f(x)$ 在 $(0, +\infty)$ 上单调递增；当 $a > 0$ 时，$f(x)$ 在 $(0, \frac{1}{a})$ 上单调递增，在 $(\frac{1}{a}, +\infty)$ 上单调递减。',
    ],
    functions: [
      '定义域：$\{x | x \neq -1\}$；值域：$\{y | y \neq 0\}$。',
      '$f(x) = \begin{cases} x^2 - 2x, & x > 0 \\ 0, & x = 0 \\ -x^2 - 2x, & x < 0 \end{cases}$',
    ],
    trigonometry: [
      '$-\frac{24}{25}$。',
      '最小正周期为 $\pi$；单调递增区间为 $[k\pi - \frac{5\pi}{12}, k\pi + \frac{\pi}{12}]$，$k \in \mathbb{Z}$。',
    ],
    sequences: [
      '通项公式：$a_n = 2n - 1$；前 $n$ 项和：$S_n = n^2$。',
      '$q = 2$，$a_1 = 2$。',
    ],
    geometry: [
      '连接 $BD$，证明 $A_1C \perp BD$ 且 $A_1C \perp BC_1$，由线面垂直判定定理得证。',
      '$V = \frac{1}{3} \times S_{\triangle ABC} \times PA = \frac{1}{3} \times 2 \times 2 = \frac{4}{3}$。',
    ],
    'analytic-geometry': [
      '$2x - 3y + 4 = 0$。',
      '圆心 $(2, -1)$，半径 $r = 3$。',
    ],
    probability: [
      '$P = 1 - \frac{C_5^3}{C_8^3} = 1 - \frac{10}{56} = \frac{23}{28}$。',
      '$P = C_3^2 \times 0.8^2 \times 0.2 + 0.8^3 = 0.384 + 0.512 = 0.896$。',
    ],
    default: ['【答案】详见解析。']
  }
  
  const topicAnswers = answers[topic] || answers.default
  return topicAnswers[index % topicAnswers.length]
}

function generateMockExplanation(topic: string, index: number): string {
  const explanations: Record<string, string[]> = {
    derivatives: [
      '求导得 $f\'(x) = 3x^2 - 6x = 3x(x-2)$。令 $f\'(x) = 0$，得 $x = 0$ 或 $x = 2$。通过导数符号分析可得单调性和极值。',
      '定义域为 $(0, +\infty)$，$f\'(x) = \frac{1}{x} - a = \frac{1-ax}{x}$。根据 $a$ 的取值分类讨论。',
    ],
    functions: [
      '分母不为零，故 $x \neq -1$；分子为常数1，故 $y \neq 0$。',
      '利用奇函数性质 $f(-x) = -f(x)$，分别求出 $x < 0$ 时的表达式。',
    ],
    trigonometry: [
      '由 $\sin \alpha = \frac{3}{5}$ 且 $\alpha \in (\frac{\pi}{2}, \pi)$，得 $\cos \alpha = -\frac{4}{5}$，所以 $\sin 2\alpha = 2\sin\alpha\cos\alpha = -\frac{24}{25}$。',
      '最小正周期 $T = \frac{2\pi}{2} = \pi$；由 $2k\pi - \frac{\pi}{2} \leq 2x + \frac{\pi}{3} \leq 2k\pi + \frac{\pi}{2}$ 解得单调递增区间。',
    ],
    sequences: [
      '设首项为 $a_1$，公差为 $d$，则 $a_1 + 2d = 5$，$a_1 + 6d = 13$，解得 $a_1 = 1$，$d = 2$。',
      '由 $a_1(1 + q) = 6$，$a_1 q^2 = 8$，联立解得 $q = 2$（舍去负值），$a_1 = 2$。',
    ],
    geometry: [
      '在正方体中，$A_1C \perp BD$（面对角线垂直），$A_1C \perp BC_1$（三垂线定理），所以 $A_1C$ 垂直于平面 $BC_1D$ 内两条相交直线。',
      '由于 $PA \perp$ 平面 $ABC$，所以 $PA$ 是三棱锥的高，$\triangle ABC$ 是等腰直角三角形，面积为2。',
    ],
    'analytic-geometry': [
      '平行直线斜率相同，$k = \frac{2}{3}$，由点斜式得方程。',
      '配方得 $(x-2)^2 + (y+1)^2 = 9$，所以圆心 $(2, -1)$，半径 $r = 3$。',
    ],
    probability: [
      '使用对立事件，先求没有女生的概率，再用1减去。',
      '至少命中2次包括命中2次和命中3次，用二项分布公式计算。',
    ],
    default: ['【解析】这道题考查了核心概念和解题技巧，建议先理解基本原理再进行练习。']
  }
  
  const topicExplanations = explanations[topic] || explanations.default
  return topicExplanations[index % topicExplanations.length]
}

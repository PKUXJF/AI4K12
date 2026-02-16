// apps/desktop/src/renderer/services/siliconflow.ts
// SiliconFlow OpenAI-compatible API service with streaming support

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SiliconFlowConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

// Default configuration — auto-configured on first use
const DEFAULT_API_KEY = 'sk-lqduodenmjylybzcjmquritedcnaojyjnbjmjatvtehqyuzo';
const DEFAULT_MODEL = 'Pro/moonshotai/Kimi-K2.5';

/**
 * 获取 API 基础 URL
 * 开发模式通过 Vite proxy 转发以避免 CORS，生产模式直连
 */
function getBaseUrl(): string {
  // In development (Vite dev server), use proxy to avoid CORS
  // Vite proxy: /api/siliconflow/* -> https://api.siliconflow.cn/*
  if (import.meta.env.DEV) {
    return '/api/siliconflow/v1';
  }
  return 'https://api.siliconflow.cn/v1';
}

/**
 * 确保 API 配置已初始化（首次启动时写入默认值）
 */
export function ensureApiConfigured(): void {
  if (!localStorage.getItem('ai4edu_api_key')) {
    localStorage.setItem('ai4edu_api_key', DEFAULT_API_KEY);
    localStorage.setItem('ai4edu_api_model', DEFAULT_MODEL);
  }
}

/**
 * 从 localStorage 读取 SiliconFlow 配置
 */
export function getSiliconFlowConfig(): SiliconFlowConfig | null {
  ensureApiConfigured();
  const apiKey = localStorage.getItem('ai4edu_api_key');
  const model = localStorage.getItem('ai4edu_api_model');
  if (!apiKey) return null;
  return {
    apiKey,
    model: model || DEFAULT_MODEL,
    baseUrl: getBaseUrl(),
  };
}

/**
 * 调用 SiliconFlow Chat Completions API（非流式）
 */
export async function chatCompletion(
  messages: ChatMessage[],
  config?: Partial<SiliconFlowConfig>
): Promise<string> {
  const base = getSiliconFlowConfig();
  if (!base) throw new Error('未配置 API Key，请在设置中配置');

  const cfg = { ...base, ...config };
  const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: cfg.temperature ?? 0.7,
      max_tokens: cfg.maxTokens ?? 4096,
      top_p: cfg.topP ?? 0.7,
      stream: false,
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`API 请求失败 (${resp.status}): ${errorText}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 调用 SiliconFlow Chat Completions API（流式 SSE）
 * @param messages 消息列表
 * @param onChunk  每个 token chunk 回调
 * @param onDone   完成回调
 * @param signal   AbortSignal 用于取消
 * @returns 完整的响应文本
 */
export async function chatCompletionStream(
  messages: ChatMessage[],
  onChunk: (chunk: string, accumulated: string) => void,
  onDone?: (fullText: string) => void,
  signal?: AbortSignal,
  config?: Partial<SiliconFlowConfig>
): Promise<string> {
  const base = getSiliconFlowConfig();
  if (!base) throw new Error('未配置 API Key，请在设置中配置');

  const cfg = { ...base, ...config };
  const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: cfg.temperature ?? 0.7,
      max_tokens: cfg.maxTokens ?? 4096,
      top_p: cfg.topP ?? 0.7,
      stream: true,
    }),
    signal,
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`API 请求失败 (${resp.status}): ${errorText}`);
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error('无法获取响应流');

  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep last potentially incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          onDone?.(accumulated);
          return accumulated;
        }

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            accumulated += delta;
            onChunk(delta, accumulated);
          }
        } catch {
          // Ignore malformed JSON chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  onDone?.(accumulated);
  return accumulated;
}

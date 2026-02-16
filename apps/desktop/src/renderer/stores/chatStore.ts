// apps/desktop/src/renderer/stores/chatStore.ts
// Zustand store for AI4Edu chat — localStorage-backed conversations

import { create } from 'zustand';
import { chatCompletionStream, getSiliconFlowConfig } from '@/services/siliconflow';
import type { ChatMessage } from '@/services/siliconflow';
import { buildTeacherPromptPrefix, getTeacherProfile } from '@/utils/teacherPromptBuilder';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  error: string | null;
  abortController: AbortController | null;

  // Actions
  loadConversations: () => void;
  createConversation: (initialPrompt: string) => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  getActiveConversation: () => Conversation | undefined;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  clearError: () => void;
}

const STORAGE_KEY = 'ai4edu_conversations';

function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations:', e);
  }
}

function loadConversationsFromStorage(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** 从消息内容生成简短标题 */
function generateTitle(content: string): string {
  const cleaned = content.replace(/\n/g, ' ').trim();
  return cleaned.length > 30 ? cleaned.slice(0, 30) + '...' : cleaned;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
  error: null,
  abortController: null,

  loadConversations: () => {
    const conversations = loadConversationsFromStorage();
    set({ conversations });
  },

  createConversation: (initialPrompt: string) => {
    const config = getSiliconFlowConfig();
    const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();

    const conversation: Conversation = {
      id,
      title: generateTitle(initialPrompt),
      messages: [],
      createdAt: now,
      updatedAt: now,
      model: config?.model || 'Pro/moonshotai/Kimi-K2.5',
    };

    const conversations = [conversation, ...get().conversations];
    saveConversations(conversations);
    set({ conversations, activeConversationId: id });
    return id;
  },

  deleteConversation: (id: string) => {
    const conversations = get().conversations.filter((c) => c.id !== id);
    saveConversations(conversations);
    const activeId = get().activeConversationId === id ? null : get().activeConversationId;
    set({ conversations, activeConversationId: activeId });
  },

  setActiveConversation: (id: string | null) => {
    set({ activeConversationId: id, error: null });
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },

  sendMessage: async (content: string) => {
    const { activeConversationId, conversations, isStreaming } = get();
    if (!activeConversationId || isStreaming) return;

    const config = getSiliconFlowConfig();
    if (!config) {
      set({ error: '未配置 API Key，请在设置 → 教师信息中配置 AI 服务' });
      return;
    }

    const convIndex = conversations.findIndex((c) => c.id === activeConversationId);
    if (convIndex === -1) return;

    const conversation = conversations[convIndex];
    const now = Date.now();

    // Add user message
    const userMessage: Message = {
      id: `msg_${now}`,
      role: 'user',
      content,
      timestamp: now,
    };

    // Add placeholder assistant message
    const assistantMessage: Message = {
      id: `msg_${now + 1}`,
      role: 'assistant',
      content: '',
      timestamp: now + 1,
      isStreaming: true,
    };

    const updatedConv: Conversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage, assistantMessage],
      updatedAt: now,
      // Update title from first message
      title: conversation.messages.length === 0 ? generateTitle(content) : conversation.title,
    };

    const newConversations = [...conversations];
    newConversations[convIndex] = updatedConv;
    saveConversations(newConversations);

    const abortController = new AbortController();
    set({ conversations: newConversations, isStreaming: true, error: null, abortController });

    // Build messages for API
    const profile = getTeacherProfile();
    const systemPrompt = buildTeacherPromptPrefix(profile);
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...updatedConv.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
        // Remove the empty assistant placeholder from API messages
        .filter((m) => !(m.role === 'assistant' && m.content === '')),
    ];

    try {
      await chatCompletionStream(
        apiMessages,
        (_chunk, accumulated) => {
          // Update assistant message content during streaming
          const currentConvs = get().conversations;
          const ci = currentConvs.findIndex((c) => c.id === activeConversationId);
          if (ci === -1) return;
          const conv = currentConvs[ci];
          const msgs = [...conv.messages];
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            msgs[msgs.length - 1] = { ...lastMsg, content: accumulated, isStreaming: true };
          }
          const updated = [...currentConvs];
          updated[ci] = { ...conv, messages: msgs, updatedAt: Date.now() };
          set({ conversations: updated });
        },
        (fullText) => {
          // Finalize the assistant message
          const currentConvs = get().conversations;
          const ci = currentConvs.findIndex((c) => c.id === activeConversationId);
          if (ci === -1) return;
          const conv = currentConvs[ci];
          const msgs = [...conv.messages];
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            msgs[msgs.length - 1] = { ...lastMsg, content: fullText, isStreaming: false };
          }
          const updated = [...currentConvs];
          updated[ci] = { ...conv, messages: msgs, updatedAt: Date.now() };
          saveConversations(updated);
          set({ conversations: updated, isStreaming: false, abortController: null });
        },
        abortController.signal
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled — finalize whatever we have
        const currentConvs = get().conversations;
        const ci = currentConvs.findIndex((c) => c.id === activeConversationId);
        if (ci !== -1) {
          const conv = currentConvs[ci];
          const msgs = [...conv.messages];
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            msgs[msgs.length - 1] = { ...lastMsg, isStreaming: false };
          }
          const updated = [...currentConvs];
          updated[ci] = { ...conv, messages: msgs };
          saveConversations(updated);
          set({ conversations: updated, isStreaming: false, abortController: null });
        }
        return;
      }
      // Real error
      set({
        error: err.message || '请求失败，请检查网络和API配置',
        isStreaming: false,
        abortController: null,
      });
      // Remove the empty assistant message
      const currentConvs = get().conversations;
      const ci = currentConvs.findIndex((c) => c.id === activeConversationId);
      if (ci !== -1) {
        const conv = currentConvs[ci];
        const msgs = conv.messages.filter((m) => !(m.role === 'assistant' && m.content === '' && m.isStreaming));
        const updated = [...currentConvs];
        updated[ci] = { ...conv, messages: msgs };
        saveConversations(updated);
        set({ conversations: updated });
      }
    }
  },

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
  },

  clearError: () => set({ error: null }),
}));

# AI4Edu 快速启动指南

## 环境要求

- **Rust**: 1.75+ (推荐最新稳定版)
- **Node.js**: 18+ 
- **pnpm**: 8+ (推荐) 或 npm/yarn
- **Windows**: Windows 10 1809+ 或 Windows 11

## 安装步骤

### 1. 安装 Rust

```bash
# Windows (PowerShell)
winget install Rustlang.Rustup

# 或访问 https://rustup.rs/ 下载安装

# 验证
rustc --version
cargo --version
```

### 2. 安装 Node.js

```bash
# 使用 nvm-windows (推荐)
nvm install 20
nvm use 20

# 或使用 winget
winget install OpenJS.NodeJS

# 验证
node --version
npm --version
```

### 3. 安装 pnpm

```bash
npm install -g pnpm

# 验证
pnpm --version
```

### 4. 安装 Tauri 依赖

Windows 需要安装 WebView2 和 Visual Studio Build Tools：

```powershell
# WebView2 运行时（通常已预装）
# 如需安装：https://developer.microsoft.com/en-us/microsoft-edge/webview2/

# Visual Studio Build Tools（Rust 需要）
# 方式1：使用 winget
winget install Microsoft.VisualStudio.2022.BuildTools

# 方式2：手动下载
# https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
# 安装时需勾选：
# - 使用 C++ 的桌面开发
# - Windows 11/10 SDK
```

## 项目初始化

### 1. 创建 Tauri 项目

```bash
# 使用 create-tauri-app
pnpm create tauri-app@latest ai4edu

# 配置选择：
# - Project name: ai4edu
# - Identifier: com.ai4edu.app
# - Frontend language: TypeScript
# - UI template: React
# - UI flavor: TypeScript
```

### 2. 项目结构

```
ai4edu/
├── src/              # Rust 后端代码
├── src-ui/           # React 前端代码
├── Cargo.toml        # Rust 配置
└── package.json      # Node 配置
```

### 3. 安装前端依赖

```bash
cd ai4edu/src-ui

# 核心依赖
pnpm add zustand @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# 样式
pnpm add -D tailwindcss postcss autoprefixer
pnpm tailwindcss init -p

# 图标
pnpm add lucide-react
```

### 4. 配置 TailwindCSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased bg-gray-50 dark:bg-gray-900;
  }
}
```

## 核心代码模板

### 1. Rust 后端 - 基础命令

```rust
// src/lib.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub role: String,
    pub content: String,
}

#[tauri::command]
pub async fn send_message(
    message: String,
) -> Result<String, String> {
    // TODO: 实现消息处理
    Ok(format("收到消息: {}", message))
}
```

```rust
// src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lib;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            lib::send_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 2. 前端 - 基础 Chat UI

```tsx
// src-ui/src/components/Chat.tsx
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await invoke<string>('send_message', {
        message: input,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('发送失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
              思考中...
            </div>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入消息..."
            className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. 状态管理

```typescript
// src-ui/src/stores/chat.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  addMessage: (conversationId: string, message: Message) => void;
  createConversation: () => string;
  setCurrentConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      createConversation: () => {
        const id = Date.now().toString();
        const conversation: Conversation = {
          id,
          title: '新对话',
          messages: [],
          updatedAt: Date.now(),
        };
        set(state => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },

      addMessage: (conversationId, message) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);
```

## 开发命令

```bash
# 进入项目目录
cd ai4edu

# 开发模式（前后端热重载）
pnpm tauri dev

# 仅前端开发
pnpm dev

# 构建生产版本
pnpm tauri build

# 构建并生成安装包
cargo tauri build
```

## 调试技巧

### 前端调试
- Chrome DevTools: 右键 -> 检查
- React DevTools: 安装浏览器扩展

### 后端调试
- Rust 日志: `RUST_LOG=debug pnpm tauri dev`
- VSCode 调试配置:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Debug Tauri",
      "cargo": {
        "args": ["build", "--features", "tauri/dev"],
      },
      "preLaunchTask": "ui:dev"
    }
  ]
}
```

## 常见问题

### 1. WebView2 未安装
```powershell
# 安装 WebView2 运行时
winget install Microsoft.EdgeWebView2Runtime
```

### 2. 编译错误
```bash
# 清理并重新构建
cargo clean
pnpm tauri dev
```

### 3. 前端端口占用
```bash
# 修改端口
# src-ui/vite.config.ts
export default defineConfig({
  server: {
    port: 5174,  // 修改为非占用端口
  },
});
```

## 下一步

1. **阅读架构文档**: `docs/tech-architecture.md`
2. **查看 PRD**: `docs/product-requirements.md`
3. **规划开发**: `docs/roadmap.md`
4. **开始实现**: 从 Phase 1 开始

## 参考资源

- [Tauri v2 文档](https://v2.tauri.app/)
- [Tauri API](https://docs.rs/tauri/2.0.0/tauri/)
- [React 文档](https://react.dev/)
- [Rust 文档](https://doc.rust-lang.org/)

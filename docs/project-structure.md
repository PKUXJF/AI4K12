# AI4Edu 项目结构

## 目录组织

```
ai4edu/
├── src/                        # Rust 后端源码
│   ├── main.rs                 # Tauri 应用入口
│   ├── lib.rs                  # 库入口
│   ├── commands.rs             # Tauri IPC 命令
│   ├── agents/                 # Agent 系统
│   │   ├── mod.rs              # Agent 模块导出
│   │   ├── router.rs           # 意图路由器
│   │   ├── base.rs             # Agent Trait 定义
│   │   ├── context.rs          # Agent 上下文
│   │   ├── teaching.rs         # 教学助手 Agent
│   │   ├── exam.rs             # 出卷 Agent
│   │   ├── review.rs           # 评语 Agent
│   │   ├── seat.rs             # 排座位 Agent
│   │   ├── paper.rs            # 论文 Agent
│   │   └── lesson.rs           # 教案 Agent
│   ├── mcp/                    # MCP 协议实现
│   │   ├── mod.rs
│   │   ├── host.rs             # MCP Host 主控
│   │   ├── client.rs           # MCP Client
│   │   ├── transport.rs        # 传输层（stdio/sse）
│   │   ├── types.rs            # MCP 类型定义
│   │   └── registry.rs         # Skill 注册表
│   ├── llm/                    # LLM 接入层
│   │   ├── mod.rs
│   │   ├── provider.rs         # LLM Provider Trait
│   │   ├── openai.rs           # OpenAI 兼容接口
│   │   ├── ollama.rs           # Ollama 本地模型
│   │   └── manager.rs          # 模型管理器
│   ├── storage/                # 数据持久化
│   │   ├── mod.rs
│   │   ├── db.rs               # SQLite 连接池
│   │   ├── models.rs           # 数据模型
│   │   └── migrations/         # 数据库迁移
│   ├── tools/                  # 内置工具
│   │   ├── mod.rs
│   │   ├── file.rs             # 文件操作
│   │   ├── docx.rs             # Word 生成
│   │   └── calc.rs             # 计算工具
│   └── utils/                  # 工具函数
│       ├── mod.rs
│       └── error.rs            # 错误处理
│
├── src-ui/                     # React 前端
│   ├── src/
│   │   ├── components/         # React 组件
│   │   │   ├── chat/           # 聊天相关
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── InputArea.tsx
│   │   │   │   └── Thinking.tsx
│   │   │   ├── sidebar/        # 侧边栏
│   │   │   │   ├── QuickEntry.tsx
│   │   │   │   ├── HistoryPanel.tsx
│   │   │   │   └── Settings.tsx
│   │   │   └── common/         # 通用组件
│   │   │       ├── Button.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Loading.tsx
│   │   ├── stores/             # Zustand 状态
│   │   │   ├── chat.ts
│   │   │   ├── settings.ts
│   │   │   └── history.ts
│   │   ├── hooks/              # 自定义 Hooks
│   │   │   ├── useChat.ts
│   │   │   ├── useAgent.ts
│   │   │   └── useStorage.ts
│   │   ├── types/              # TypeScript 类型
│   │   │   ├── chat.ts
│   │   │   ├── agent.ts
│   │   │   └── api.ts
│   │   ├── lib/                # 工具库
│   │   │   ├── api.ts          # Tauri API 封装
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── skills/                     # 内置 MCP Skills
│   ├── docx-generator/         # Word 生成 Skill
│   │   ├── package.json
│   │   ├── index.js
│   │   └── README.md
│   ├── seat-arranger/          # 排座位 Skill
│   │   ├── package.json
│   │   ├── index.js
│   │   └── README.md
│   ├── exam-generator/         # 出卷 Skill
│   │   ├── package.json
│   │   ├── index.js
│   │   └── README.md
│   └── registry.json           # Skill 注册表
│
├── docs/                       # 文档
│   ├── tech-architecture.md
│   ├── product-requirements.md
│   └── api-reference.md
│
├── scripts/                    # 构建脚本
│   ├── build.sh
│   └── dev.sh
│
├── tests/                      # 测试
│   ├── unit/
│   └── integration/
│
├── Cargo.toml                  # Rust 依赖
├── tauri.conf.json            # Tauri 配置
└── README.md
```

## 命名规范

### 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| Rust 模块 | snake_case | `exam_agent.rs` |
| React 组件 | PascalCase | `ChatContainer.tsx` |
| 工具函数 | camelCase | `formatMessage.ts` |
| 样式文件 | kebab-case | `chat-styles.css` |
| 测试文件 | `[name].test.ts` | `router.test.rs` |

### 代码命名

| 类型 | Rust | TypeScript |
|------|------|------------|
| 结构体/类 | PascalCase | PascalCase |
| 函数/方法 | snake_case | camelCase |
| 常量 | SCREAMING_SNAKE_CASE | UPPER_SNAKE_CASE |
| 变量 | snake_case | camelCase |
| 类型别名 | PascalCase | PascalCase |

## 导入顺序

### Rust
```rust
// 1. 标准库
use std::collections::HashMap;

// 2. 外部 crate
use serde::{Deserialize, Serialize};
use tauri::command;

// 3. 内部模块
use crate::agents::Agent;
use crate::storage::Database;
```

### TypeScript
```typescript
// 1. React/框架
import React, { useState } from 'react';

// 2. 第三方库
import { invoke } from '@tauri-apps/api/core';
import { useStore } from 'zustand';

// 3. 内部模块
import { useChatStore } from '@/stores/chat';
import { Message } from '@/types/chat';

// 4. 样式
import './styles.css';
```

## 代码组织原则

### Agent 模块
```rust
// agents/mod.rs
pub mod base;
pub mod router;
pub mod teaching;
pub mod exam;
// ...

pub use base::Agent;
pub use router::IntentRouter;
```

### 错误处理
- Rust: 使用 `thiserror` 定义错误类型
- 统一错误转换，前端友好错误信息

### 异步处理
- Rust: `tokio` 运行时
- TypeScript: `async/await` + Promise

## 模块边界

### Core ↔ Agents
- Core 提供上下文和工具
- Agent 实现业务逻辑
- 通过 Trait 解耦

### Backend ↔ Frontend
- 通过 Tauri Commands 通信
- 事件流用于实时更新
- 类型共享保证一致性

### Host ↔ MCP Skills
- 通过 MCP 协议通信
- Skills 独立进程
- 标准化工具调用接口

## 代码尺寸规范

| 类型 | 建议最大行数 |
|------|-------------|
| 文件 | 500 行 |
| 函数 | 50 行 |
| 结构体 | 20 个字段 |
| 嵌套深度 | 4 层 |

## 文档规范

- 所有 public API 必须文档化
- 复杂逻辑需要行内注释
- 模块级 README 说明用途
- 示例代码说明关键用法

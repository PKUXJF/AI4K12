# AI4Edu 技术架构

## 项目概述
轻量级桌面端 K12 AI 教育 Agent 平台，采用纯自然语言交互，支持多智能体协作。

## 核心特性
- **纯自然语言交互**：无传统导航栏，对话式操作
- **多智能体架构**：场景化 Agent 自动调度
- **MCP 兼容**：支持现有 MCP Server 生态
- **本地优先**：本地部署，数据不离端
- **轻量级**：安装包 < 50MB，启动快

## 技术栈选择

### 桌面端框架：Tauri v2
**选择理由**：
- 安装包极小（相比 Electron 减少 90%+）
- Rust 后端性能优异，适合本地 AI 模型调用
- 前端技术栈自由（React/Vue/Svelte）
- 安全的跨平台能力（Windows/Linux/macOS）
- 原生系统集成（文件系统、通知、全局快捷键）

### 前端技术栈
- **框架**：React 18 + TypeScript
- **UI 组件**：TailwindCSS + Radix UI（无样式，可完全自定义）
- **状态管理**：Zustand（轻量、TypeScript 友好）
- **对话组件**：自建流式渲染组件

### 后端技术栈（Rust）
- **Agent 调度**：自研多智能体协调器
- **MCP Host**：兼容 Anthropic Model Context Protocol
- **LLM 接入**：OpenAI API 兼容层 + 本地模型支持
- **数据存储**：SQLite + rusqlite
- **配置管理**：TOML / JSON

### AI 模型支持
- **云端**：OpenAI GPT-4/GPT-3.5、Claude、国产兼容 API
- **本地**：Ollama 集成、LM Studio、本地 GGUF 模型

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Chat UI    │  │ Quick Entry │  │   History Panel     │  │
│  │  (主界面)    │  │  (快捷入口)  │  │    (历史记录)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ IPC
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Rust Tauri)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Agent Orchestrator                        │  │
│  │         (多智能体调度中心)                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│          ┌───────────────────┼───────────────────┐           │
│          ▼                   ▼                   ▼           │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │ TeachingAgent│   │  ExamAgent   │   │ ReviewAgent  │      │
│  │   (教学)      │   │   (出卷)      │   │   (评语)      │      │
│  └──────────────┘   └──────────────┘   └──────────────┘      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │  SeatAgent   │   │ PaperAgent   │   │ LessonAgent  │      │
│  │  (排座位)     │   │   (论文)      │   │   (教案)      │      │
│  └──────────────┘   └──────────────┘   └──────────────┘      │
│          │                   │                   │           │
│          └───────────────────┼───────────────────┘           │
│                              ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   MCP Host                             │  │
│  │         (MCP Client / Skill Loader)                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│          ┌───────────────────┼───────────────────┐           │
│          ▼                   ▼                   ▼           │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │   MCP Skill  │   │  MCP Skill   │   │  MCP Skill   │      │
│  │  (文档处理)   │   │  (数据计算)   │   │  (图表生成)   │      │
│  └──────────────┘   └──────────────┘   └──────────────┘      │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │ LLM Provider │   │   SQLite     │   │ File System  │      │
│  │  (模型接入)   │   │   (数据库)    │   │   (文件操作)  │      │
│  └──────────────┘   └──────────────┘   └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Agent 设计

每个场景一个 Agent，共享底层工具：

```rust
// Agent Trait 定义
trait Agent {
    fn name(&self) -> &str;
    fn description(&self) -> &str;
    fn system_prompt(&self) -> &str;
    fn tools(&self) -> Vec<Box<dyn Tool>>;
    async fn execute(&self, input: &str, context: Context) -> Result<Response>;
}

// 场景 Agent 示例
struct TeachingAgent;
struct ExamAgent;
struct ReviewAgent;
struct SeatAgent;
struct PaperAgent;
struct LessonAgent;
```

### 意图识别与路由

```rust
// 意图路由器
struct IntentRouter {
    agents: Vec<Box<dyn Agent>>,
    llm: Box<dyn LLMProvider>,
}

impl IntentRouter {
    async fn route(&self, input: &str) -> Result<&dyn Agent> {
        // 使用 LLM 判断用户意图，选择最合适的 Agent
        // 或让用户 @AgentName 直接指定
    }
}
```

## 数据存储

### SQLite 表结构

```sql
-- 会话表
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    title TEXT,
    agent_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 消息表
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id),
    role TEXT, -- 'user' | 'assistant' | 'system'
    content TEXT,
    metadata TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 配置表
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
```

## MCP 集成

### MCP Client 实现

```rust
// MCP Host 实现
struct MCPHost {
    clients: HashMap<String, MCPClient>,
}

impl MCPHost {
    async fn connect(&mut self, server_config: ServerConfig) -> Result<()>;
    async fn call_tool(&self, server: &str, tool: &str, args: Value) -> Result<Value>;
    async fn list_tools(&self, server: &str) -> Result<Vec<Tool>>;
}
```

### 支持的 MCP Servers
- **文件系统**：读写本地文档
- **计算工具**：数学计算、数据分析
- **文档生成**：Word/PDF 导出
- **图表生成**：座位图、统计图表

## 项目结构

```
ai4edu/
├── src/
│   ├── main.rs                 # Tauri 入口
│   ├── lib.rs                  # 库入口
│   ├── agents/                 # Agent 实现
│   │   ├── mod.rs
│   │   ├── router.rs           # 意图路由
│   │   ├── base.rs             # Agent Trait
│   │   ├── teaching.rs         # 教学 Agent
│   │   ├── exam.rs             # 出卷 Agent
│   │   ├── review.rs           # 评语 Agent
│   │   ├── seat.rs             # 排座 Agent
│   │   ├── paper.rs            # 论文 Agent
│   │   └── lesson.rs           # 教案 Agent
│   ├── mcp/                    # MCP 实现
│   │   ├── mod.rs
│   │   ├── host.rs             # MCP Host
│   │   ├── client.rs           # MCP Client
│   │   └── transport.rs        # 传输层
│   ├── llm/                    # LLM 接入
│   │   ├── mod.rs
│   │   ├── provider.rs         # Provider Trait
│   │   ├── openai.rs           # OpenAI 兼容
│   │   └── local.rs            # 本地模型
│   ├── storage/                # 数据存储
│   │   ├── mod.rs
│   │   ├── db.rs               # SQLite 封装
│   │   └── models.rs           # 数据模型
│   └── tools/                  # 内置工具
│       ├── mod.rs
│       ├── file.rs
│       ├── docx.rs
│       └── calc.rs
├── src-ui/                     # React 前端
│   ├── src/
│   │   ├── components/         # 组件
│   │   │   ├── Chat.tsx        # 主聊天界面
│   │   │   ├── QuickEntry.tsx  # 快捷入口
│   │   │   ├── HistoryPanel.tsx# 历史记录
│   │   │   └── Message.tsx     # 消息气泡
│   │   ├── stores/             # 状态管理
│   │   │   └── chat.ts         # 聊天状态
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── types/              # TypeScript 类型
│   │   └── App.tsx
│   ├── index.html
│   └── package.json
├── skills/                     # 内置 Skills
│   ├── docx-generator/
│   ├── seat-arranger/
│   └── exam-generator/
├── Cargo.toml
└── tauri.conf.json
```

## 性能目标

| 指标 | 目标 |
|------|------|
| 安装包大小 | < 50MB |
| 启动时间 | < 2s |
| 内存占用 | < 200MB |
| 响应延迟 | < 500ms（本地） |

## 开发计划

### Phase 1: 基础架构
- [ ] Tauri 项目搭建
- [ ] React 前端框架
- [ ] SQLite 集成
- [ ] OpenAI API 接入

### Phase 2: Agent 系统
- [ ] Agent 基础框架
- [ ] 意图路由实现
- [ ] 2-3 个核心 Agent

### Phase 3: MCP 集成
- [ ] MCP Host 实现
- [ ] 文件系统 Skill
- [ ] 文档生成 Skill

### Phase 4: 完善
- [ ] 全部场景 Agent
- [ ] UI 打磨
- [ ] 测试优化

## 技术风险

1. **MCP 生态成熟度**：协议仍在演进，需保持兼容层灵活
2. **本地模型性能**：需测试低端设备上的运行表现
3. **Windows 兼容性**：Tauri 在 Windows 上的 edge case

## 相关资源

- [Tauri Docs](https://tauri.app/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Rust LLM](https://github.com/rustformers/llm)

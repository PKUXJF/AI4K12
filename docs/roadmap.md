# AI4Edu 实现路线图

## Phase 1: 基础架构（2-3 周）

### Week 1: 项目搭建
- [ ] Tauri v2 项目初始化
- [ ] React + TypeScript 前端框架搭建
- [ ] TailwindCSS + Radix UI 配置
- [ ] Zustand 状态管理
- [ ] 基础 IPC 通信测试

### Week 2: 核心基础
- [ ] SQLite 数据库封装
- [ ] 对话数据模型
- [ ] 基础 Chat UI 实现
- [ ] 流式消息渲染
- [ ] 历史记录存储

### Week 3: LLM 接入
- [ ] OpenAI API 封装
- [ ] Provider 抽象接口
- [ ] 配置管理（API Key、模型选择）
- [ ] 本地模型支持（Ollama）
- [ ] 错误处理与重试

**产出**：能对话的基础应用

---

## Phase 2: Agent 系统（3-4 周）

### Week 4: Agent 框架
- [ ] Agent Trait 设计
- [ ] 基础 Agent 结构
- [ ] 系统 Prompt 管理
- [ ] 工具调用接口
- [ ] Agent 注册机制

### Week 5: 意图路由
- [ ] 意图识别实现
- [ ] 路由决策逻辑
- [ ] 置信度阈值
- [ ] 歧义处理（多 Agent 候选）
- [ ] 显式 Agent 调用（@语法）

### Week 6-7: 核心 Agent 实现
- [ ] TeachingAgent（教学问答）
- [ ] ExamAgent（出卷）
- [ ] QuestionAgent（出题）

**产出**：支持 3+ 场景的 Agent 系统

---

## Phase 3: MCP 集成（2-3 周）

### Week 8: MCP Host
- [ ] MCP 协议实现
- [ ] Host/Client 架构
- [ ] stdio 传输层
- [ ] Tool 发现机制
- [ ] Tool 调用执行

### Week 9: 内置 Skills
- [ ] 文件系统 Skill
- [ ] 文档生成 Skill（docx/pdf）
- [ ] 计算工具 Skill
- [ ] Skill 注册表

### Week 10: Skill 集成
- [ ] Agent 调用 Skill
- [ ] 工具结果处理
- [ ] 错误与超时处理
- [ ] Skill 权限管理

**产出**：可扩展的 Skill 系统

---

## Phase 4: 功能完善（3-4 周）

### Week 11-12: 剩余 Agent
- [ ] ReviewAgent（评语）
- [ ] SeatAgent（排座位）
- [ ] LessonAgent（教案）
- [ ] PaperAgent（论文）

### Week 13: UI 优化
- [ ] 快捷入口面板
- [ ] 历史记录侧边栏
- [ ] 设置界面
- [ ] 深色模式
- [ ] 响应式布局

### Week 14: 导入导出
- [ ] Word 导出（docx）
- [ ] PDF 导出
- [ ] Excel 导入/导出
- [ ] 图片导出（座位图）
- [ ] 数据备份恢复

**产出**：功能完整的 v0.1 版本

---

## Phase 5: 打磨优化（2-3 周）

### Week 15: 性能优化
- [ ] 启动优化
- [ ] 内存占用优化
- [ ] 大对话性能
- [ ] 虚拟滚动（长列表）

### Week 16: 稳定性
- [ ] 错误边界
- [ ] 异常恢复
- [ ] 日志系统
- [ ] 崩溃报告

### Week 17: 打包发布
- [ ] Windows 安装包
- [ ] 自动更新
- [ ] 签名配置
- [ ] 文档完善

**产出**：可发布的 v1.0 Beta

---

## 技术栈版本

```toml
# Rust 依赖
tauri = "2.0"
tokio = "1.35"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = { version = "0.11", features = ["json", "stream"] }
rusqlite = { version = "0.30", features = ["bundled"] }
thiserror = "1.0"
async-trait = "0.1"

# Node 依赖
react = "^18.2.0"
typescript = "^5.3.0"
tailwindcss = "^3.4.0"
zustand = "^4.4.0"
@tauri-apps/api = "^2.0.0"
```

## 里程碑

| 阶段 | 目标 | 预计时间 |
|------|------|----------|
| M1 | 基础对话能力 | Week 3 |
| M2 | 3+ Agent 可用 | Week 7 |
| M3 | Skill 系统就绪 | Week 10 |
| M4 | 全功能可用 | Week 14 |
| M5 | 发布就绪 | Week 17 |

**总计：约 12-17 周（3-4 个月）**

## 风险点

1. **MCP 协议变化**：关注官方更新，保持兼容层灵活
2. **Windows 兼容性**：早期就在 Windows 测试
3. **本地模型性能**：提供云端 fallback
4. **复杂文档生成**：可能需要引入外部工具

## 快速启动命令

```bash
# 1. 安装依赖
# Rust
rustup target add wasm32-unknown-unknown

# Node
npm install -g pnpm

# 2. 克隆项目
git clone <repo-url>
cd ai4edu

# 3. 安装前端依赖
cd src-ui
pnpm install
cd ..

# 4. 开发模式
pnpm tauri dev

# 5. 构建
cargo tauri build
```

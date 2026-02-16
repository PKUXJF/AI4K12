# agent.md

## 项目定位
- 当前仓库基于 `AI4Edu-Accomplish` 完整替换而来。
- 技术栈：Electron + React + TypeScript + Vite + pnpm workspace。
- 核心工作区：`apps/desktop`（桌面端主应用）。

## 目录重点
- `apps/desktop/src/main/`：Electron 主进程、IPC、存储、OpenCode 适配。
- `apps/desktop/src/preload/`：`contextBridge` 暴露 API。
- `apps/desktop/src/renderer/`：前端页面与组件。
- `packages/agent-core/`：共享核心逻辑与类型（ESM）。

## 本地开发命令
在仓库根目录执行：
- `pnpm install`
- `pnpm dev`（启动桌面开发模式）
- `pnpm typecheck`
- `pnpm lint`

仅桌面端测试：
- `pnpm -F @accomplish/desktop test`

## 当前 AI4Edu 定制（必须保留）
- 默认模型：`Pro/moonshotai/Kimi-K2.5`
- SiliconFlow OpenAI 兼容接口：`/v1/chat/completions`
- 开发模式通过 Vite 代理访问 SiliconFlow：
  - 前端使用 `/api/siliconflow/v1/...`
  - `vite.config.ts` 中配置 proxy 到 `https://api.siliconflow.cn`
- 修复过 `fail to fetch`：关键在 CORS/CSP + 代理联动。

## 编码约束
- 尽量最小改动，不重构无关模块。
- 保持 TypeScript 类型完整，不使用 `any` 逃避。
- `packages/agent-core` 是 ESM：内部相对导入要带 `.js` 后缀。
- 不修改已发布迁移文件；如需变更，新增迁移。
- 变更后至少运行 `pnpm typecheck`。

## 提交规范
- 提交信息建议：`feat: ...` / `fix: ...` / `chore: ...`
- 推送前确认：
  - `git status`
  - `pnpm typecheck`
  - 必要时执行对应 workspace 测试

## 风险提示
- `apps/desktop/index.html` 的 CSP 会影响网络请求；改动 `connect-src` 时需同步验证 API 请求。
- 若再次出现 `fail to fetch`，优先检查：
  1) Vite proxy 是否生效
  2) 前端 baseUrl 是否走 `/api/siliconflow`
  3) CSP `connect-src` 是否允许目标

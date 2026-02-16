# AI4Edu - Agent Coding Guidelines

## Build & Development Commands

### Frontend (React/TypeScript)
```bash
pnpm dev          # Development server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

### Tauri (Full Application)
```bash
pnpm tauri:dev    # Development (starts both frontend and Rust backend)
pnpm tauri:build  # Build production binary
```

### Rust (Backend)
```bash
cd src-tauri/
cargo check       # Check compilation
cargo build       # Build
cargo test        # Run all tests
cargo test <name> # Run specific test
cargo fmt         # Format code
cargo clippy      # Run linter
```

## Code Style Guidelines

### TypeScript / React
- **Components**: PascalCase (e.g., `MessageBubble.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useAppStore`)
- **Types**: PascalCase (e.g., `Message`, `Conversation`)
- **Imports order**: React → 3rd party → `@/*` aliases → relative
- **Tailwind**: Use `dark:` prefix, custom colors (`primary-500`, `math-600`)

```typescript
// Component structure
export function Component({ prop1 }: Props) {
  const [state] = useState()      // hooks first
  const handleClick = () => {}    // handlers
  useEffect(() => {}, [])         // effects
  return <div>...</div>           // render
}
```

### Rust
- **Structs/Enums**: PascalCase (e.g., `Conversation`)
- **Functions**: snake_case (e.g., `get_conversation`)
- **Error handling**: Use `thiserror` + `anyhow`, propagate with `?`
- **Module order**: imports → internal imports → types → functions

```rust
use serde::{Deserialize, Serialize};
use crate::models::*;

#[derive(Debug, Serialize)]
pub struct Response { }

#[tauri::command]
pub async fn handler() -> Result<ApiResponse<Response>> {
    Ok(ApiResponse::success(data))
}
```

## Architecture Patterns

### Frontend
- **State**: Zustand with domain-split stores (`app.ts`, `chat.ts`)
- **Commands**: All Tauri commands in `src/commands/`, async with `State<'_, AppState>`
- **Paths**: `@/*`, `@components/*`, `@stores/*`, `@types/*`

### Backend
- Use `ApiResponse<T>` wrapper for all responses
- Log with `tracing` (info/debug levels)
- SQLite with `rusqlite`, migrations in `src/storage/migrations/`

## 中文开发环境配置

### Windows UTF-8 设置
```powershell
# PowerShell 设置 UTF-8
chcp 65001
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

### Git 中文配置
```bash
git config --global core.quotepath false
git config --global i18n.commit.encoding utf-8
```

### 代码规范
```typescript
// 推荐：英文命名 + 中文注释
interface Question {
  id: string           // 题目唯一标识
  content: string      // 题目内容（支持 LaTeX）
  difficulty: Level    // 难度等级
}

// UI 文案
export const MESSAGES = {
  LOADING: '正在处理...',
  ERROR: '出错了，请稍后重试',
} as const
```

### 常见问题
- **Rust 乱码**: `$OutputEncoding = [System.Text.Encoding]::UTF8`
- **前端乱码**: 确保 `<meta charset="UTF-8" />`
- **路径问题**: 避免中文路径，推荐 `C:\Projects\ai4edu`
- **数据库**: `conn.execute("PRAGMA encoding = 'UTF-8'", [])?`

## LaTeX & Math
- Use `react-latex-next` for rendering
- Import CSS: `import 'katex/dist/katex.min.css'`
- Use `<Latex>` component for math content

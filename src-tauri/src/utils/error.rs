// src-tauri/src/utils/error.rs
// 错误处理工具函数

use super::AppError;

/// 将错误转换为API友好的错误信息
pub fn format_error(err: AppError) -> String {
    match err {
        AppError::Database(_) => "数据库操作失败，请稍后重试".to_string(),
        AppError::Io(_) => "文件操作失败，请检查权限".to_string(),
        AppError::Api(msg) => format!("API调用失败: {}", msg),
        AppError::Config(msg) => format!("配置错误: {}", msg),
        AppError::NotFound(msg) => format!("未找到: {}", msg),
        _ => "操作失败，请稍后重试".to_string(),
    }
}

// src-tauri/src/utils/mod.rs
pub mod error;
pub mod latex;
pub mod geometry;

pub use error::*;
pub use latex::*;
pub use geometry::*;

/// 通用结果类型
pub type Result<T> = std::result::Result<T, AppError>;

/// 应用错误类型
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("数据库错误: {0}")]
    Database(#[from] rusqlite::Error),
    
    #[error("IO错误: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("JSON错误: {0}")]
    Json(#[from] serde_json::Error),
    
    #[error("API错误: {0}")]
    Api(String),
    
    #[error("配置错误: {0}")]
    Config(String),
    
    #[error("未找到: {0}")]
    NotFound(String),
    
    #[error("未知错误: {0}")]
    Unknown(String),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

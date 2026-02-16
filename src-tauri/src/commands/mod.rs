// src-tauri/src/commands/mod.rs
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::models::*;
use crate::services::AppState;
use crate::utils::Result;

pub mod chat;
pub mod question;
pub mod ppt;
pub mod settings;
pub mod export;
pub mod llm;

pub use chat::*;
pub use question::*;
pub use ppt::*;
pub use settings::*;
pub use export::*;
pub use llm::*;

// 通用的API响应格式
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(msg: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(msg.into()),
        }
    }
}

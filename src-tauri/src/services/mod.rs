// src-tauri/src/services/mod.rs
use std::sync::Arc;
use tokio::sync::RwLock;

pub mod llm;
pub mod question_gen;
pub mod ppt_gen;

pub use llm::*;
pub use question_gen::*;
pub use ppt_gen::*;

/// 应用全局状态
pub struct AppState {
    pub db: Arc<RwLock<crate::storage::Database>>,
    pub llm_client: Arc<RwLock<dyn LLMClient>>,
    pub settings: Arc<RwLock<crate::models::Settings>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            db: Arc::new(RwLock::new(crate::storage::Database::new())),
            llm_client: Arc::new(RwLock::new(OpenAIClient::new())),
            settings: Arc::new(RwLock::new(crate::models::Settings::default())),
        }
    }
}

/// LLM客户端trait
#[async_trait::async_trait]
pub trait LLMClient: Send + Sync {
    async fn chat(&self, messages: Vec<ChatMessage>) -> Result<String, String>;
    async fn stream_chat(&self, messages: Vec<ChatMessage>) -> Result<StreamResponse, String>;
}

pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

pub struct StreamResponse {
    // TODO: 实现流式响应
}

/// OpenAI客户端实现
pub struct OpenAIClient {
    api_key: Option<String>,
    api_base: String,
    client: reqwest::Client,
}

impl OpenAIClient {
    pub fn new() -> Self {
        Self {
            api_key: None,
            api_base: "https://api.openai.com/v1".to_string(),
            client: reqwest::Client::new(),
        }
    }
}

#[async_trait::async_trait]
impl LLMClient for OpenAIClient {
    async fn chat(&self, _messages: Vec<ChatMessage>) -> Result<String, String> {
        // TODO: 实现OpenAI API调用
        Ok("AI回复内容".to_string())
    }

    async fn stream_chat(&self, _messages: Vec<ChatMessage>) -> Result<StreamResponse, String> {
        // TODO: 实现流式聊天
        Ok(StreamResponse {})
    }
}

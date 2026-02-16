// src-tauri/src/commands/chat.rs
use super::*;

#[derive(Debug, Deserialize)]
pub struct SendMessageRequest {
    pub conversation_id: Option<String>,
    pub content: String,
    pub message_type: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SendMessageResponse {
    pub message_id: String,
    pub content: String,
    pub choices: Option<Vec<ChoiceOption>>,
    pub require_input: bool,
}

#[derive(Debug, Serialize)]
pub struct ChoiceOption {
    pub id: String,
    pub label: String,
    pub description: Option<String>,
    pub icon: Option<String>,
}

/// 发送消息并获取AI回复
#[tauri::command]
pub async fn send_message(
    state: State<'_, AppState>,
    request: SendMessageRequest,
) -> Result<ApiResponse<SendMessageResponse>> {
    log::debug!("Sending message: {:?}", request);
    
    // TODO: 实现实际的消息处理逻辑
    // 1. 保存用户消息到数据库
    // 2. 调用AI服务生成回复
    // 3. 如果是引导式交互，返回选项
    // 4. 保存AI回复到数据库
    
    let response = SendMessageResponse {
        message_id: uuid::Uuid::new_v4().to_string(),
        content: "收到您的消息，正在处理...".to_string(),
        choices: None,
        require_input: false,
    };
    
    Ok(ApiResponse::success(response))
}

#[derive(Debug, Deserialize)]
pub struct GetHistoryRequest {
    pub conversation_id: String,
}

#[derive(Debug, Serialize)]
pub struct Conversation {
    pub id: String,
    pub title: String,
    pub messages: Vec<Message>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
pub struct Message {
    pub id: String,
    pub role: String,
    pub content: String,
    pub choices: Option<Vec<ChoiceOption>>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: String,
}

/// 获取对话历史
#[tauri::command]
pub async fn get_conversation_history(
    _state: State<'_, AppState>,
    request: GetHistoryRequest,
) -> Result<ApiResponse<Conversation>> {
    log::debug!("Getting conversation history: {:?}", request);
    
    // TODO: 从数据库获取对话历史
    
    let conversation = Conversation {
        id: request.conversation_id,
        title: "新对话".to_string(),
        messages: vec![],
        created_at: chrono::Local::now().to_rfc3339(),
        updated_at: chrono::Local::now().to_rfc3339(),
    };
    
    Ok(ApiResponse::success(conversation))
}

/// 创建新对话
#[tauri::command]
pub async fn create_conversation(
    _state: State<'_, AppState>,
) -> Result<ApiResponse<String>> {
    let conversation_id = uuid::Uuid::new_v4().to_string();
    log::debug!("Creating new conversation: {}", conversation_id);
    
    // TODO: 在数据库中创建新对话记录
    
    Ok(ApiResponse::success(conversation_id))
}

#[derive(Debug, Deserialize)]
pub struct DeleteConversationRequest {
    pub conversation_id: String,
}

/// 删除对话
#[tauri::command]
pub async fn delete_conversation(
    _state: State<'_, AppState>,
    request: DeleteConversationRequest,
) -> Result<ApiResponse<bool>> {
    log::debug!("Deleting conversation: {}", request.conversation_id);
    
    // TODO: 从数据库删除对话
    
    Ok(ApiResponse::success(true))
}

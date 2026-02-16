// src-tauri/src/commands/settings.rs
use super::*;

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub api_key: Option<String>,
    pub api_base: Option<String>,
    pub model: String,
    pub theme: String,
    pub language: String,
    pub auto_save: bool,
    pub subject: String,
    pub grade: String,
}

/// 获取设置
#[tauri::command]
pub async fn get_settings(
    _state: State<'_, AppState>,
) -> Result<ApiResponse<Settings>> {
    log::debug!("Getting settings");
    
    // TODO: 从数据库或配置文件读取设置
    
    let settings = Settings {
        api_key: None,
        api_base: Some("https://api.openai.com/v1".to_string()),
        model: "gpt-4".to_string(),
        theme: "light".to_string(),
        language: "zh-CN".to_string(),
        auto_save: true,
        subject: "数学".to_string(),
        grade: "高中".to_string(),
    };
    
    Ok(ApiResponse::success(settings))
}

#[derive(Debug, Deserialize)]
pub struct UpdateSettingsRequest {
    pub api_key: Option<String>,
    pub api_base: Option<String>,
    pub model: Option<String>,
    pub theme: Option<String>,
    pub auto_save: Option<bool>,
}

/// 更新设置
#[tauri::command]
pub async fn update_settings(
    _state: State<'_, AppState>,
    request: UpdateSettingsRequest,
) -> Result<ApiResponse<bool>> {
    log::debug!("Updating settings: {:?}", request);
    
    // TODO: 保存设置到数据库或配置文件
    // 注意：API Key 需要加密存储
    
    Ok(ApiResponse::success(true))
}

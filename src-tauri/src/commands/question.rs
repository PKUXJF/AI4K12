// src-tauri/src/commands/question.rs
use super::*;

/// 生成题目的请求
#[derive(Debug, Deserialize)]
pub struct GenerateQuestionsRequest {
    pub topic: String,
    pub difficulty: String,
    pub question_types: Vec<String>,
    pub count: i32,
    pub require_graph: bool,
    pub require_latex: bool,
}

/// 生成的题目
#[derive(Debug, Serialize)]
pub struct GeneratedQuestion {
    pub id: String,
    pub content: String,
    pub answer: String,
    pub explanation: String,
    pub difficulty: String,
    pub question_type: String,
    pub has_graph: bool,
    pub graph_data: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct GenerateQuestionsResponse {
    pub questions: Vec<GeneratedQuestion>,
    pub topic_analysis: String,
}

/// 生成题目
#[tauri::command]
pub async fn generate_questions(
    _state: State<'_, AppState>,
    request: GenerateQuestionsRequest,
) -> Result<ApiResponse<GenerateQuestionsResponse>> {
    log::debug!("Generating questions: {:?}", request);
    
    // TODO: 实现题目生成逻辑
    // 1. 调用LLM生成题目内容
    // 2. 如果需要图形，调用图形生成服务
    // 3. 格式化LaTeX公式
    // 4. 返回结构化数据
    
    let response = GenerateQuestionsResponse {
        questions: vec![],
        topic_analysis: format!("已为您生成 {} 道 {} 难度的 {} 题目", 
            request.count, request.difficulty, request.topic),
    };
    
    Ok(ApiResponse::success(response))
}

/// 改编题目的请求
#[derive(Debug, Deserialize)]
pub struct AdaptQuestionRequest {
    pub original_question: String,
    pub adaptation_type: String,
    pub specific_requirements: Option<String>,
}

/// 改编题目的响应
#[derive(Debug, Serialize)]
pub struct AdaptQuestionResponse {
    pub analysis: String,
    pub adapted_questions: Vec<GeneratedQuestion>,
    pub adaptation_suggestions: Vec<String>,
}

/// 改编题目
#[tauri::command]
pub async fn adapt_question(
    _state: State<'_, AppState>,
    request: AdaptQuestionRequest,
) -> Result<ApiResponse<AdaptQuestionResponse>> {
    log::debug!("Adapting question: {:?}", request);
    
    // TODO: 实现题目改编逻辑
    // 1. 分析原题
    // 2. 根据改编类型生成变式
    // 3. 返回分析结果和改编题
    
    let response = AdaptQuestionResponse {
        analysis: "原题是一道基础函数题，考查导数应用".to_string(),
        adapted_questions: vec![],
        adaptation_suggestions: vec![
            "加入参数讨论".to_string(),
            "结合不等式".to_string(),
            "改变情境".to_string(),
        ],
    };
    
    Ok(ApiResponse::success(response))
}

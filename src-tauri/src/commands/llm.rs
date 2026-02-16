// src-tauri/src/commands/llm.rs
use serde::{Deserialize, Serialize};
use tracing::{info, error, debug};
use tauri::command;

use crate::commands::ApiResponse;

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateQuestionsRequest {
    pub api_key: String,
    pub api_base: String,
    pub model: String,
    pub topic: String,
    pub difficulty: String,
    pub count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Question {
    pub id: String,
    pub content: String,
    pub answer: String,
    pub explanation: String,
    pub difficulty: String,
    pub question_type: String,
    pub knowledge_points: Vec<String>,
    pub has_graph: bool,
    pub latex_formulas: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestConnectionRequest {
    pub api_key: String,
    pub api_base: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestConnectionResponse {
    pub success: bool,
    pub message: String,
}

// OpenAI Compatible API 请求格式
#[derive(Debug, Serialize)]
struct ChatCompletionRequest {
    model: String,
    messages: Vec<Message>,
    temperature: f32,
    stream: bool,
}

#[derive(Debug, Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct ChatCompletionResponse {
    choices: Vec<Choice>,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: ResponseMessage,
}

#[derive(Debug, Deserialize)]
struct ResponseMessage {
    content: String,
}

fn build_question_prompt(topic: &str, difficulty: &str, count: i32) -> String {
    let difficulty_desc = match difficulty {
        "basic" => "基础题：直接考查公式定理，计算量小，单一步骤可解",
        "medium" => "中档题：2-3个知识点结合，需要一定技巧，计算量适中",
        "hard" => "困难题：多知识点综合，需要构造、转化，计算量大或思维跳跃",
        _ => "中档题",
    };

    let topic_map: std::collections::HashMap<&str, &str> = [
        ("functions", "函数（函数性质、图像、应用）"),
        ("derivatives", "导数（导数计算、单调性、极值、不等式证明）"),
        ("trigonometry", "三角函数（三角恒等变换、图像性质）"),
        ("sequences", "数列（等差/等比数列、求和、递推）"),
        ("geometry", "立体几何（空间向量、位置关系）"),
        ("analytic-geometry", "解析几何（直线、圆、圆锥曲线）"),
        ("probability", "概率统计（概率计算、分布、统计）"),
    ].into_iter().collect();

    let topic_name = topic_map.get(topic).unwrap_or(&topic);

    format!(r#"你是高中数学特级教师，请为{}出{}道{}。

要求：
1. 题目符合高考命题风格，难度为{}
2. 每道题都要有完整的题目描述
3. 提供详细的解答过程和答案
4. 使用LaTeX格式编写数学公式（用$包裹）
5. 题目要有创新性，不要照搬教材例题

请按以下格式输出：

【第1题】
题目：（题目内容，使用LaTeX公式）

解答：（详细解题步骤）

答案：（最终答案）

---

【第2题】
...

以此类推，共{}道题。"#, topic_name, count, difficulty_desc, difficulty, count)
}

fn parse_questions(content: &str, params: &GenerateQuestionsRequest) -> Vec<Question> {
    let mut questions = Vec::new();
    
    info!("解析API返回内容，长度: {}", content.len());
    debug!("返回内容: {}", content);
    
    // 按【第x题】分割
    let blocks: Vec<&str> = content.split("【第").filter(|s| !s.trim().is_empty()).collect();
    info!("分割成 {} 个块", blocks.len());
    
    for (index, block) in blocks.iter().enumerate() {
        let block = block.trim();
        let lines: Vec<&str> = block.lines().collect();
        
        let mut content_text = String::new();
        let mut answer = String::new();
        let mut explanation = String::new();
        let mut current_section = "content";
        
        for line in lines {
            let trimmed = line.trim();
            
            if trimmed.starts_with("题目：") {
                current_section = "content";
                content_text = trimmed.trim_start_matches("题目：").trim().to_string();
            } else if trimmed.starts_with("解答：") {
                current_section = "explanation";
                explanation = trimmed.trim_start_matches("解答：").trim().to_string();
            } else if trimmed.starts_with("答案：") {
                current_section = "answer";
                answer = trimmed.trim_start_matches("答案：").trim().to_string();
            } else if !trimmed.is_empty() && !trimmed.starts_with("---") && !trimmed.starts_with("题】") {
                match current_section {
                    "content" => {
                        if !content_text.is_empty() {
                            content_text.push('\n');
                        }
                        content_text.push_str(trimmed);
                    }
                    "explanation" => {
                        if !explanation.is_empty() {
                            explanation.push('\n');
                        }
                        explanation.push_str(trimmed);
                    }
                    "answer" => {
                        if !answer.is_empty() {
                            answer.push('\n');
                        }
                        answer.push_str(trimmed);
                    }
                    _ => {}
                }
            }
        }
        
        if !content_text.is_empty() {
            // 提取LaTeX公式
            let latex_formulas = extract_latex_formulas(&content_text);
            
            questions.push(Question {
                id: format!("q-{}-{}", chrono::Utc::now().timestamp_millis(), index),
                content: content_text,
                answer: if answer.is_empty() { "详见解答".to_string() } else { answer },
                explanation: if explanation.is_empty() { "详见上述内容".to_string() } else { explanation },
                difficulty: params.difficulty.clone(),
                question_type: "essay".to_string(),
                knowledge_points: vec![params.topic.clone()],
                has_graph: false,
                latex_formulas,
            });
        }
    }
    
    // 如果没有解析成功，返回原始内容作为一道题
    if questions.is_empty() {
        info!("未能解析出结构化题目，返回原始内容");
        questions.push(Question {
            id: format!("q-{}-0", chrono::Utc::now().timestamp_millis()),
            content: content.to_string(),
            answer: "详见上述内容".to_string(),
            explanation: content.to_string(),
            difficulty: params.difficulty.clone(),
            question_type: "essay".to_string(),
            knowledge_points: vec![params.topic.clone()],
            has_graph: false,
            latex_formulas: extract_latex_formulas(content),
        });
    }
    
    info!("成功解析 {} 道题目", questions.len());
    questions
}

fn extract_latex_formulas(text: &str) -> Vec<String> {
    let mut formulas = Vec::new();
    let mut chars = text.chars().peekable();
    
    while let Some(ch) = chars.next() {
        if ch == '$' {
            let mut formula = String::new();
            while let Some(c) = chars.next() {
                if c == '$' {
                    break;
                }
                formula.push(c);
            }
            if !formula.is_empty() {
                formulas.push(formula);
            }
        }
    }
    
    formulas
}

#[command]
pub async fn llm_generate_questions(
    request: GenerateQuestionsRequest,
) -> ApiResponse<Vec<Question>> {
    info!("开始生成题目请求: topic={}, difficulty={}, count={}", request.topic, request.difficulty, request.count);
    
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .unwrap_or_else(|_| reqwest::Client::new());
    
    let prompt = build_question_prompt(&request.topic, &request.difficulty, request.count);
    
    let chat_request = ChatCompletionRequest {
        model: request.model.clone(),
        messages: vec![
            Message {
                role: "system".to_string(),
                content: "你是高中数学特级教师，擅长出题和解题。".to_string(),
            },
            Message {
                role: "user".to_string(),
                content: prompt,
            },
        ],
        temperature: 0.7,
        stream: false,
    };
    
    let url = format!("{}/chat/completions", request.api_base.trim_end_matches('/'));
    info!("发送请求到: {}", url);
    
    match client
        .post(&url)
        .header("Authorization", format!("Bearer {}", request.api_key))
        .header("Content-Type", "application/json")
        .json(&chat_request)
        .send()
        .await
    {
        Ok(response) => {
            let status = response.status();
            info!("收到响应，状态码: {}", status);
            
            if response.status().is_success() {
                match response.json::<ChatCompletionResponse>().await {
                    Ok(data) => {
                        if let Some(choice) = data.choices.first() {
                            let questions = parse_questions(&choice.message.content, &request);
                            ApiResponse::success(questions)
                        } else {
                            error!("API返回数据为空choices");
                            ApiResponse::error("API返回数据为空")
                        }
                    }
                    Err(e) => {
                        error!("解析API响应失败: {}", e);
                        ApiResponse::error(format!("解析API响应失败: {}", e))
                    }
                }
            } else {
                let text = response.text().await.unwrap_or_default();
                error!("API请求失败 ({}): {}", status, text);
                ApiResponse::error(format!("API请求失败 ({}): {}", status, text))
            }
        }
        Err(e) => {
            error!("网络错误: {}", e);
            ApiResponse::error(format!("网络错误: {}", e))
        }
    }
}

#[command]
pub async fn llm_test_connection(
    request: TestConnectionRequest,
) -> ApiResponse<TestConnectionResponse> {
    info!("测试API连接: {}", request.api_base);
    
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .unwrap_or_else(|_| reqwest::Client::new());
    
    let url = format!("{}/models", request.api_base.trim_end_matches('/'));
    
    match client
        .get(&url)
        .header("Authorization", format!("Bearer {}", request.api_key))
        .send()
        .await
    {
        Ok(response) => {
            let status = response.status();
            info!("测试连接响应: {}", status);
            
            if response.status().is_success() {
                ApiResponse::success(TestConnectionResponse {
                    success: true,
                    message: "连接成功".to_string(),
                })
            } else {
                let text = response.text().await.unwrap_or_default();
                ApiResponse::success(TestConnectionResponse {
                    success: false,
                    message: format!("API返回错误 ({}): {}", status, text),
                })
            }
        }
        Err(e) => {
            error!("连接失败: {}", e);
            ApiResponse::success(TestConnectionResponse {
                success: false,
                message: format!("连接失败: {}", e),
            })
        },
    }
}

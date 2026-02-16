// src-tauri/src/models/question.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Question {
    pub id: String,
    pub content: String,
    pub answer: String,
    pub explanation: String,
    pub difficulty: Difficulty,
    pub question_type: QuestionType,
    pub knowledge_points: Vec<String>,
    pub has_graph: bool,
    pub graph_data: Option<String>,
    pub latex_formulas: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Difficulty {
    Basic,
    Medium,
    Hard,
    VeryHard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum QuestionType {
    SingleChoice,
    MultipleChoice,
    FillBlank,
    Essay,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuestionSet {
    pub id: String,
    pub title: String,
    pub questions: Vec<Question>,
    pub topic: String,
    pub created_at: String,
}

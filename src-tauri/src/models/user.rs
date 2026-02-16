// src-tauri/src/models/user.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: String,
    pub name: Option<String>,
    pub subject: Subject,
    pub grade: Grade,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Subject {
    Math,
    Physics,
    Chemistry,
    Biology,
    Chinese,
    English,
    History,
    Geography,
    Politics,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Grade {
    Elementary,
    Middle,
    High,
}

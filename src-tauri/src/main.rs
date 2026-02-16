// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tracing::{info, debug};

mod commands;
mod models;
mod services;
mod storage;
mod utils;

use crate::services::AppState;

fn main() {
    // 初始化日志
    tracing_subscriber::fmt()
        .with_env_filter("info,ai4edu=debug")
        .init();

    info!("Starting AI4Edu application...");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())
        .setup(|app| {
            debug!("Setting up application...");
            
            // 初始化数据库
            let app_handle = app.handle();
            tauri::async_runtime::block_on(async move {
                if let Err(e) = storage::init_database(&app_handle).await {
                    eprintln!("Failed to initialize database: {}", e);
                }
            });

            info!("Application setup completed");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 聊天相关
            commands::send_message,
            commands::get_conversation_history,
            commands::create_conversation,
            commands::delete_conversation,
            
            // 题目生成
            commands::generate_questions,
            commands::adapt_question,
            
            // PPT生成
            commands::generate_ppt,
            commands::analyze_exam_paper,
            
            // 设置
            commands::get_settings,
            commands::update_settings,
            
            // 导出
            commands::export_to_docx,
            commands::export_to_pptx,
            
            // LLM API调用
            commands::llm_generate_questions,
            commands::llm_test_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

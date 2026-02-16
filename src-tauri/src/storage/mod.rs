// src-tauri/src/storage/mod.rs
use rusqlite::{Connection, Result as SqliteResult};
use std::path::PathBuf;
use tauri::AppHandle;

pub mod conversation;
pub mod settings;

pub use conversation::*;
pub use settings::*;

/// 数据库连接
pub struct Database {
    conn: Option<Connection>,
}

impl Database {
    pub fn new() -> Self {
        Self { conn: None }
    }

    pub fn connect(&mut self, db_path: PathBuf) -> SqliteResult<()> {
        self.conn = Some(Connection::open(db_path)?);
        self.init_tables()?;
        Ok(())
    }

    fn init_tables(&self) -> SqliteResult<()> {
        let conn = self.conn.as_ref().unwrap();
        
        // 创建对话表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                subject TEXT NOT NULL,
                grade TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // 创建消息表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                choices TEXT,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id)
            )",
            [],
        )?;

        // 创建设置表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        )?;

        Ok(())
    }
}

/// 初始化数据库
pub async fn init_database(app_handle: &AppHandle) -> Result<(), String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data dir")?;
    
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    let db_path = app_dir.join("ai4edu.db");
    
    // TODO: 初始化数据库连接
    
    Ok(())
}

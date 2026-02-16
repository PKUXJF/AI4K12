// src-tauri/src/storage/settings.rs
use super::*;

pub struct SettingsRepository;

impl SettingsRepository {
    pub fn get(conn: &Connection, key: &str) -> SqliteResult<Option<String>> {
        let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;

        let value: Option<String> = stmt.query_row([key], |row| row.get(0)).optional()?;

        Ok(value)
    }

    pub fn set(conn: &Connection, key: &str, value: &str) -> SqliteResult<()> {
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            [key, value],
        )?;
        Ok(())
    }

    pub fn delete(conn: &Connection, key: &str) -> SqliteResult<()> {
        conn.execute("DELETE FROM settings WHERE key = ?1", [key])?;
        Ok(())
    }
}

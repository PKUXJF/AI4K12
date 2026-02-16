// src-tauri/src/storage/conversation.rs
use super::*;
use crate::models::{ChatMessage, Conversation};

pub struct ConversationRepository;

impl ConversationRepository {
    pub fn create(conn: &Connection, conversation: &Conversation) -> SqliteResult<()> {
        conn.execute(
            "INSERT INTO conversations (id, title, subject, grade, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                &conversation.id,
                &conversation.title,
                &conversation.subject,
                &conversation.grade,
                &conversation.created_at,
                &conversation.updated_at,
            ],
        )?;
        Ok(())
    }

    pub fn get_by_id(conn: &Connection, id: &str) -> SqliteResult<Option<Conversation>> {
        let mut stmt = conn.prepare(
            "SELECT id, title, subject, grade, created_at, updated_at
             FROM conversations WHERE id = ?1",
        )?;

        let conversation = stmt
            .query_row([id], |row| {
                Ok(Conversation {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    subject: row.get(2)?,
                    grade: row.get(3)?,
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                })
            })
            .optional()?;

        Ok(conversation)
    }

    pub fn get_all(conn: &Connection) -> SqliteResult<Vec<Conversation>> {
        let mut stmt = conn.prepare(
            "SELECT id, title, subject, grade, created_at, updated_at
             FROM conversations ORDER BY updated_at DESC",
        )?;

        let conversations = stmt.query_map([], |row| {
            Ok(Conversation {
                id: row.get(0)?,
                title: row.get(1)?,
                subject: row.get(2)?,
                grade: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })?;

        conversations.collect()
    }

    pub fn delete(conn: &Connection, id: &str) -> SqliteResult<()> {
        conn.execute("DELETE FROM conversations WHERE id = ?1", [id])?;
        Ok(())
    }
}

pub struct MessageRepository;

impl MessageRepository {
    pub fn create(conn: &Connection, message: &ChatMessage) -> SqliteResult<()> {
        let choices_json = message
            .choices
            .as_ref()
            .map(|c| serde_json::to_string(c).unwrap_or_default());

        let metadata_json = message
            .metadata
            .as_ref()
            .map(|m| serde_json::to_string(m).unwrap_or_default());

        conn.execute(
            "INSERT INTO messages (id, conversation_id, role, content, choices, metadata, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            [
                &message.id,
                &message.conversation_id,
                &message.role,
                &message.content,
                &choices_json.unwrap_or_default(),
                &metadata_json.unwrap_or_default(),
                &message.created_at,
            ],
        )?;
        Ok(())
    }

    pub fn get_by_conversation(
        conn: &Connection,
        conversation_id: &str,
    ) -> SqliteResult<Vec<ChatMessage>> {
        let mut stmt = conn.prepare(
            "SELECT id, conversation_id, role, content, choices, metadata, created_at
             FROM messages WHERE conversation_id = ?1 ORDER BY created_at ASC",
        )?;

        let messages = stmt.query_map([conversation_id], |row| {
            let choices_json: String = row.get(4)?;
            let metadata_json: String = row.get(5)?;

            Ok(ChatMessage {
                id: row.get(0)?,
                conversation_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                choices: serde_json::from_str(&choices_json).ok(),
                metadata: serde_json::from_str(&metadata_json).ok(),
                created_at: row.get(6)?,
            })
        })?;

        messages.collect()
    }
}

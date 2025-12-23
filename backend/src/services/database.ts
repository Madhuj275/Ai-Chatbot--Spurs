import { Pool } from 'pg';
import { Conversation, ChatMessage } from '../types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let pool: Pool | null = null;

// Initialize database connection with error handling
function initializeDatabasePool() {
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('DATABASE_URL:', databaseUrl ? 'Present' : 'Missing');
  console.log('DATABASE_URL value:', databaseUrl);
  
  if (!databaseUrl || databaseUrl.includes('username:password@localhost')) {
    console.warn('⚠️  Database not configured. Using in-memory storage (data will not persist).');
    return null;
  }

  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    console.log('✅ Database pool initialized successfully');
    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize database pool:', error);
    return null;
  }
}

// Initialize pool on module load
initializeDatabasePool();

// Create tables if they don't exist
async function createTables() {
  if (!pool) return;

  try {
    // Create conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
        text TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Failed to create database tables:', error);
  }
}

// Create tables on initialization
createTables();

// In-memory storage fallback when database is not available
const memoryStorage = {
  conversations: new Map<string, Conversation>(),
  messages: new Map<string, ChatMessage[]>(),
};

export class DatabaseService {
  async createConversation(): Promise<Conversation> {
    if (!pool) {
      // In-memory fallback
      const conversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStorage.conversations.set(conversation.id, conversation);
      memoryStorage.messages.set(conversation.id, []);
      return conversation;
    }

    try {
      const query = `
        INSERT INTO conversations (id, created_at, updated_at)
        VALUES (gen_random_uuid(), NOW(), NOW())
        RETURNING id, created_at, updated_at
      `;
      
      const result = await pool.query(query);
      
      return {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
      };
    } catch (error) {
      console.error('Database createConversation error:', error);
      throw error;
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    if (!pool) {
      // In-memory fallback
      return memoryStorage.conversations.get(id) || null;
    }

    try {
      const query = 'SELECT id, created_at, updated_at FROM conversations WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
      };
    } catch (error) {
      console.error('Database getConversation error:', error);
      return null;
    }
  }

  async saveMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    if (!pool) {
      // In-memory fallback
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: message.conversationId,
        sender: message.sender,
        text: message.text,
        timestamp: new Date(),
      };
      
      const messages = memoryStorage.messages.get(message.conversationId) || [];
      messages.push(newMessage);
      memoryStorage.messages.set(message.conversationId, messages);
      
      return newMessage;
    }

    try {
      const query = `
        INSERT INTO messages (id, conversation_id, sender, text, timestamp)
        VALUES (gen_random_uuid(), $1, $2, $3, NOW())
        RETURNING id, conversation_id, sender, text, timestamp
      `;
      
      const result = await pool.query(query, [
        message.conversationId,
        message.sender,
        message.text,
      ]);
      
      return {
        id: result.rows[0].id,
        conversationId: result.rows[0].conversation_id,
        sender: result.rows[0].sender,
        text: result.rows[0].text,
        timestamp: result.rows[0].timestamp,
      };
    } catch (error) {
      console.error('Database saveMessage error:', error);
      throw error;
    }
  }

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    if (!pool) {
      // In-memory fallback
      return memoryStorage.messages.get(conversationId) || [];
    }

    try {
      const query = `
        SELECT id, conversation_id, sender, text, timestamp
        FROM messages
        WHERE conversation_id = $1
        ORDER BY timestamp ASC
      `;
      
      const result = await pool.query(query, [conversationId]);
      
      return result.rows.map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        sender: row.sender,
        text: row.text,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      console.error('Database getConversationHistory error:', error);
      return [];
    }
  }
}
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendMessage, getConversationHistory } from './controllers/chatController';
import { errorHandler } from './middleware/errorHandler';
import { DatabaseService } from './services/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/chat/message', sendMessage);
app.get('/chat/history/:sessionId', getConversationHistory);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    const databaseService = new DatabaseService();
    await databaseService.initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
import { Request, Response } from 'express';
import { DatabaseService } from '../services/database';
import { LLMService } from '../services/llm';
import { CacheService } from '../services/cache';
import { validateChatRequest, sanitizeMessage } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';

const databaseService = new DatabaseService();
const llmService = new LLMService();
const cacheService = new CacheService();

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = validateChatRequest(req.body);
  const sanitizedMessage = sanitizeMessage(validatedData.message);
  
  let conversationId = validatedData.sessionId;
  
  // Create new conversation if no sessionId provided
  if (!conversationId) {
    const conversation = await databaseService.createConversation();
    conversationId = conversation.id;
  } else {
    // Verify conversation exists
    const existingConversation = await databaseService.getConversation(conversationId);
    if (!existingConversation) {
      const conversation = await databaseService.createConversation();
      conversationId = conversation.id;
    }
  }

  // Save user message
  await databaseService.saveMessage({
    conversationId,
    sender: 'user',
    text: sanitizedMessage,
  });

  // Get conversation history
  const messages = await databaseService.getConversationHistory(conversationId);
  const conversationHistory = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.text,
  }));

  // Generate AI response
  let aiResponse;
  try {
    aiResponse = await llmService.generateReply(conversationHistory, sanitizedMessage);
  } catch (error: any) {
    // Save error message as AI response
    aiResponse = { content: error.message, usage: undefined };
  }

  // Save AI message
  await databaseService.saveMessage({
    conversationId,
    sender: 'ai',
    text: aiResponse.content,
  });

  res.json({
    reply: aiResponse.content,
    sessionId: conversationId,
  });
});

export const getConversationHistory = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const conversation = await databaseService.getConversation(sessionId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const messages = await databaseService.getConversationHistory(sessionId);
  
  res.json({
    messages: messages.map(msg => ({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
    })),
  });
});
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
  console.log('=== CHAT CONTROLLER DEBUG ===');
  console.log('Request body:', req.body);
  
  const validatedData = validateChatRequest(req.body);
  console.log('Validated data:', validatedData);
  
  const sanitizedMessage = sanitizeMessage(validatedData.message);
  console.log('Sanitized message:', sanitizedMessage);
  
  let conversationId = validatedData.sessionId;
  console.log('Initial conversationId:', conversationId);
  
  // Create new conversation if no sessionId provided
  if (!conversationId) {
    console.log('Creating new conversation...');
    const conversation = await databaseService.createConversation();
    conversationId = conversation.id;
    console.log('New conversation created:', conversationId);
  } else {
    // Verify conversation exists
    console.log('Checking existing conversation...');
    const existingConversation = await databaseService.getConversation(conversationId);
    console.log('Existing conversation:', existingConversation);
    if (!existingConversation) {
      console.log('Conversation not found, creating new one...');
      const conversation = await databaseService.createConversation();
      conversationId = conversation.id;
      console.log('New conversation created:', conversationId);
    }
  }

  // Save user message
  console.log('Saving user message...');
  await databaseService.saveMessage({
    conversationId,
    sender: 'user',
    text: sanitizedMessage,
  });
  console.log('User message saved');

  // Get conversation history
  console.log('Getting conversation history...');
  const messages = await databaseService.getConversationHistory(conversationId);
  console.log('Conversation history:', messages);
  
  const conversationHistory = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.text,
  }));
  console.log('Conversation history formatted:', conversationHistory);

  // Generate AI response
  console.log('Generating AI response...');
  let aiResponse;
  try {
    aiResponse = await llmService.generateReply(conversationHistory, sanitizedMessage);
    console.log('AI response generated:', aiResponse);
  } catch (error: any) {
    console.log('AI response error:', error);
    // Save error message as AI response
    aiResponse = { content: error.message, usage: undefined };
  }

  // Save AI message
  console.log('Saving AI message...');
  await databaseService.saveMessage({
    conversationId,
    sender: 'ai',
    text: aiResponse.content,
  });
  console.log('AI message saved');

  console.log('Sending response to client:', { reply: aiResponse.content, sessionId: conversationId });
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
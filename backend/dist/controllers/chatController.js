"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationHistory = exports.sendMessage = void 0;
const database_1 = require("../services/database");
const llm_1 = require("../services/llm");
const cache_1 = require("../services/cache");
const validation_1 = require("../utils/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const databaseService = new database_1.DatabaseService();
const llmService = new llm_1.LLMService();
const cacheService = new cache_1.CacheService();
exports.sendMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('=== CHAT CONTROLLER DEBUG ===');
    console.log('Request body:', req.body);
    const validatedData = (0, validation_1.validateChatRequest)(req.body);
    console.log('Validated data:', validatedData);
    const sanitizedMessage = (0, validation_1.sanitizeMessage)(validatedData.message);
    console.log('Sanitized message:', sanitizedMessage);
    let conversationId = validatedData.sessionId;
    console.log('Initial conversationId:', conversationId);
    // Create new conversation if no sessionId provided
    if (!conversationId) {
        console.log('Creating new conversation...');
        const conversation = await databaseService.createConversation();
        conversationId = conversation.id;
        console.log('New conversation created:', conversationId);
    }
    else {
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
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
    }));
    console.log('Conversation history formatted:', conversationHistory);
    // Generate AI response
    console.log('Generating AI response...');
    let aiResponse;
    try {
        aiResponse = await llmService.generateReply(conversationHistory, sanitizedMessage);
        console.log('AI response generated:', aiResponse);
    }
    catch (error) {
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
exports.getConversationHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
//# sourceMappingURL=chatController.js.map
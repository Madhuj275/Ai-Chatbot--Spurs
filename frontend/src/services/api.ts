import axios from 'axios';
import { ChatRequest, ChatResponse, ConversationHistory } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/chat/message', data);
    return response.data;
  },

  getConversationHistory: async (sessionId: string): Promise<ConversationHistory> => {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  },
};

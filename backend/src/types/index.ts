export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
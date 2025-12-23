import { Conversation, ChatMessage } from '../types';
export declare class DatabaseService {
    createConversation(): Promise<Conversation>;
    getConversation(id: string): Promise<Conversation | null>;
    saveMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
    getConversationHistory(conversationId: string): Promise<ChatMessage[]>;
}
//# sourceMappingURL=database.d.ts.map
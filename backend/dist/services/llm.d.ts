import { LLMResponse } from '../types';
export declare class LLMService {
    generateReply(conversationHistory: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>, userMessage: string): Promise<LLMResponse>;
}
//# sourceMappingURL=llm.d.ts.map
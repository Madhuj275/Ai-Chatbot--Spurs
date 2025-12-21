import OpenAI from 'openai';
import { LLMResponse } from '../types';

let openai: OpenAI | null = null;

// Initialize OpenAI client only when API key is available
function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    openai = new OpenAI({ apiKey });
  } else {
    console.warn('⚠️  OpenAI API key not configured. AI responses will use fallback messages.');
  }
}

// Initialize on module load
initializeOpenAI();

const SYSTEM_PROMPT = `You are a helpful support agent for a small e-commerce store called "TechGadgets". 

Here is important information about our store:

SHIPPING POLICY:
- We ship to USA, Canada, UK, and EU countries
- Standard shipping takes 5-7 business days
- Express shipping takes 2-3 business days
- Free shipping on orders over $50
- Shipping costs: $5.99 for standard, $12.99 for express

RETURN POLICY:
- 30-day return policy
- Items must be unused and in original packaging
- Refunds processed within 5-7 business days
- Return shipping is free for defective items

SUPPORT HOURS:
- Monday-Friday: 9 AM - 6 PM EST
- Saturday: 10 AM - 4 PM EST
- Sunday: Closed

PRODUCTS:
- We sell electronics, gadgets, and tech accessories
- All products come with 1-year warranty
- Price match guarantee available

Please answer customer questions clearly and concisely based on this information. If you're unsure about something, offer to connect them with a human agent during business hours.`;

// Fallback responses for common questions when OpenAI is not available
const FALLBACK_RESPONSES: Record<string, string> = {
  'return': 'We offer a 30-day return policy. Items must be unused and in original packaging. Return shipping is free for defective items.',
  'shipping': 'We ship to USA, Canada, UK, and EU countries. Standard shipping takes 5-7 business days, Express takes 2-3 business days.',
  'hours': 'Our support hours are Monday-Friday: 9 AM - 6 PM EST, Saturday: 10 AM - 4 PM EST, Sunday: Closed.',
  'price': 'We offer competitive pricing with a price match guarantee on all our electronics and tech accessories.',
  'warranty': 'All our products come with a 1-year warranty for your peace of mind.',
  'hello': 'Hello! I\'m your AI support assistant. How can I help you today?',
  'hi': 'Hi there! How can I assist you today?',
  'help': 'I can help you with questions about shipping, returns, our products, support hours, and more. What would you like to know?',
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific keywords
  for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  // Default fallback response
  return 'I\'m sorry, but I\'m currently unable to process your request. Our support team is available Monday-Friday 9 AM - 6 PM EST and Saturday 10 AM - 4 PM EST. Please contact us during those hours for assistance.';
}

export class LLMService {
  async generateReply(conversationHistory: Array<{role: 'user' | 'assistant'; content: string}>, userMessage: string): Promise<LLMResponse> {
    // If OpenAI is not configured, use fallback responses
    if (!openai) {
      return {
        content: getFallbackResponse(userMessage),
        usage: undefined,
      };
    }

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: parseInt(process.env.MAX_TOKENS || '500'),
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
      const usage = completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined;

      return { content, usage };
    } catch (error: any) {
      if (error.status === 401) {
        console.error('❌ Invalid OpenAI API key');
        return {
          content: 'Sorry, there\'s a configuration issue with our AI service. Please try again later or contact support.',
          usage: undefined,
        };
      } else if (error.status === 429) {
        return {
          content: 'I\'m experiencing high traffic right now. Please try again in a moment.',
          usage: undefined,
        };
      } else if (error.status >= 500) {
        return {
          content: 'Our AI service is temporarily unavailable. Please try again later.',
          usage: undefined,
        };
      } else {
        console.error('❌ OpenAI API error:', error.message);
        return {
          content: getFallbackResponse(userMessage),
          usage: undefined,
        };
      }
    }
  }
}
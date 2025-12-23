import OpenAI from 'openai';
import { LLMResponse } from '../types';

let openai: OpenAI | null = null;

// Simple rate limiting
let lastApiCall = 0;
const MIN_API_CALL_INTERVAL = 1000; // 1 second minimum between calls

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
  'refund': 'Refunds are processed within 5-7 business days after we receive your returned item.',
  'shipping': 'We ship to USA, Canada, UK, and EU countries. Standard shipping takes 5-7 business days, Express takes 2-3 business days.',
  'delivery': 'Standard shipping takes 5-7 business days, Express takes 2-3 business days.',
  'track': 'You can track your order using the tracking number sent to your email after shipment.',
  'hours': 'Our support hours are Monday-Friday: 9 AM - 6 PM EST, Saturday: 10 AM - 4 PM EST, Sunday: Closed.',
  'time': 'Our support hours are Monday-Friday: 9 AM - 6 PM EST, Saturday: 10 AM - 4 PM EST, Sunday: Closed.',
  'price': 'We offer competitive pricing with a price match guarantee on all our electronics and tech accessories.',
  'cost': 'We offer competitive pricing with a price match guarantee on all our electronics and tech accessories.',
  'warranty': 'All our products come with a 1-year warranty for your peace of mind.',
  'guarantee': 'All our products come with a 1-year warranty and price match guarantee.',
  'hello': 'Hello! I\'m your AI support assistant. How can I help you today?',
  'hi': 'Hi there! How can I assist you today?',
  'hey': 'Hey! What can I help you with today?',
  'help': 'I can help you with questions about shipping, returns, our products, support hours, and more. What would you like to know?',
  'support': 'I\'m here to help! I can answer questions about shipping, returns, products, and more.',
  'contact': 'You can reach our support team during business hours: Monday-Friday 9 AM - 6 PM EST, Saturday 10 AM - 4 PM EST.',
  'product': 'We sell electronics, gadgets, and tech accessories with 1-year warranty and price match guarantee.',
  'tech': 'We specialize in electronics, gadgets, and tech accessories with full warranty coverage.',
  'order': 'I can help you with order-related questions. What would you like to know about your order?',
  'payment': 'We accept all major credit cards and PayPal for secure payment processing.',
  'stock': 'For current stock availability, please contact our support team during business hours.',
  'discount': 'We offer competitive pricing with our price match guarantee. Check our website for current promotions.',
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
  return 'I\'m currently experiencing high demand, but I\'m here to help! For immediate assistance, you can contact our support team during business hours (Monday-Friday 9 AM - 6 PM EST, Saturday 10 AM - 4 PM EST), or try asking about shipping, returns, products, or other common questions. What would you like to know?';
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

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
      console.warn('⚠️  Rate limiting: using fallback response');
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

      lastApiCall = now; // Update last call time

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
        console.warn('⚠️  OpenAI rate limit exceeded, using fallback response');
        return {
          content: getFallbackResponse(userMessage),
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
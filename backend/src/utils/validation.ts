import { z } from 'zod';

const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  sessionId: z.string().uuid().optional(),
});

export function validateChatRequest(data: any) {
  return chatRequestSchema.parse(data);
}

export function sanitizeMessage(message: string): string {
  return message.trim().replace(/[<>]/g, '');
}
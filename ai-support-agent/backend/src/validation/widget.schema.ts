import { z } from 'zod';

export const startConversationSchema = z.object({
  widgetKey: z.string().min(1, 'widgetKey is required'),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export const widgetMessageSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  content: z.string().min(1, 'content is required'),
});

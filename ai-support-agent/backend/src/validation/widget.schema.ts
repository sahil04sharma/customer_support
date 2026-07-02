import { z } from 'zod';

export const startConversationSchema = z.object({
  widgetKey: z.string().min(1, 'widgetKey is required').max(100),
  customerName: z.string().max(120).optional(),
  customerEmail: z.string().email().max(254).optional(),
});

export const widgetMessageSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required').max(100),
  content: z.string().min(1, 'content is required').max(4000),
});

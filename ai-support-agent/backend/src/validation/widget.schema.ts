import { z } from 'zod';

export const widgetSessionSchema = z.object({
  widgetKey: z.string().min(1).max(100),
});

export const startConversationSchema = z.object({
  customerName: z.string().max(120).optional(),
  customerEmail: z.string().email().max(254).optional(),
});

export const widgetMessageSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required').max(100),
  content: z.string().min(1, 'content is required').max(4000),
});

export const widgetRateSchema = z.object({
  conversationId: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional(),
});

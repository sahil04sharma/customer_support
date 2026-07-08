import { z } from 'zod';

const aiMode = z.enum(['platform', 'byok']);
const chatProvider = z.enum(['openai', 'anthropic', 'groq', 'google']);
const embedProvider = z.enum(['openai', 'google']);

export const updateAiConfigSchema = z
  .object({
    chatMode: aiMode,
    chatProvider: chatProvider.nullable().optional(),
    chatModel: z.string().min(1).max(100).nullable().optional(),
    chatApiKey: z.string().min(8).max(500).optional(),
    embedMode: aiMode,
    embedProvider: embedProvider.nullable().optional(),
    embedModel: z.string().min(1).max(100).nullable().optional(),
    embedApiKey: z.string().min(8).max(500).optional(),
    triggerReembed: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.chatMode === 'byok') {
      if (!data.chatProvider) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Chat provider is required when using your own key',
          path: ['chatProvider'],
        });
      }
    }
    if (data.embedMode === 'byok') {
      if (!data.embedProvider) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Embedding provider is required when using your own key',
          path: ['embedProvider'],
        });
      }
    }
  });

export const testAiConfigSchema = z.object({
  target: z.enum(['chat', 'embed', 'both']).default('both'),
  chatProvider: chatProvider.optional(),
  chatModel: z.string().optional(),
  chatApiKey: z.string().optional(),
  embedProvider: embedProvider.optional(),
  embedModel: z.string().optional(),
  embedApiKey: z.string().optional(),
});

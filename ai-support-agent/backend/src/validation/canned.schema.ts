import { z } from 'zod';

export const createCannedResponseSchema = z.object({
  title: z.string().min(1).max(80),
  content: z.string().min(1).max(2000),
});

export const updateCannedResponseSchema = createCannedResponseSchema.partial();

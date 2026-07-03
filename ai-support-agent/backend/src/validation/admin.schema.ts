import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminBootstrapSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateBusinessPlanSchema = z.object({
  plan: z.enum(['FREE', 'PRO']),
});

export const updateBusinessStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

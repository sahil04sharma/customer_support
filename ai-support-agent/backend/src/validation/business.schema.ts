import { z } from 'zod';

export const updateSettingsSchema = z.object({
  widgetColor: z.string().optional(),
  widgetPosition: z.string().optional(),
  welcomeMessage: z.string().optional(),
  agentName: z.string().optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
});

export const inviteAgentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

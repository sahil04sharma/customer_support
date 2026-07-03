import { z } from 'zod';

const bubbleShape = z.enum(['round', 'rounded', 'square']);
const bubbleSize = z.enum(['small', 'medium', 'large']);
const themeMode = z.enum(['light', 'dark']);

export const updateSettingsSchema = z.object({
  widgetColor: z.string().max(20).optional(),
  widgetPosition: z.enum(['bottom-right', 'bottom-left']).optional(),
  welcomeMessage: z.string().min(1).max(500).optional(),
  agentName: z.string().min(1).max(120).optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
  launcherImageUrl: z.string().url().nullable().optional(),
  avatarImageUrl: z.string().url().nullable().optional(),
  bubbleShape: bubbleShape.optional(),
  bubbleSize: bubbleSize.optional(),
  themeMode: themeMode.optional(),
  headerTitle: z.string().max(120).nullable().optional(),
  launcherText: z.string().max(40).nullable().optional(),
  offlineMessage: z.string().min(1).max(300).optional(),
  showBranding: z.boolean().optional(),
  quickReplies: z.array(z.string().min(1).max(80)).max(5).optional(),
});

export const widgetImageTypeSchema = z.enum(['launcher', 'avatar']);

export const inviteAgentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

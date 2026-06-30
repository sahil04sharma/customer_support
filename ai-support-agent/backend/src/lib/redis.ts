import { Redis } from '@upstash/redis';
import { env } from '../config/env';

export const redis = new Redis({
  url: env.upstashRedisUrl,
  token: env.upstashRedisToken,
});

// ─── Key helpers ──────────────────────────────────────────────────
// Centralized so refresh-token and presence logic stay consistent across the app.
export const redisKeys = {
  refreshToken: (subjectId: string) => `refresh:${subjectId}`,
  agentPresence: (agentId: string) => `presence:agent:${agentId}`,
};

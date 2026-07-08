import { Redis } from '@upstash/redis';
import { env } from '../config/env';

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!env.upstashRedisUrl || !env.upstashRedisToken) {
    throw new Error(
      'Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env'
    );
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: env.upstashRedisUrl,
      token: env.upstashRedisToken,
    });
  }

  return redisClient;
}

/** Lazy Redis wrapper — avoids crashing at import when .env is not set yet. */
export const redis = {
  get: <T>(key: string) => getRedisClient().get<T>(key),
  set: (key: string, value: string, opts?: { ex: number }) =>
    getRedisClient().set(key, value, opts),
  del: (key: string) => getRedisClient().del(key),
  incr: (key: string) => getRedisClient().incr(key),
  expire: (key: string, seconds: number) => getRedisClient().expire(key, seconds),
};

export const redisKeys = {
  refreshToken: (subjectId: string) => `refresh:${subjectId}`,
  agentPresence: (agentId: string) => `presence:agent:${agentId}`,
  widgetSessionMessages: (sessionId: string) => `widget:session:msg:${sessionId}`,
  widgetBusinessMessages: (businessId: string) => `widget:biz:msg:${businessId}`,
  widgetIpMessages: (ipHash: string) => `widget:ip:msg:${ipHash}`,
  passwordReset: (token: string) => `pwdreset:${token}`,
  planLimitNotified: (businessId: string, periodKey: string) =>
    `plan:notify:${businessId}:${periodKey}`,
};

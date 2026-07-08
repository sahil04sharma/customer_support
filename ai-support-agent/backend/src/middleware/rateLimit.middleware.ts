import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { UpstashRateLimitStore } from '../lib/rateLimitStore';

const standardHeaders = env.isProduction;
const legacyHeaders = false;

function redisConfigured(): boolean {
  return Boolean(env.upstashRedisUrl && env.upstashRedisToken);
}

function limiterOptions(
  prefix: string,
  windowMs: number,
  max: number,
  message: string
) {
  const options: Parameters<typeof rateLimit>[0] = {
    windowMs,
    max,
    standardHeaders,
    legacyHeaders,
    message: { error: message },
  };

  if (redisConfigured()) {
    options.store = new UpstashRateLimitStore(prefix);
  }

  return options;
}

/** Stricter limit for widget session minting (anti-enumeration / abuse). */
export const widgetSessionLimiter = rateLimit(
  limiterOptions(
    'rl:widget-session:',
    15 * 60 * 1000,
    env.isProduction ? 30 : 100,
    'Too many requests. Please wait a moment and try again.'
  )
);

/** Public widget REST endpoints — prevent AI cost abuse. */
export const widgetLimiter = rateLimit(
  limiterOptions(
    'rl:widget:',
    60 * 1000,
    env.isProduction ? 40 : 200,
    'Too many requests. Please wait a moment and try again.'
  )
);

/** Login / register — slow brute-force attempts. */
export const authLimiter = rateLimit(
  limiterOptions(
    'rl:auth:',
    15 * 60 * 1000,
    env.isProduction ? 20 : 100,
    'Too many authentication attempts. Try again later.'
  )
);

/** Authenticated dashboard API. */
export const apiLimiter = rateLimit(
  limiterOptions(
    'rl:api:',
    60 * 1000,
    env.isProduction ? 120 : 500,
    'Too many requests. Please slow down.'
  )
);

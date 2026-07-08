import { createHash, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { env } from '../config/env';
import { redis, redisKeys } from '../lib/redis';

export const WIDGET_UNAVAILABLE_MESSAGE = 'Widget unavailable';

const WIDGET_SESSION_EXPIRY = '30m';
const WIDGET_SESSION_SECONDS = 30 * 60;
const SESSION_MSG_LIMIT = 60; // per session per hour
const WIDGET_MSG_LIMIT = 500; // per business per hour

export interface WidgetSessionPayload {
  sub: string;
  businessId: string;
  origin: string;
  type: 'WIDGET';
}

export function normalizeHostname(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, '');
}

export function parseHostnameFromUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return normalizeHostname(url.hostname);
  } catch {
    return null;
  }
}

export function resolveRequestOrigin(req: Request): string | null {
  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin.length > 0) {
    return parseHostnameFromUrl(origin);
  }

  const referer = req.headers.referer;
  if (typeof referer === 'string' && referer.length > 0) {
    return parseHostnameFromUrl(referer);
  }

  return null;
}

export function isLocalDevHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

export function isDomainAllowed(allowedDomains: string[], hostname: string | null): boolean {
  if (!hostname) {
    return false;
  }

  if (isLocalDevHost(hostname)) {
    return true;
  }

  if (allowedDomains.length === 0) {
    return true;
  }

  const normalized = normalizeHostname(hostname);
  return allowedDomains.some((entry) => {
    const domain = normalizeHostname(entry);
    if (!domain) return false;
    return normalized === domain || normalized.endsWith(`.${domain}`);
  });
}

export function signWidgetSessionToken(
  businessId: string,
  origin: string
): { sessionToken: string; expiresIn: number } {
  const payload: WidgetSessionPayload = {
    sub: randomUUID(),
    businessId,
    origin: normalizeHostname(origin),
    type: 'WIDGET',
  };

  const sessionToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: WIDGET_SESSION_EXPIRY,
  });

  return { sessionToken, expiresIn: WIDGET_SESSION_SECONDS };
}

export function verifyWidgetSessionToken(token: string): WidgetSessionPayload {
  const payload = jwt.verify(token, env.jwtSecret) as WidgetSessionPayload;
  if (payload.type !== 'WIDGET' || !payload.businessId || !payload.origin) {
    throw new Error('Invalid widget session');
  }
  return payload;
}

export function assertOriginMatchesSession(
  session: WidgetSessionPayload,
  requestHostname: string | null
): void {
  if (!requestHostname) {
    throw new Error('Origin required');
  }

  const host = normalizeHostname(requestHostname);
  if (isLocalDevHost(host) || isLocalDevHost(session.origin)) {
    if (isLocalDevHost(host)) return;
  }

  if (host !== session.origin) {
    throw new Error('Origin mismatch');
  }
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export async function assertWidgetMessageRateLimits(
  businessId: string,
  sessionId: string,
  ip: string
): Promise<void> {
  const ipKey = hashIp(ip);
  const sessionKey = redisKeys.widgetSessionMessages(sessionId);
  const widgetKey = redisKeys.widgetBusinessMessages(businessId);

  const sessionCount = await redis.incr(sessionKey);
  if (sessionCount === 1) {
    await redis.expire(sessionKey, 3600);
  }
  if (sessionCount > SESSION_MSG_LIMIT) {
    throw new Error('Rate limit exceeded');
  }

  const widgetCount = await redis.incr(widgetKey);
  if (widgetCount === 1) {
    await redis.expire(widgetKey, 3600);
  }
  if (widgetCount > WIDGET_MSG_LIMIT) {
    throw new Error('Rate limit exceeded');
  }

  const ipKeyFull = redisKeys.widgetIpMessages(ipKey);
  const ipCount = await redis.incr(ipKeyFull);
  if (ipCount === 1) {
    await redis.expire(ipKeyFull, 3600);
  }
  if (ipCount > 120) {
    throw new Error('Rate limit exceeded');
  }
}

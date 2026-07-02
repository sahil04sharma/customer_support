import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const standardHeaders = env.isProduction;
const legacyHeaders = false;

/** Public widget REST endpoints — prevent AI cost abuse. */
export const widgetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.isProduction ? 40 : 200,
  standardHeaders,
  legacyHeaders,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
});

/** Login / register — slow brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProduction ? 20 : 100,
  standardHeaders,
  legacyHeaders,
  message: { error: 'Too many authentication attempts. Try again later.' },
});

/** Authenticated dashboard API. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.isProduction ? 120 : 500,
  standardHeaders,
  legacyHeaders,
  message: { error: 'Too many requests. Please slow down.' },
});

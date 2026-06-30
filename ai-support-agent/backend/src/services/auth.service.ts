import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { redis, redisKeys } from '../lib/redis';

export type UserRole = 'BUSINESS' | 'AGENT';

export interface TokenPayload {
  sub: string;
  role: UserRole;
  businessId: string;
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}

export async function storeRefreshToken(subjectId: string, token: string): Promise<void> {
  await redis.set(redisKeys.refreshToken(subjectId), token, {
    ex: REFRESH_TOKEN_EXPIRY_SECONDS,
  });
}

export async function validateStoredRefreshToken(
  subjectId: string,
  token: string
): Promise<boolean> {
  const stored = await redis.get<string>(redisKeys.refreshToken(subjectId));
  return stored === token;
}

export async function revokeRefreshToken(subjectId: string): Promise<void> {
  await redis.del(redisKeys.refreshToken(subjectId));
}

export async function issueTokens(payload: TokenPayload): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await storeRefreshToken(payload.sub, refreshToken);
  return { accessToken, refreshToken };
}

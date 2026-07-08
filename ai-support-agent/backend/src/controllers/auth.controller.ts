import { Request, Response } from 'express';
import crypto from 'crypto';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import { redis, redisKeys } from '../lib/redis';
import { env } from '../config/env';
import {
  hashPassword,
  issueTokens,
  revokeRefreshToken,
  validateStoredRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from '../services/auth.service';
import { sendPasswordResetEmail, sendWelcomeEmail, sendEmailSafe } from '../services/email.service';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerBusinessSchema,
  resetPasswordSchema,
} from '../validation/auth.schema';

function omitPassword<T extends { password: string }>(entity: T): Omit<T, 'password'> {
  const { password: _password, ...safe } = entity;
  return safe;
}

export async function registerBusiness(req: Request, res: Response): Promise<void> {
  const body = registerBusinessSchema.parse(req.body);

  const existing = await prisma.business.findUnique({ where: { email: body.email } });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const hashed = await hashPassword(body.password);

  const business = await prisma.business.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashed,
      settings: {
        create: {},
      },
    },
    include: { settings: true },
  });

  const { accessToken, refreshToken } = await issueTokens({
    sub: business.id,
    role: 'BUSINESS',
    businessId: business.id,
  });

  res.status(201).json({
    accessToken,
    refreshToken,
    business: omitPassword(business),
  });

  sendEmailSafe(() => sendWelcomeEmail(business.email, business.name));
}

export async function loginBusiness(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);

  const business = await prisma.business.findUnique({ where: { email: body.email } });
  if (!business) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(body.password, business.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await issueTokens({
    sub: business.id,
    role: 'BUSINESS',
    businessId: business.id,
  });

  res.json({
    accessToken,
    refreshToken,
    business: omitPassword(business),
  });
}

export async function loginAgent(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);

  const agent = await prisma.agent.findUnique({ where: { email: body.email } });
  if (!agent) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(body.password, agent.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await issueTokens({
    sub: agent.id,
    role: 'AGENT',
    businessId: agent.businessId,
  });

  res.json({
    accessToken,
    refreshToken,
    agent: omitPassword(agent),
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const body = refreshSchema.parse(req.body);

  let payload;
  try {
    payload = verifyRefreshToken(body.refreshToken);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const matches = await validateStoredRefreshToken(payload.sub, body.refreshToken);
  if (!matches) {
    throw new AppError(401, 'Refresh token revoked or invalid');
  }

  const { accessToken, refreshToken } = await issueTokens({
    sub: payload.sub,
    role: payload.role,
    businessId: payload.businessId,
  });

  res.json({ accessToken, refreshToken });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const body = logoutSchema.parse(req.body);

  let payload;
  try {
    payload = verifyRefreshToken(body.refreshToken);
  } catch {
    // Idempotent logout even if token is expired
    res.json({ message: 'Logged out' });
    return;
  }

  await revokeRefreshToken(payload.sub);
  res.json({ message: 'Logged out' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const body = forgotPasswordSchema.parse(req.body);

  const business = await prisma.business.findUnique({ where: { email: body.email } });

  // Always return success to avoid email enumeration
  if (business) {
    const token = crypto.randomBytes(32).toString('hex');
    await redis.set(redisKeys.passwordReset(token), business.id, { ex: 3600 });
    const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
    sendEmailSafe(() => sendPasswordResetEmail(business.email, resetUrl));
  }

  res.json({ message: 'If that email exists, a reset link has been sent.' });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const body = resetPasswordSchema.parse(req.body);

  const businessId = await redis.get<string>(redisKeys.passwordReset(body.token));
  if (!businessId) {
    throw new AppError(400, 'Invalid or expired reset link');
  }

  const hashed = await hashPassword(body.password);
  await prisma.business.update({
    where: { id: businessId },
    data: { password: hashed },
  });
  await redis.del(redisKeys.passwordReset(body.token));

  res.json({ message: 'Password updated. You can sign in now.' });
}

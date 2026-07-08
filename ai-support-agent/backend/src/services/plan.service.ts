import { Plan } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import { redis, redisKeys } from '../lib/redis';
import { usesOwnChatKey, getPublicAiConfig } from './ai/aiConfig.service';
import { sendPlanLimitEmail } from './email.service';
import { logError } from '../utils/safeLog';

export const PLAN_LIMITS = {
  FREE: {
    aiMessagesPerMonth: 150,
    maxDocuments: 10,
    maxAgents: 3,
  },
  PRO: {
    aiMessagesPerMonth: 50_000,
    maxDocuments: 500,
    maxAgents: 50,
  },
} as const;

export const WIDGET_LIMIT_MESSAGE =
  'Support is temporarily unavailable. Please try again later or contact us directly.';

export class PlanLimitExceededError extends Error {
  readonly userMessage = WIDGET_LIMIT_MESSAGE;

  constructor(message = 'Plan limit exceeded') {
    super(message);
    this.name = 'PlanLimitExceededError';
  }
}

function currentPeriodBounds(): { start: Date; end: Date; key: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  return { start, end, key };
}

function limitsForPlan(plan: Plan) {
  return PLAN_LIMITS[plan];
}

export interface PlanUsageSummary {
  plan: Plan;
  periodStart: string;
  periodEnd: string;
  aiMessages: { used: number; limit: number };
  documents: { used: number; limit: number };
  agents: { used: number; limit: number };
  isOverLimit: boolean;
  nearLimit: boolean;
  usingOwnChatKey: boolean;
  usingOwnEmbedKey: boolean;
}

export async function getPlanUsageSummary(businessId: string): Promise<PlanUsageSummary> {
  const { start, end, key } = currentPeriodBounds();

  const [business, aiUsed, docCount, agentCount] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true, email: true, name: true },
    }),
    prisma.usageEvent.count({
      where: {
        businessId,
        type: 'AI_MESSAGE',
        createdAt: { gte: start, lt: end },
      },
    }),
    prisma.document.count({ where: { businessId } }),
    prisma.agent.count({ where: { businessId } }),
  ]);

  if (!business) {
    throw new Error('Business not found');
  }

  const limits = limitsForPlan(business.plan);
  const ownChatKey = await usesOwnChatKey(businessId);
  const isOverLimit = !ownChatKey && aiUsed >= limits.aiMessagesPerMonth;
  const nearLimit =
    !ownChatKey && aiUsed >= Math.floor(limits.aiMessagesPerMonth * 0.8);

  void maybeNotifyLimitStatus(
    businessId,
    business.email,
    business.name,
    key,
    aiUsed,
    limits.aiMessagesPerMonth,
    isOverLimit,
    nearLimit
  );

  const aiConfig = await getPublicAiConfig(businessId);

  return {
    plan: business.plan,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    aiMessages: { used: aiUsed, limit: limits.aiMessagesPerMonth },
    documents: { used: docCount, limit: limits.maxDocuments },
    agents: { used: agentCount, limit: limits.maxAgents },
    isOverLimit,
    nearLimit: nearLimit && !isOverLimit,
    usingOwnChatKey: aiConfig.usesOwnChatKey,
    usingOwnEmbedKey: aiConfig.usesOwnEmbedKey,
  };
}

async function maybeNotifyLimitStatus(
  businessId: string,
  email: string,
  businessName: string,
  periodKey: string,
  aiUsed: number,
  limit: number,
  isOverLimit: boolean,
  nearLimit: boolean
): Promise<void> {
  try {
    if (isOverLimit) {
      const key = redisKeys.planLimitNotified(businessId, `${periodKey}:over`);
      const sent = await redis.get(key);
      if (!sent) {
        await sendPlanLimitEmail({
          to: email,
          businessName,
          used: aiUsed,
          limit,
          overLimit: true,
        });
        const secondsUntilReset = Math.ceil(
          (new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).getTime() -
            Date.now()) /
            1000
        );
        await redis.set(key, '1', { ex: Math.max(secondsUntilReset, 3600) });
      }
    } else if (nearLimit) {
      const key = redisKeys.planLimitNotified(businessId, `${periodKey}:warn`);
      const sent = await redis.get(key);
      if (!sent) {
        await sendPlanLimitEmail({
          to: email,
          businessName,
          used: aiUsed,
          limit,
          overLimit: false,
        });
        const secondsUntilReset = Math.ceil(
          (new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).getTime() -
            Date.now()) /
            1000
        );
        await redis.set(key, '1', { ex: Math.max(secondsUntilReset, 3600) });
      }
    }
  } catch (err) {
    logError('plan.notifyLimit', err);
  }
}

export async function assertWithinAiLimits(businessId: string): Promise<void> {
  if (await usesOwnChatKey(businessId)) {
    return;
  }
  const summary = await getPlanUsageSummary(businessId);
  if (summary.isOverLimit) {
    throw new PlanLimitExceededError();
  }
}

export async function assertCanUploadDocument(businessId: string): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { plan: true },
  });
  if (!business) throw new Error('Business not found');

  const limits = limitsForPlan(business.plan);
  const count = await prisma.document.count({ where: { businessId } });
  if (count >= limits.maxDocuments) {
    throw new AppError(
      403,
      `Document limit reached (${limits.maxDocuments} on ${business.plan} plan). Pro plans coming soon.`
    );
  }
}

export async function assertCanAddAgent(businessId: string): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { plan: true },
  });
  if (!business) throw new Error('Business not found');

  const limits = limitsForPlan(business.plan);
  const count = await prisma.agent.count({ where: { businessId } });
  if (count >= limits.maxAgents) {
    throw new AppError(
      403,
      `Agent limit reached (${limits.maxAgents} on ${business.plan} plan). Pro plans coming soon.`
    );
  }
}

export function isPlanLimitError(err: unknown): err is PlanLimitExceededError {
  return err instanceof PlanLimitExceededError;
}

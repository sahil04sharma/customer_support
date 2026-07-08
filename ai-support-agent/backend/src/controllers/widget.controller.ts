import { Request, Response } from 'express';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import { runAgent } from '../services/agent';
import {
  appendMessage,
  getHistory,
  markEscalated,
  startConversation,
} from '../services/conversation.service';
import {
  assertWithinAiLimits,
  PlanLimitExceededError,
  WIDGET_LIMIT_MESSAGE,
} from '../services/plan.service';
import {
  assertWidgetMessageRateLimits,
  isDomainAllowed,
  resolveRequestOrigin,
  signWidgetSessionToken,
  WIDGET_UNAVAILABLE_MESSAGE,
} from '../services/widgetSession.service';
import {
  startConversationSchema,
  widgetMessageSchema,
  widgetRateSchema,
  widgetSessionSchema,
} from '../validation/widget.schema';

async function loadBusinessByWidgetKey(widgetKey: string) {
  return prisma.business.findUnique({
    where: { widgetKey },
    include: { settings: true },
  });
}

function assertBusinessActive(business: { status: string } | null): asserts business is NonNullable<typeof business> {
  if (!business) {
    throw new AppError(404, WIDGET_UNAVAILABLE_MESSAGE);
  }
  if (business.status === 'SUSPENDED') {
    throw new AppError(403, WIDGET_UNAVAILABLE_MESSAGE);
  }
}

export async function createWidgetSession(req: Request, res: Response): Promise<void> {
  const body = widgetSessionSchema.parse(req.body);
  const business = await loadBusinessByWidgetKey(body.widgetKey);
  assertBusinessActive(business);

  let origin = resolveRequestOrigin(req);
  if (!origin && !env.isProduction && business.allowedDomains.length === 0) {
    origin = 'localhost';
  }

  if (!isDomainAllowed(business.allowedDomains, origin)) {
    throw new AppError(403, WIDGET_UNAVAILABLE_MESSAGE);
  }

  const hostname = origin ?? 'localhost';
  const { sessionToken, expiresIn } = signWidgetSessionToken(business.id, hostname);

  res.json({ sessionToken, expiresIn });
}

export async function startWidgetConversation(req: Request, res: Response): Promise<void> {
  const body = startConversationSchema.parse(req.body);
  const session = req.widgetSession!;

  const business = await prisma.business.findUnique({
    where: { id: session.businessId },
    include: { settings: true },
  });
  assertBusinessActive(business);

  const conversation = await startConversation(business.id, {
    customerName: body.customerName,
    customerEmail: body.customerEmail,
  });

  res.status(201).json({
    conversationId: conversation.id,
    settings: business.settings,
  });
}

export async function sendWidgetMessage(req: Request, res: Response): Promise<void> {
  const body = widgetMessageSchema.parse(req.body);
  const session = req.widgetSession!;

  const conversation = await prisma.conversation.findUnique({
    where: { id: body.conversationId },
  });

  if (!conversation || conversation.businessId !== session.businessId) {
    throw new AppError(404, WIDGET_UNAVAILABLE_MESSAGE);
  }

  if (conversation.status === 'RESOLVED') {
    throw new AppError(400, 'Conversation is resolved');
  }

  const clientIp = req.ip ?? 'unknown';
  await assertWidgetMessageRateLimits(session.businessId, session.sub, clientIp);

  await appendMessage(conversation.id, 'CUSTOMER', body.content);

  try {
    await assertWithinAiLimits(conversation.businessId);
  } catch (err) {
    if (err instanceof PlanLimitExceededError) {
      res.status(403).json({ error: WIDGET_LIMIT_MESSAGE });
      return;
    }
    throw err;
  }

  const history = await getHistory(conversation.id);
  const agentResult = await runAgent(body.content, conversation.businessId, history);

  await appendMessage(
    conversation.id,
    'AI',
    agentResult.answer,
    agentResult.confidence
  );

  if (agentResult.shouldEscalate) {
    await markEscalated(conversation.id);
  }

  res.json({
    answer: agentResult.answer,
    confidence: agentResult.confidence,
    shouldEscalate: agentResult.shouldEscalate,
    sources: agentResult.sources,
  });
}

export async function rateWidgetConversation(req: Request, res: Response): Promise<void> {
  const body = widgetRateSchema.parse(req.body);
  const session = req.widgetSession!;

  const conversation = await prisma.conversation.findUnique({
    where: { id: body.conversationId },
  });

  if (!conversation || conversation.businessId !== session.businessId) {
    throw new AppError(404, WIDGET_UNAVAILABLE_MESSAGE);
  }

  if (conversation.status !== 'RESOLVED') {
    throw new AppError(400, 'Conversation is not resolved yet');
  }

  if (conversation.rating != null) {
    res.json({ message: 'Already rated' });
    return;
  }

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      rating: body.rating,
      feedback: body.feedback?.trim() || null,
      ratedAt: new Date(),
    },
  });

  res.json({ message: 'Thank you for your feedback' });
}

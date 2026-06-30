import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../services/auth.service';
import { inviteAgentSchema, updateSettingsSchema } from '../validation/business.schema';

function omitPassword<T extends { password: string }>(entity: T): Omit<T, 'password'> {
  const { password: _password, ...safe } = entity;
  return safe;
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { settings: true },
  });

  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  res.json(omitPassword(business));
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const body = updateSettingsSchema.parse(req.body);

  const settings = await prisma.businessSettings.update({
    where: { businessId },
    data: body,
  });

  res.json(settings);
}

export async function getWidgetKey(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { widgetKey: true },
  });

  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  res.json({ widgetKey: business.widgetKey });
}

export async function listAgents(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;

  const agents = await prisma.agent.findMany({
    where: { businessId },
    select: {
      id: true,
      name: true,
      email: true,
      isOnline: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(agents);
}

export async function inviteAgent(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const body = inviteAgentSchema.parse(req.body);

  const existing = await prisma.agent.findUnique({ where: { email: body.email } });
  if (existing) {
    throw new AppError(409, 'Agent email already exists');
  }

  const hashed = await hashPassword(body.password);

  const agent = await prisma.agent.create({
    data: {
      businessId,
      name: body.name,
      email: body.email,
      password: hashed,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isOnline: true,
      createdAt: true,
    },
  });

  res.status(201).json(agent);
}

export async function deleteAgent(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const { id } = req.params;

  const agent = await prisma.agent.findFirst({
    where: { id, businessId },
  });

  if (!agent) {
    throw new AppError(404, 'Agent not found');
  }

  await prisma.agent.delete({ where: { id } });
  res.json({ message: 'Agent removed' });
}

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;

  const [resolved, escalated, conversations] = await Promise.all([
    prisma.conversation.count({ where: { businessId, status: 'RESOLVED' } }),
    prisma.conversation.count({ where: { businessId, status: 'ESCALATED' } }),
    prisma.conversation.findMany({
      where: { businessId, status: 'RESOLVED' },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    }),
  ]);

  let totalResponseMs = 0;
  let responseCount = 0;

  for (const conv of conversations) {
    const firstCustomer = conv.messages.find((m) => m.role === 'CUSTOMER');
    const firstAi = conv.messages.find((m) => m.role === 'AI');
    if (firstCustomer && firstAi) {
      totalResponseMs +=
        firstAi.createdAt.getTime() - firstCustomer.createdAt.getTime();
      responseCount++;
    }
  }

  const avgResponseTimeMs =
    responseCount > 0 ? Math.round(totalResponseMs / responseCount) : 0;

  res.json({
    resolved,
    escalated,
    avgResponseTimeMs,
  });
}

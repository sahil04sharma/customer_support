import { BusinessStatus, Plan, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import {
  hashPassword,
  issueTokens,
  verifyPassword,
} from '../services/auth.service';
import {
  adminBootstrapSchema,
  adminLoginSchema,
  updateBusinessPlanSchema,
  updateBusinessStatusSchema,
} from '../validation/admin.schema';

function omitPassword<T extends { password: string }>(entity: T): Omit<T, 'password'> {
  const { password: _password, ...safe } = entity;
  return safe;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function parseRange(range?: string): Date {
  const match = range?.match(/^(\d+)d$/);
  const days = match ? Number(match[1]) : 30;
  return daysAgo(days);
}

export async function bootstrapAdmin(req: Request, res: Response): Promise<void> {
  const count = await prisma.platformAdmin.count();
  if (count > 0) {
    throw new AppError(403, 'Platform admin already exists');
  }

  const body = adminBootstrapSchema.parse(req.body);
  const existing = await prisma.platformAdmin.findUnique({ where: { email: body.email } });
  if (existing) {
    throw new AppError(409, 'Email already in use');
  }

  const hashed = await hashPassword(body.password);
  const admin = await prisma.platformAdmin.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashed,
    },
  });

  const { accessToken, refreshToken } = await issueTokens({
    sub: admin.id,
    role: 'ADMIN',
    businessId: '',
  });

  res.status(201).json({
    accessToken,
    refreshToken,
    admin: omitPassword(admin),
  });
}

export async function loginAdmin(req: Request, res: Response): Promise<void> {
  const body = adminLoginSchema.parse(req.body);

  const admin = await prisma.platformAdmin.findUnique({ where: { email: body.email } });
  if (!admin || !(await verifyPassword(body.password, admin.password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await issueTokens({
    sub: admin.id,
    role: 'ADMIN',
    businessId: '',
  });

  res.json({
    accessToken,
    refreshToken,
    admin: omitPassword(admin),
  });
}

export async function getPlatformMetrics(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = daysAgo(7);
  const thirtyDaysAgo = daysAgo(30);

  const [
    totalBusinesses,
    activeBusinesses,
    suspendedBusinesses,
    totalConversations,
    totalMessages,
    usageAgg,
    usageThisMonth,
    signups7d,
    signups30d,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { status: 'ACTIVE' } }),
    prisma.business.count({ where: { status: 'SUSPENDED' } }),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.usageEvent.aggregate({
      _sum: { totalTokens: true, estimatedCost: true },
    }),
    prisma.usageEvent.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { totalTokens: true, estimatedCost: true },
    }),
    prisma.business.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.business.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  res.json({
    totalBusinesses,
    activeBusinesses,
    suspendedBusinesses,
    totalConversations,
    totalMessages,
    totalTokens: usageAgg._sum.totalTokens ?? 0,
    totalEstimatedCost: usageAgg._sum.estimatedCost ?? 0,
    tokensThisMonth: usageThisMonth._sum.totalTokens ?? 0,
    costThisMonth: usageThisMonth._sum.estimatedCost ?? 0,
    signups7d,
    signups30d,
  });
}

export async function listBusinesses(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'createdAt';

  const where: Prisma.BusinessWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const orderBy: Prisma.BusinessOrderByWithRelationInput =
    sort === 'name'
      ? { name: 'asc' }
      : sort === 'plan'
        ? { plan: 'asc' }
        : { createdAt: 'desc' };

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { agents: true, documents: true, conversations: true },
        },
      },
    }),
    prisma.business.count({ where }),
  ]);

  const ids = businesses.map((b) => b.id);
  const usageByBusiness =
    ids.length === 0
      ? []
      : await prisma.usageEvent.groupBy({
          by: ['businessId'],
          where: { businessId: { in: ids } },
          _sum: { totalTokens: true, estimatedCost: true },
        });

  const usageMap = new Map(
    usageByBusiness.map((u) => [
      u.businessId,
      { tokens: u._sum.totalTokens ?? 0, cost: u._sum.estimatedCost ?? 0 },
    ])
  );

  const items = businesses.map((b) => ({
    ...b,
    agentCount: b._count.agents,
    documentCount: b._count.documents,
    conversationCount: b._count.conversations,
    totalTokens: usageMap.get(b.id)?.tokens ?? 0,
    estimatedCost: usageMap.get(b.id)?.cost ?? 0,
    lastActivity: b.updatedAt,
    _count: undefined,
  }));

  res.json({ items, total, page, limit });
}

export async function getBusinessDetail(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      settings: true,
      agents: {
        select: { id: true, name: true, email: true, isOnline: true, createdAt: true },
      },
      _count: {
        select: {
          agents: true,
          documents: true,
          conversations: true,
        },
      },
    },
  });

  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  const [docStatus, convStatus, usageAgg, usageByDay] = await Promise.all([
    prisma.document.groupBy({
      by: ['status'],
      where: { businessId: id },
      _count: true,
    }),
    prisma.conversation.groupBy({
      by: ['status'],
      where: { businessId: id },
      _count: true,
    }),
    prisma.usageEvent.aggregate({
      where: { businessId: id },
      _sum: { totalTokens: true, estimatedCost: true },
      _count: true,
    }),
    prisma.$queryRaw<{ day: Date; tokens: bigint; cost: number }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day,
             SUM("totalTokens")::bigint AS tokens,
             SUM("estimatedCost")::float AS cost
      FROM "UsageEvent"
      WHERE "businessId" = ${id}
        AND "createdAt" >= ${daysAgo(30)}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  res.json({
    business: {
      id: business.id,
      name: business.name,
      email: business.email,
      plan: business.plan,
      status: business.status,
      widgetKey: business.widgetKey,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
      settings: business.settings,
      agents: business.agents,
      counts: business._count,
    },
    documentsByStatus: docStatus,
    conversationsByStatus: convStatus,
    usage: {
      totalTokens: usageAgg._sum.totalTokens ?? 0,
      estimatedCost: usageAgg._sum.estimatedCost ?? 0,
      eventCount: usageAgg._count,
    },
    usageByDay: usageByDay.map((row) => ({
      day: row.day,
      tokens: Number(row.tokens),
      cost: row.cost,
    })),
  });
}

export async function getPlatformUsage(req: Request, res: Response): Promise<void> {
  const since = parseRange(typeof req.query.range === 'string' ? req.query.range : '30d');

  const [series, topConsumers] = await Promise.all([
    prisma.$queryRaw<{ day: Date; tokens: bigint; cost: number; events: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day,
             SUM("totalTokens")::bigint AS tokens,
             SUM("estimatedCost")::float AS cost,
             COUNT(*)::bigint AS events
      FROM "UsageEvent"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    prisma.usageEvent.groupBy({
      by: ['businessId'],
      where: { createdAt: { gte: since } },
      _sum: { totalTokens: true, estimatedCost: true },
      orderBy: { _sum: { estimatedCost: 'desc' } },
      take: 10,
    }),
  ]);

  const businessIds = topConsumers.map((t) => t.businessId);
  const businesses = await prisma.business.findMany({
    where: { id: { in: businessIds } },
    select: { id: true, name: true, email: true, plan: true },
  });
  const bizMap = new Map(businesses.map((b) => [b.id, b]));

  res.json({
    series: series.map((row) => ({
      day: row.day,
      tokens: Number(row.tokens),
      cost: row.cost,
      events: Number(row.events),
    })),
    topConsumers: topConsumers.map((row) => ({
      business: bizMap.get(row.businessId),
      businessId: row.businessId,
      totalTokens: row._sum.totalTokens ?? 0,
      estimatedCost: row._sum.estimatedCost ?? 0,
    })),
  });
}

export async function updateBusinessPlan(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { plan } = updateBusinessPlanSchema.parse(req.body);

  const business = await prisma.business.update({
    where: { id },
    data: { plan: plan as Plan },
    select: { id: true, name: true, email: true, plan: true, status: true },
  });

  res.json(business);
}

export async function updateBusinessStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = updateBusinessStatusSchema.parse(req.body);

  const business = await prisma.business.update({
    where: { id },
    data: { status: status as BusinessStatus },
    select: { id: true, name: true, email: true, plan: true, status: true },
  });

  res.json(business);
}

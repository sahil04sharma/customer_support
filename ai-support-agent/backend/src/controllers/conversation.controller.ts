import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';

export async function listConversations(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;

  const conversations = await prisma.conversation.findMany({
    where: { businessId },
    orderBy: { updatedAt: 'desc' },
    include: {
      agent: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
  });

  res.json(conversations);
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const { id } = req.params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, businessId },
    include: {
      agent: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  res.json(conversation);
}

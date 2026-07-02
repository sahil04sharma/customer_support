import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import { getIO } from '../socket/socketHandler';
import { appendMessage, markEscalated } from '../services/conversation.service';

function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

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

export async function replyToConversation(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const { id } = req.params;
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

  if (!content) {
    throw new AppError(400, 'Message content is required');
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, businessId },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  if (conversation.status === 'RESOLVED') {
    throw new AppError(400, 'Conversation is already resolved');
  }

  if (!conversation.handedOff) {
    await markEscalated(id);
  }

  const message = await appendMessage(id, 'AGENT', content);

  getIO().to(conversationRoom(id)).emit('agent_response', {
    conversationId: id,
    message,
  });

  res.status(201).json(message);
}

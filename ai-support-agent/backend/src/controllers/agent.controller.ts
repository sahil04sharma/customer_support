import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import { getIO } from '../socket/socketHandler';
import { appendMessage } from '../services/conversation.service';
import { z } from 'zod';

const agentMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1),
});

function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

export async function getAgentConversation(req: Request, res: Response): Promise<void> {
  const agentId = req.auth!.sub;
  const businessId = req.auth!.businessId;
  const { id } = req.params;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      businessId,
      status: 'ESCALATED',
      OR: [{ agentId: null }, { agentId }],
    },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  if (conversation.agentId && conversation.agentId !== agentId) {
    throw new AppError(403, 'Conversation assigned to another agent');
  }

  res.json(conversation);
}

export async function listAgentConversations(req: Request, res: Response): Promise<void> {
  const agentId = req.auth!.sub;
  const businessId = req.auth!.businessId;

  const conversations = await prisma.conversation.findMany({
    where: {
      businessId,
      status: 'ESCALATED',
      OR: [{ agentId: null }, { agentId }],
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  res.json(conversations);
}

export async function sendAgentMessage(req: Request, res: Response): Promise<void> {
  const agentId = req.auth!.sub;
  const businessId = req.auth!.businessId;
  const body = agentMessageSchema.parse(req.body);

  const conversation = await prisma.conversation.findFirst({
    where: { id: body.conversationId, businessId },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  if (conversation.agentId && conversation.agentId !== agentId) {
    throw new AppError(403, 'Conversation assigned to another agent');
  }

  if (!conversation.agentId) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { agentId },
    });
  }

  const message = await appendMessage(conversation.id, 'AGENT', body.content);

  getIO().to(conversationRoom(conversation.id)).emit('agent_response', {
    conversationId: conversation.id,
    message,
  });

  res.json(message);
}

export async function resolveAgentConversation(req: Request, res: Response): Promise<void> {
  const agentId = req.auth!.sub;
  const businessId = req.auth!.businessId;
  const { id } = req.params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, businessId },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  if (conversation.agentId && conversation.agentId !== agentId) {
    throw new AppError(403, 'Conversation assigned to another agent');
  }

  await prisma.conversation.update({
    where: { id },
    data: { status: 'RESOLVED' },
  });

  getIO().to(conversationRoom(id)).emit('conversation_resolved', { conversationId: id });

  res.json({ message: 'Conversation resolved' });
}

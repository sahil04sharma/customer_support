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

  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(String(req.query.pageSize ?? '20'), 10) || 20)
  );
  const skip = (page - 1) * pageSize;

  const where = { businessId };

  const [total, conversations] = await Promise.all([
    prisma.conversation.count({ where }),
    prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        agent: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    }),
  ]);

  res.json({ items: conversations, total, page, pageSize });
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

export async function exportConversation(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const { id } = req.params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, businessId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  const roleLabel: Record<string, string> = {
    CUSTOMER: 'Customer',
    AI: 'AI Assistant',
    AGENT: 'Support Agent',
  };

  const lines = [
    `Conversation ${conversation.id}`,
    `Status: ${conversation.status}`,
    `Started: ${conversation.createdAt.toISOString()}`,
    conversation.rating != null ? `Rating: ${conversation.rating}/5` : null,
    conversation.feedback ? `Feedback: ${conversation.feedback}` : null,
    '',
    '--- Transcript ---',
    '',
    ...conversation.messages.map((m) => {
      const time = m.createdAt.toISOString();
      const label = roleLabel[m.role] ?? m.role;
      return `[${time}] ${label}:\n${m.content}`;
    }),
  ].filter((line): line is string => line != null);

  const filename = `conversation-${conversation.id.slice(0, 8)}.txt`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(lines.join('\n'));
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

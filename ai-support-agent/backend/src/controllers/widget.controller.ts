import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import { runAgent } from '../services/agent';
import {
  appendMessage,
  getHistory,
  markEscalated,
  startConversation,
} from '../services/conversation.service';
import { startConversationSchema, widgetMessageSchema } from '../validation/widget.schema';

export async function startWidgetConversation(req: Request, res: Response): Promise<void> {
  const body = startConversationSchema.parse(req.body);

  const business = await prisma.business.findUnique({
    where: { widgetKey: body.widgetKey },
    include: { settings: true },
  });

  if (!business) {
    throw new AppError(404, 'Invalid widget key');
  }

  if (business.status === 'SUSPENDED') {
    throw new AppError(403, 'This support widget is temporarily unavailable');
  }

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

  const conversation = await prisma.conversation.findUnique({
    where: { id: body.conversationId },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  if (conversation.status === 'RESOLVED') {
    throw new AppError(400, 'Conversation is resolved');
  }

  await appendMessage(conversation.id, 'CUSTOMER', body.content);

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

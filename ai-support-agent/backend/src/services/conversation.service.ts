import { MessageRole } from '@prisma/client';
import { prisma } from '../lib/prisma';

interface CustomerInfo {
  customerName?: string;
  customerEmail?: string;
}

export async function startConversation(businessId: string, customer?: CustomerInfo) {
  return prisma.conversation.create({
    data: {
      businessId,
      customerName: customer?.customerName,
      customerEmail: customer?.customerEmail,
      status: 'OPEN',
    },
  });
}

export async function appendMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
  confidence?: number
) {
  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      confidence: confidence ?? null,
    },
  });
}

export async function getHistory(conversationId: string) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, role: true, content: true },
  });

  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
  }));
}

export async function markEscalated(conversationId: string) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: 'ESCALATED',
      handedOff: true,
    },
  });
}

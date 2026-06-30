import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { redis, redisKeys } from '../lib/redis';
import { runAgent } from '../services/agent';
import {
  appendMessage,
  getHistory,
  markEscalated,
} from '../services/conversation.service';

let io: Server;

const agentSocketMap = new Map<string, string>();

function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

function businessRoom(businessId: string): string {
  return `business:${businessId}`;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [env.clientUrl, /^http:\/\/localhost(:\d+)?$/],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join_conversation', async ({ conversationId }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      socket.join(conversationRoom(conversationId));
      const history = await getHistory(conversationId);
      socket.emit('conversation_joined', { conversationId, history });
    });

    socket.on('customer_message', async ({ conversationId, content }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      await appendMessage(conversationId, 'CUSTOMER', content);

      if (conversation.handedOff) {
        io.to(conversationRoom(conversationId)).emit('customer_message', {
          conversationId,
          content,
        });
        return;
      }

      io.to(conversationRoom(conversationId)).emit('ai_typing', { conversationId });

      const history = await getHistory(conversationId);
      const result = await runAgent(content, conversation.businessId, history);

      const aiMessage = await appendMessage(
        conversationId,
        'AI',
        result.answer,
        result.confidence
      );

      io.to(conversationRoom(conversationId)).emit('ai_response', {
        conversationId,
        message: aiMessage,
      });

      if (result.shouldEscalate) {
        await markEscalated(conversationId);
        io.to(conversationRoom(conversationId)).emit('escalated_to_human', {
          conversationId,
        });
        io.to(businessRoom(conversation.businessId)).emit('new_escalation', {
          conversationId,
        });
      }
    });

    socket.on('agent_online', async ({ agentId, businessId }) => {
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, businessId },
      });

      if (!agent) {
        socket.emit('error', { message: 'Agent not found' });
        return;
      }

      socket.join(businessRoom(businessId));
      agentSocketMap.set(socket.id, agentId);

      await prisma.agent.update({
        where: { id: agentId },
        data: { isOnline: true },
      });
      await redis.set(redisKeys.agentPresence(agentId), 'online', { ex: 3600 });

      io.to(businessRoom(businessId)).emit('agent_status_updated', {
        agentId,
        isOnline: true,
      });
    });

    socket.on('accept_conversation', async ({ conversationId, agentId }) => {
      const agent = await prisma.agent.findUnique({ where: { id: agentId } });
      if (!agent) {
        socket.emit('error', { message: 'Agent not found' });
        return;
      }

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { agentId },
      });

      socket.join(conversationRoom(conversationId));

      io.to(conversationRoom(conversationId)).emit('agent_joined', {
        agentId,
        agentName: agent.name,
      });
    });

    socket.on('agent_message', async ({ conversationId, content }) => {
      const message = await appendMessage(conversationId, 'AGENT', content);

      io.to(conversationRoom(conversationId)).emit('agent_response', {
        conversationId,
        message,
      });
    });

    socket.on('resolve_conversation', async ({ conversationId }) => {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: 'RESOLVED' },
      });

      io.to(conversationRoom(conversationId)).emit('conversation_resolved', {
        conversationId,
      });
    });

    socket.on('disconnect', async () => {
      const agentId = agentSocketMap.get(socket.id);
      if (!agentId) return;

      agentSocketMap.delete(socket.id);

      const agent = await prisma.agent.findUnique({ where: { id: agentId } });
      if (!agent) return;

      await prisma.agent.update({
        where: { id: agentId },
        data: { isOnline: false },
      });
      await redis.del(redisKeys.agentPresence(agentId));

      io.to(businessRoom(agent.businessId)).emit('agent_status_updated', {
        agentId,
        isOnline: false,
      });
    });
  });

  return io;
}

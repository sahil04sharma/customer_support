import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { redis, redisKeys } from '../lib/redis';
import { runAgent } from '../services/agent';
import {
  appendMessage,
  getHistory,
} from '../services/conversation.service';
import { logError } from '../utils/safeLog';

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
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (env.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        // Embedded widget on customer sites (any HTTPS/HTTP origin)
        callback(null, true);
      },
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
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { business: { select: { status: true } } },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (conversation.business.status === 'SUSPENDED') {
          socket.emit('error', { message: 'This support widget is temporarily unavailable' });
          return;
        }

        if (conversation.status === 'RESOLVED') {
          socket.emit('error', { message: 'This conversation has ended' });
          return;
        }

        await appendMessage(conversationId, 'CUSTOMER', content);

        const live = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { agentId: true, handedOff: true, businessId: true },
        });

        // Human has taken over (agent joined or team replied from dashboard)
        if (live?.agentId || live?.handedOff) {
          io.to(conversationRoom(conversationId)).emit('customer_message', {
            conversationId,
            content,
          });

          if (!live.agentId) {
            io.to(conversationRoom(conversationId)).emit('queue_update', {
              conversationId,
              content:
                'Thanks — your message was received. A support team member will reply shortly.',
            });
          }
          return;
        }

        io.to(conversationRoom(conversationId)).emit('ai_typing', { conversationId });

        const history = await getHistory(conversationId);
        const result = await runAgent(content, live!.businessId, history, {
          conversationId,
        });

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

        // Soft escalation: notify the business team only — AI keeps answering
        if (result.shouldEscalate) {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { status: 'ESCALATED' },
          });
          io.to(businessRoom(live!.businessId)).emit('new_escalation', {
            conversationId,
          });
        }
      } catch (error) {
        logError('socket customer_message', error);
        io.to(conversationRoom(conversationId)).emit('ai_error', {
          conversationId,
          message: 'Sorry, something went wrong. Please try again.',
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
        data: { agentId, handedOff: true, status: 'ESCALATED' },
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

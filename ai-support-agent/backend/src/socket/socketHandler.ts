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
import { sendEscalationEmail, sendEmailSafe } from '../services/email.service';
import {
  assertWithinAiLimits,
  PlanLimitExceededError,
  WIDGET_LIMIT_MESSAGE,
} from '../services/plan.service';
import {
  requireAgentSocket,
  requireDashboardSocket,
  tryDashboardAuth,
} from '../services/socketAuth.service';
import {
  assertOriginMatchesSession,
  assertWidgetMessageRateLimits,
  parseHostnameFromUrl,
  verifyWidgetSessionToken,
  type WidgetSessionPayload,
} from '../services/widgetSession.service';
import { logError } from '../utils/safeLog';

let io: Server;

const agentSocketMap = new Map<string, string>();

function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

function businessRoom(businessId: string): string {
  return `business:${businessId}`;
}

function resolveSocketOrigin(socket: Socket): string | null {
  const origin = socket.handshake.headers.origin;
  if (typeof origin === 'string') {
    return parseHostnameFromUrl(origin);
  }
  const referer = socket.handshake.headers.referer;
  if (typeof referer === 'string') {
    return parseHostnameFromUrl(referer);
  }
  return null;
}

function verifySocketWidgetSession(socket: Socket): WidgetSessionPayload {
  const token = socket.handshake.auth?.widgetToken;
  if (typeof token !== 'string' || !token) {
    throw new Error('Widget session required');
  }
  const session = verifyWidgetSessionToken(token);
  assertOriginMatchesSession(session, resolveSocketOrigin(socket));
  return session;
}

function getSocketClientIp(socket: Socket): string {
  return socket.handshake.address ?? 'unknown';
}

async function loadConversationForDashboard(
  conversationId: string,
  businessId: string
) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, businessId },
  });
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
        callback(null, true);
      },
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        if (!conversationId || typeof conversationId !== 'string') {
          socket.emit('error', { message: 'Invalid conversation' });
          return;
        }

        const dashboardAuth = tryDashboardAuth(socket);
        if (dashboardAuth) {
          const conversation = await loadConversationForDashboard(
            conversationId,
            dashboardAuth.businessId
          );
          if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
          }
          socket.join(conversationRoom(conversationId));
          const history = await getHistory(conversationId);
          socket.emit('conversation_joined', { conversationId, history });
          return;
        }

        const widgetSession = verifySocketWidgetSession(socket);
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation || conversation.businessId !== widgetSession.businessId) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        socket.join(conversationRoom(conversationId));
        const history = await getHistory(conversationId);
        socket.emit('conversation_joined', { conversationId, history });
      } catch {
        socket.emit('error', { message: 'Unable to join conversation' });
      }
    });

    socket.on('customer_message', async ({ conversationId, content }) => {
      try {
        const widgetSession = verifySocketWidgetSession(socket);

        if (!content || typeof content !== 'string' || !content.trim()) {
          return;
        }

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { business: { select: { status: true } } },
        });

        if (!conversation || conversation.businessId !== widgetSession.businessId) {
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

        await assertWidgetMessageRateLimits(
          widgetSession.businessId,
          widgetSession.sub,
          getSocketClientIp(socket)
        );

        await appendMessage(conversationId, 'CUSTOMER', content.trim());

        const live = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { agentId: true, handedOff: true, businessId: true },
        });

        if (live?.agentId || live?.handedOff) {
          io.to(conversationRoom(conversationId)).emit('customer_message', {
            conversationId,
            content: content.trim(),
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

        try {
          await assertWithinAiLimits(live!.businessId);
        } catch (err) {
          if (err instanceof PlanLimitExceededError) {
            io.to(conversationRoom(conversationId)).emit('ai_error', {
              conversationId,
              message: WIDGET_LIMIT_MESSAGE,
            });
            return;
          }
          throw err;
        }

        const history = await getHistory(conversationId);
        const result = await runAgent(content.trim(), live!.businessId, history, {
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

        if (result.shouldEscalate) {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { status: 'ESCALATED' },
          });
          io.to(businessRoom(live!.businessId)).emit('new_escalation', {
            conversationId,
          });

          const [onlineAgents, business] = await Promise.all([
            prisma.agent.count({
              where: { businessId: live!.businessId, isOnline: true },
            }),
            prisma.business.findUnique({
              where: { id: live!.businessId },
              select: { email: true, name: true },
            }),
          ]);

          if (onlineAgents === 0 && business) {
            sendEmailSafe(() =>
              sendEscalationEmail({
                to: business.email,
                businessName: business.name,
                conversationId,
              })
            );
          }
        }
      } catch (error) {
        logError('socket customer_message', error);
        io.to(conversationRoom(conversationId)).emit('ai_error', {
          conversationId,
          message: 'Sorry, something went wrong. Please try again.',
        });
      }
    });

    socket.on('agent_online', async () => {
      try {
        const auth = requireAgentSocket(socket);

        const agent = await prisma.agent.findFirst({
          where: { id: auth.sub, businessId: auth.businessId },
        });

        if (!agent) {
          socket.emit('error', { message: 'Agent not found' });
          return;
        }

        socket.join(businessRoom(auth.businessId));
        agentSocketMap.set(socket.id, auth.sub);

        await prisma.agent.update({
          where: { id: auth.sub },
          data: { isOnline: true },
        });
        await redis.set(redisKeys.agentPresence(auth.sub), 'online', { ex: 3600 });

        io.to(businessRoom(auth.businessId)).emit('agent_status_updated', {
          agentId: auth.sub,
          isOnline: true,
        });
      } catch (error) {
        logError('socket agent_online', error);
        socket.emit('error', { message: 'Unauthorized' });
      }
    });

    socket.on('accept_conversation', async ({ conversationId }) => {
      try {
        const auth = requireAgentSocket(socket);

        if (!conversationId || typeof conversationId !== 'string') {
          socket.emit('error', { message: 'Invalid conversation' });
          return;
        }

        const agent = await prisma.agent.findUnique({ where: { id: auth.sub } });
        if (!agent || agent.businessId !== auth.businessId) {
          socket.emit('error', { message: 'Agent not found' });
          return;
        }

        const conversation = await prisma.conversation.findFirst({
          where: { id: conversationId, businessId: auth.businessId },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (conversation.agentId && conversation.agentId !== auth.sub) {
          socket.emit('error', { message: 'Conversation assigned to another agent' });
          return;
        }

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { agentId: auth.sub, handedOff: true, status: 'ESCALATED' },
        });

        socket.join(conversationRoom(conversationId));

        io.to(conversationRoom(conversationId)).emit('agent_joined', {
          agentId: auth.sub,
          agentName: agent.name,
        });
      } catch (error) {
        logError('socket accept_conversation', error);
        socket.emit('error', { message: 'Unauthorized' });
      }
    });

    socket.on('agent_message', async ({ conversationId, content }) => {
      try {
        const auth = requireAgentSocket(socket);

        if (!conversationId || typeof content !== 'string' || !content.trim()) {
          return;
        }

        const conversation = await prisma.conversation.findFirst({
          where: { id: conversationId, businessId: auth.businessId },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (conversation.agentId && conversation.agentId !== auth.sub) {
          socket.emit('error', { message: 'Conversation assigned to another agent' });
          return;
        }

        if (!conversation.agentId) {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { agentId: auth.sub, handedOff: true },
          });
        }

        const message = await appendMessage(conversationId, 'AGENT', content.trim());

        io.to(conversationRoom(conversationId)).emit('agent_response', {
          conversationId,
          message,
        });
      } catch (error) {
        logError('socket agent_message', error);
        socket.emit('error', { message: 'Unauthorized' });
      }
    });

    socket.on('resolve_conversation', async ({ conversationId }) => {
      try {
        const auth = requireAgentSocket(socket);

        if (!conversationId || typeof conversationId !== 'string') {
          return;
        }

        const conversation = await prisma.conversation.findFirst({
          where: { id: conversationId, businessId: auth.businessId },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (conversation.agentId && conversation.agentId !== auth.sub) {
          socket.emit('error', { message: 'Conversation assigned to another agent' });
          return;
        }

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { status: 'RESOLVED' },
        });

        io.to(conversationRoom(conversationId)).emit('conversation_resolved', {
          conversationId,
        });
      } catch (error) {
        logError('socket resolve_conversation', error);
        socket.emit('error', { message: 'Unauthorized' });
      }
    });

    socket.on('join_business', async () => {
      try {
        const auth = requireDashboardSocket(socket);
        socket.join(businessRoom(auth.businessId));
      } catch {
        socket.emit('error', { message: 'Unauthorized' });
      }
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

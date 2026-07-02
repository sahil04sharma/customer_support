import { useEffect, useRef } from 'react';
import type { WidgetMessage } from '../lib/api';
import { connectSocket } from '../lib/socket';

interface UseWidgetSocketOptions {
  conversationId: string | null;
  onHistory: (messages: WidgetMessage[]) => void;
  onAiTyping: () => void;
  onAiResponse: (message: WidgetMessage) => void;
  onEscalated: () => void;
  onAgentJoined: (agentName: string) => void;
  onAgentResponse: (message: WidgetMessage) => void;
  onResolved: () => void;
  onQueueUpdate: (content: string) => void;
  onAiError: (content: string) => void;
}

export function useWidgetSocket({
  conversationId,
  onHistory,
  onAiTyping,
  onAiResponse,
  onEscalated,
  onAgentJoined,
  onAgentResponse,
  onResolved,
  onQueueUpdate,
  onAiError,
}: UseWidgetSocketOptions) {
  const joinedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const socket = connectSocket();

    if (joinedRef.current !== conversationId) {
      socket.emit('join_conversation', { conversationId });
      joinedRef.current = conversationId;
    }

    const handleJoined = (data: { conversationId: string; history: WidgetMessage[] }) => {
      if (data.conversationId === conversationId) {
        onHistory(data.history);
      }
    };

    const handleAiTyping = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) onAiTyping();
    };

    const handleAiResponse = (data: { conversationId: string; message: WidgetMessage }) => {
      if (data.conversationId === conversationId) onAiResponse(data.message);
    };

    const handleEscalated = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) onEscalated();
    };

    const handleAgentJoined = (data: { agentId: string; agentName: string }) => {
      onAgentJoined(data.agentName);
    };

    const handleAgentResponse = (data: { conversationId: string; message: WidgetMessage }) => {
      if (data.conversationId === conversationId) onAgentResponse(data.message);
    };

    const handleResolved = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) onResolved();
    };

    const handleQueueUpdate = (data: { conversationId: string; content: string }) => {
      if (data.conversationId === conversationId) onQueueUpdate(data.content);
    };

    const handleAiError = (data: { conversationId: string; message: string }) => {
      if (data.conversationId === conversationId) onAiError(data.message);
    };

    socket.on('conversation_joined', handleJoined);
    socket.on('ai_typing', handleAiTyping);
    socket.on('ai_response', handleAiResponse);
    socket.on('escalated_to_human', handleEscalated);
    socket.on('agent_joined', handleAgentJoined);
    socket.on('agent_response', handleAgentResponse);
    socket.on('conversation_resolved', handleResolved);
    socket.on('queue_update', handleQueueUpdate);
    socket.on('ai_error', handleAiError);

    return () => {
      socket.off('conversation_joined', handleJoined);
      socket.off('ai_typing', handleAiTyping);
      socket.off('ai_response', handleAiResponse);
      socket.off('escalated_to_human', handleEscalated);
      socket.off('agent_joined', handleAgentJoined);
      socket.off('agent_response', handleAgentResponse);
      socket.off('conversation_resolved', handleResolved);
      socket.off('queue_update', handleQueueUpdate);
      socket.off('ai_error', handleAiError);
    };
  }, [
    conversationId,
    onHistory,
    onAiTyping,
    onAiResponse,
    onEscalated,
    onAgentJoined,
    onAgentResponse,
    onResolved,
    onQueueUpdate,
    onAiError,
  ]);
}

export function sendCustomerMessage(conversationId: string, content: string): void {
  const socket = connectSocket();
  socket.emit('customer_message', { conversationId, content });
}

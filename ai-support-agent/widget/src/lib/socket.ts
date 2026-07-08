import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl, getWidgetSessionToken } from './api';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  const token = getWidgetSessionToken();
  if (!token) {
    throw new Error('Widget session not initialized');
  }

  if (socket?.connected) return socket;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(getApiBaseUrl(), {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    auth: { widgetToken: token },
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      auth: { accessToken },
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [accessToken]);

  const emit = (event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event: string, handler: (...args: unknown[]) => void) => {
    const socket = socketRef.current;
    if (!socket) return undefined;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  };

  return { socket: socketRef.current, connected, emit, on };
}

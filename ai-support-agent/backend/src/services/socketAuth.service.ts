import { Socket } from 'socket.io';
import { verifyAccessToken, type TokenPayload } from './auth.service';

export function getSocketAccessToken(socket: Socket): string | null {
  const fromAuth = socket.handshake.auth?.accessToken;
  if (typeof fromAuth === 'string' && fromAuth.length > 0) {
    return fromAuth;
  }

  const header = socket.handshake.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }

  return null;
}

export function verifySocketAccessToken(socket: Socket): TokenPayload {
  const token = getSocketAccessToken(socket);
  if (!token) {
    throw new Error('Authentication required');
  }
  return verifyAccessToken(token);
}

export function requireAgentSocket(socket: Socket): TokenPayload {
  const auth = verifySocketAccessToken(socket);
  if (auth.role !== 'AGENT') {
    throw new Error('Agent access required');
  }
  return auth;
}

export function requireDashboardSocket(socket: Socket): TokenPayload {
  const auth = verifySocketAccessToken(socket);
  if (auth.role !== 'BUSINESS' && auth.role !== 'AGENT') {
    throw new Error('Dashboard access required');
  }
  return auth;
}

export function tryDashboardAuth(socket: Socket): TokenPayload | null {
  try {
    const auth = verifySocketAccessToken(socket);
    if (auth.role !== 'BUSINESS' && auth.role !== 'AGENT') {
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

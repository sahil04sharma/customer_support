import { NextFunction, Request, Response } from 'express';
import { AppError } from './error.middleware';
import {
  assertOriginMatchesSession,
  resolveRequestOrigin,
  verifyWidgetSessionToken,
  WIDGET_UNAVAILABLE_MESSAGE,
  type WidgetSessionPayload,
} from '../services/widgetSession.service';

declare global {
  namespace Express {
    interface Request {
      widgetSession?: WidgetSessionPayload;
    }
  }
}

export function requireWidgetSession(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, WIDGET_UNAVAILABLE_MESSAGE);
    }

    const token = header.slice('Bearer '.length);
    const session = verifyWidgetSessionToken(token);
    const origin = resolveRequestOrigin(req);
    assertOriginMatchesSession(session, origin);

    req.widgetSession = session;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError(401, WIDGET_UNAVAILABLE_MESSAGE));
  }
}

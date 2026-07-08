import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { permissiveCors, strictCors } from './middleware/cors.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter, authLimiter, widgetLimiter } from './middleware/rateLimit.middleware';
import agentRoutes from './routes/agent.routes';
import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import conversationRoutes from './routes/conversation.routes';
import documentRoutes from './routes/document.routes';
import widgetRoutes from './routes/widget.routes';
import adminRoutes from './routes/admin.routes';
import cannedRoutes from './routes/canned.routes';

export function createApp(): Express {
  const app = express();

  if (env.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  const widgetPath = path.join(__dirname, '../../widget/dist');

  // Public embed: open CORS + rate limits
  app.use('/widget.js', permissiveCors, express.static(path.join(widgetPath, 'widget.js')));
  app.use(permissiveCors, express.static(widgetPath));
  app.use('/api/widget', permissiveCors, widgetLimiter, widgetRoutes);

  // Dashboard & authenticated API: restricted CORS
  app.use(strictCors);

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/documents', apiLimiter, documentRoutes);
  app.use('/api/conversations', apiLimiter, conversationRoutes);
  app.use('/api/agent', apiLimiter, agentRoutes);
  app.use('/api/business', apiLimiter, businessRoutes);
  app.use('/api/canned-responses', apiLimiter, cannedRoutes);
  app.use('/api/admin', authLimiter, adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

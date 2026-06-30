import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import agentRoutes from './routes/agent.routes';
import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import conversationRoutes from './routes/conversation.routes';
import documentRoutes from './routes/document.routes';
import widgetRoutes from './routes/widget.routes';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: [env.clientUrl],
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/widget', widgetRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/agent', agentRoutes);
  app.use('/api/business', businessRoutes);
  // ...

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

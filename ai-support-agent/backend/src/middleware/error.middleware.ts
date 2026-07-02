import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logError } from '../utils/safeLog';

/**
 * Application error with an HTTP status code. Throw this from anywhere in a
 * route/controller and the central handler below will format the response.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });
      return;
    }
    res.status(400).json({ error: 'Upload failed. Please try a smaller PDF or TXT file.' });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof Error && err.message.includes('not allowed by CORS')) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  logError('error', err);
  res.status(500).json({
    error: env.isProduction ? 'Internal server error' : 'Internal server error',
  });
}

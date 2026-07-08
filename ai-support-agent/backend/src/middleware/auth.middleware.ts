import { NextFunction, Request, Response } from 'express';
import { AppError } from './error.middleware';
import { prisma } from '../lib/prisma';
import { verifyAccessToken } from '../services/auth.service';

function authenticate(req: Request): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication required');
  }

  const token = header.slice('Bearer '.length);
  try {
    req.auth = verifyAccessToken(token);
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    authenticate(req);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireBusiness(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    if (req.auth?.role !== 'BUSINESS') {
      next(new AppError(403, 'Business access required'));
      return;
    }
    next();
  });
}

export function requireAgent(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    if (req.auth?.role !== 'AGENT') {
      next(new AppError(403, 'Agent access required'));
      return;
    }
    next();
  });
}

export function requireBusinessOrAgent(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    if (req.auth?.role !== 'BUSINESS' && req.auth?.role !== 'AGENT') {
      next(new AppError(403, 'Access denied'));
      return;
    }
    next();
  });
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, async (err) => {
    if (err) {
      next(err);
      return;
    }
    if (req.auth?.role !== 'ADMIN') {
      next(new AppError(403, 'Admin access required'));
      return;
    }
    try {
      const admin = await prisma.platformAdmin.findUnique({
        where: { id: req.auth!.sub },
      });
      if (!admin) {
        next(new AppError(403, 'Admin account not found'));
        return;
      }
      next();
    } catch (e) {
      next(e);
    }
  });
}

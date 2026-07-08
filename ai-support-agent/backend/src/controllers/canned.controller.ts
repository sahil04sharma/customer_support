import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import {
  createCannedResponseSchema,
  updateCannedResponseSchema,
} from '../validation/canned.schema';

function businessIdFromAuth(req: Request): string {
  const businessId = req.auth?.businessId;
  if (!businessId) {
    throw new AppError(401, 'Authentication required');
  }
  return businessId;
}

export async function listCannedResponses(req: Request, res: Response): Promise<void> {
  const businessId = businessIdFromAuth(req);

  const items = await prisma.cannedResponse.findMany({
    where: { businessId },
    orderBy: { updatedAt: 'desc' },
  });

  res.json(items);
}

export async function createCannedResponse(req: Request, res: Response): Promise<void> {
  const businessId = businessIdFromAuth(req);
  const body = createCannedResponseSchema.parse(req.body);

  const item = await prisma.cannedResponse.create({
    data: {
      businessId,
      title: body.title,
      content: body.content,
    },
  });

  res.status(201).json(item);
}

export async function updateCannedResponse(req: Request, res: Response): Promise<void> {
  const businessId = businessIdFromAuth(req);
  const { id } = req.params;
  const body = updateCannedResponseSchema.parse(req.body);

  const existing = await prisma.cannedResponse.findFirst({
    where: { id, businessId },
  });

  if (!existing) {
    throw new AppError(404, 'Canned response not found');
  }

  const item = await prisma.cannedResponse.update({
    where: { id },
    data: body,
  });

  res.json(item);
}

export async function deleteCannedResponse(req: Request, res: Response): Promise<void> {
  const businessId = businessIdFromAuth(req);
  const { id } = req.params;

  const existing = await prisma.cannedResponse.findFirst({
    where: { id, businessId },
  });

  if (!existing) {
    throw new AppError(404, 'Canned response not found');
  }

  await prisma.cannedResponse.delete({ where: { id } });
  res.json({ message: 'Deleted' });
}

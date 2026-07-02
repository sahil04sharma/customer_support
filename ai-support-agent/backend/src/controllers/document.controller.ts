import { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import { AppError } from '../middleware/error.middleware';
import { uploadDocument } from '../lib/cloudinary';
import { prisma } from '../lib/prisma';
import { processDocument } from '../services/documentProcessor';
import { extractText } from '../services/pdfExtractor';
import { logError } from '../utils/safeLog';

const ALLOWED_MIMETYPES = ['application/pdf', 'text/plain'] as const;
const ALLOWED_EXTENSIONS = ['.pdf', '.txt'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      cb(new AppError(400, 'Unsupported file type. Upload a PDF or TXT file.'));
      return;
    }
    if (!ALLOWED_MIMETYPES.includes(file.mimetype as (typeof ALLOWED_MIMETYPES)[number])) {
      cb(new AppError(400, 'Unsupported file type. Upload a PDF or TXT file.'));
      return;
    }
    cb(null, true);
  },
});

export const uploadMiddleware = upload.single('file');

async function runBackgroundProcessing(
  documentId: string,
  businessId: string,
  fileUrl: string,
  mimetype: string
): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file from Cloudinary: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const text = await extractText(buffer, mimetype);
    await processDocument(documentId, businessId, text);
  } catch (error) {
    logError(`documents processing ${documentId}`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });
  }
}

export async function uploadDocumentHandler(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }

  const businessId = req.auth!.businessId;
  const fileUrl = await uploadDocument(req.file.buffer, req.file.originalname);

  const document = await prisma.document.create({
    data: {
      businessId,
      name: req.file.originalname,
      fileUrl,
      status: 'PROCESSING',
    },
  });

  res.status(201).json(document);

  void runBackgroundProcessing(
    document.id,
    businessId,
    fileUrl,
    req.file.mimetype
  );
}

export async function listDocuments(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;

  const documents = await prisma.document.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      fileUrl: true,
      status: true,
      createdAt: true,
    },
  });

  res.json(documents);
}

export async function deleteDocument(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: { id, businessId },
  });

  if (!document) {
    throw new AppError(404, 'Document not found');
  }

  await prisma.document.delete({ where: { id } });
  res.json({ message: 'Document deleted' });
}

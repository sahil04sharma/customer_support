import { prisma } from '../../lib/prisma';
import { extractText } from '../pdfExtractor';
import { processDocument } from '../documentProcessor';
import { logError } from '../../utils/safeLog';

async function reprocessDocument(
  documentId: string,
  businessId: string,
  fileUrl: string
): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimetype = fileUrl.endsWith('.pdf')
      ? 'application/pdf'
      : 'text/plain';
    const text = await extractText(buffer, mimetype);
    await processDocument(documentId, businessId, text);
  } catch (error) {
    logError(`reembed document ${documentId}`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });
  }
}

export async function reembedAllDocuments(businessId: string): Promise<{ queued: number }> {
  const documents = await prisma.document.findMany({
    where: { businessId, status: { in: ['READY', 'FAILED'] } },
    select: { id: true, fileUrl: true },
  });

  if (documents.length === 0) {
    return { queued: 0 };
  }

  await prisma.$executeRaw`
    DELETE FROM "DocumentChunk" WHERE "businessId" = ${businessId}
  `;

  await prisma.document.updateMany({
    where: { businessId },
    data: { status: 'PROCESSING' },
  });

  for (const doc of documents) {
    void reprocessDocument(doc.id, businessId, doc.fileUrl);
  }

  return { queued: documents.length };
}

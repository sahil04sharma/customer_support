import cuid from 'cuid';
import { prisma } from '../lib/prisma';
import { chunkText } from './chunker';
import { generateEmbedding } from './embeddings';
import { mapWithConcurrency } from '../utils/concurrency';
import { logError } from '../utils/safeLog';

const EMBED_CONCURRENCY = 4;

export async function processDocument(
  documentId: string,
  businessId: string,
  text: string
): Promise<void> {
  try {
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error('No text content found in document');
    }

    await mapWithConcurrency(chunks, EMBED_CONCURRENCY, async (chunk, i) => {
      const embedding = await generateEmbedding(chunk, { businessId });

      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "documentId", "businessId", content, embedding, "chunkIndex", "createdAt")
        VALUES (
          ${cuid()},
          ${documentId},
          ${businessId},
          ${chunk},
          ${JSON.stringify(embedding)}::vector,
          ${i},
          NOW()
        )
      `;
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'READY' },
    });
  } catch (error) {
    logError(`documentProcessor ${documentId}`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });
  }
}

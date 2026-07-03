import cuid from 'cuid';
import { prisma } from '../lib/prisma';
import { chunkText } from './chunker';
import { generateEmbedding } from './embeddings';
import { logError } from '../utils/safeLog';

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

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i], { businessId });

      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "documentId", "businessId", content, embedding, "chunkIndex", "createdAt")
        VALUES (
          ${cuid()},
          ${documentId},
          ${businessId},
          ${chunks[i]},
          ${JSON.stringify(embedding)}::vector,
          ${i},
          NOW()
        )
      `;
    }

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

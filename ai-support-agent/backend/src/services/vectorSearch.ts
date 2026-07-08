import { prisma } from '../lib/prisma';
import { generateEmbedding } from './embeddings';

const MIN_SIMILARITY = 0.2;

export async function searchKnowledgeBase(
  query: string,
  businessId: string,
  limit = 5
): Promise<{ content: string; similarity: number }[]> {
  const queryEmbedding = await generateEmbedding(query, { businessId });

  const results = await prisma.$queryRaw<{ content: string; similarity: number }[]>`
    SELECT content, 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
    FROM "DocumentChunk"
    WHERE "businessId" = ${businessId}
      AND 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) >= ${MIN_SIMILARITY}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `;

  return results;
}

import { prisma } from '../lib/prisma';
import { generateEmbedding } from './embeddings';

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
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `;

  return results;
}

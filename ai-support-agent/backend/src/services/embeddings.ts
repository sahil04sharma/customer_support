import { createEmbedding } from './ai/embedding.service';
import { recordUsageSafe, estimateTokensFromText } from './usage.service';

/**
 * Generate a text embedding for RAG (768 dimensions).
 * Routes to the tenant's configured provider or platform default.
 */
export async function generateEmbedding(
  text: string,
  options?: { businessId?: string }
): Promise<number[]> {
  const businessId = options?.businessId;
  if (!businessId) {
    throw new Error('businessId is required for embeddings');
  }

  const result = await createEmbedding(businessId, text);

  if (result.billingSource === 'platform') {
    recordUsageSafe({
      businessId,
      type: 'EMBEDDING',
      model: result.model,
      promptTokens: result.promptTokens,
      outputTokens: 0,
    });
  }

  return result.values;
}

export async function generateEmbeddings(
  texts: string[],
  businessId: string
): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await generateEmbedding(text, { businessId }));
  }
  return embeddings;
}

/** @deprecated use estimateTokensFromText from usage.service */
export { estimateTokensFromText };

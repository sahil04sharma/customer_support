import { env } from '../config/env';
import {
  estimateTokensFromText,
  recordUsageSafe,
} from './usage.service';

const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;

interface GeminiEmbedResponse {
  embedding?: { values?: number[] };
  error?: { message?: string };
}

/**
 * Generate a text embedding via the Gemini API.
 * Uses gemini-embedding-001 (text-embedding-004 was deprecated Jan 2026).
 * outputDimensionality=768 matches our pgvector column size.
 */
export async function generateEmbedding(
  text: string,
  options?: { businessId?: string }
): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${env.geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });

  const data = (await response.json()) as GeminiEmbedResponse;

  if (!response.ok) {
    const message = data.error?.message ?? response.statusText;
    throw new Error(`Gemini embedding failed (${response.status}): ${message}`);
  }

  const values = data.embedding?.values;
  if (!values?.length) {
    throw new Error('Gemini embedding returned no values');
  }

  if (options?.businessId) {
    const tokens = estimateTokensFromText(text);
    recordUsageSafe({
      businessId: options.businessId,
      type: 'EMBEDDING',
      model: EMBEDDING_MODEL,
      promptTokens: tokens,
      outputTokens: 0,
    });
  }

  return values;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await generateEmbedding(text));
  }
  return embeddings;
}

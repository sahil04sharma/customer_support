import { resolveAiConfig } from './aiConfig.service';
import {
  EMBEDDING_DIMENSIONS,
  type EmbedProvider,
  type EmbeddingResult,
} from './providers';

async function embedOpenAi(
  apiKey: string,
  model: string,
  text: string
): Promise<Omit<EmbeddingResult, 'billingSource'>> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    data?: { embedding?: number[] }[];
    usage?: { prompt_tokens?: number };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? `OpenAI embedding error (${response.status})`);
  }

  const values = data.data?.[0]?.embedding;
  if (!values?.length) {
    throw new Error('OpenAI embedding returned no values');
  }

  return {
    values,
    model,
    promptTokens: data.usage?.prompt_tokens ?? Math.ceil(text.length / 4),
  };
}

async function embedGoogle(
  apiKey: string,
  model: string,
  text: string
): Promise<Omit<EmbeddingResult, 'billingSource'>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    embedding?: { values?: number[] };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Gemini embedding error (${response.status})`);
  }

  const values = data.embedding?.values;
  if (!values?.length) {
    throw new Error('Gemini embedding returned no values');
  }

  return {
    values,
    model,
    promptTokens: Math.ceil(text.length / 4),
  };
}

async function embedWithProvider(
  provider: EmbedProvider,
  apiKey: string,
  model: string,
  text: string
): Promise<Omit<EmbeddingResult, 'billingSource'>> {
  switch (provider) {
    case 'openai':
      return embedOpenAi(apiKey, model, text);
    case 'google':
      return embedGoogle(apiKey, model, text);
    default:
      throw new Error(`Unsupported embedding provider: ${provider}`);
  }
}

export async function createEmbedding(
  businessId: string,
  text: string
): Promise<EmbeddingResult> {
  const config = await resolveAiConfig(businessId);
  const result = await embedWithProvider(
    config.embedProvider,
    config.embedApiKey,
    config.embedModel,
    text
  );

  return {
    ...result,
    billingSource: config.usesOwnEmbedKey ? 'byok' : 'platform',
  };
}

export async function testEmbedConnection(
  provider: EmbedProvider,
  apiKey: string,
  model: string
): Promise<void> {
  await embedWithProvider(provider, apiKey, model, 'connection test');
}

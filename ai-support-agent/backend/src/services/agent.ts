import Groq from 'groq-sdk';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { searchKnowledgeBase } from './vectorSearch';

const groq = new Groq({ apiKey: env.groqApiKey });

export interface AgentResponse {
  answer: string;
  confidence: number;
  shouldEscalate: boolean;
  sources: string[];
}

export async function runAgent(
  query: string,
  businessId: string,
  conversationHistory: { role: string; content: string }[]
): Promise<AgentResponse> {
  const settings = await prisma.businessSettings.findUnique({
    where: { businessId },
  });
  const confidenceThreshold = settings?.confidenceThreshold ?? 0.7;

  const relevantChunks = await searchKnowledgeBase(query, businessId, 5);
  const topSimilarity = relevantChunks[0]?.similarity ?? 0;

  const context = relevantChunks
    .map((chunk, i) => `[Source ${i + 1}]: ${chunk.content}`)
    .join('\n\n');

  const systemPrompt = `You are a helpful customer support assistant. 
Answer the customer's question using ONLY the information provided in the context below.
If the context does not contain enough information to answer confidently, say exactly: "I need to connect you with a human agent who can better help you."
Do not make up information. Be concise and friendly.

Context from knowledge base:
${context}`;

  const historyMessages = conversationHistory.slice(-6).map((msg) => ({
    role: msg.role === 'CUSTOMER' ? ('user' as const) : ('assistant' as const),
    content: msg.content,
  }));

  const last = conversationHistory[conversationHistory.length - 1];
  const queryAlreadyInHistory =
    last?.role === 'CUSTOMER' && last.content === query;

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
  ];

  if (!queryAlreadyInHistory) {
    messages.push({ role: 'user', content: query });
  }
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    max_tokens: 500,
    temperature: 0.3,
  });

  const answer = response.choices[0].message.content ?? '';

  const needsEscalation =
    topSimilarity < confidenceThreshold ||
    answer.includes('human agent') ||
    answer.includes('connect you with');

  return {
    answer,
    confidence: topSimilarity,
    shouldEscalate: needsEscalation,
    sources: relevantChunks.map((c) => c.content.slice(0, 100)),
  };
}

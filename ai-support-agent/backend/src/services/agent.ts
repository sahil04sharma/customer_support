import { completeChat } from './ai/chat.service';
import { prisma } from '../lib/prisma';
import { searchKnowledgeBase } from './vectorSearch';
import { recordUsageSafe } from './usage.service';

export interface AgentResponse {
  answer: string;
  confidence: number;
  shouldEscalate: boolean;
  sources: string[];
}

export async function runAgent(
  query: string,
  businessId: string,
  conversationHistory: { role: string; content: string }[],
  options?: { conversationId?: string }
): Promise<AgentResponse> {
  const settings = await prisma.businessSettings.findUnique({
    where: { businessId },
  });
  const confidenceThreshold = settings?.confidenceThreshold ?? 0.7;
  const aiLanguage = settings?.aiLanguage ?? 'en';
  const aiPersona = settings?.aiPersona ?? 'friendly and professional';

  const relevantChunks = await searchKnowledgeBase(query, businessId, 5);
  const topSimilarity = relevantChunks[0]?.similarity ?? 0;

  const context = relevantChunks
    .map((chunk, i) => `[Source ${i + 1}]: ${chunk.content}`)
    .join('\n\n');

  const systemPrompt = `You are a helpful customer support assistant for this business.
Respond in ${languageLabel(aiLanguage)} with a ${aiPersona} tone.
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

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
  ];

  if (!queryAlreadyInHistory) {
    messages.push({ role: 'user', content: query });
  }

  const response = await completeChat(businessId, messages);

  if (response.billingSource === 'platform') {
    recordUsageSafe({
      businessId,
      type: 'AI_MESSAGE',
      model: response.model,
      promptTokens: response.promptTokens,
      outputTokens: response.outputTokens,
      conversationId: options?.conversationId,
    });
  }

  const answer = response.content;

  const explicitHandoff = /i need to connect you with a human agent/i.test(answer);
  const noUsefulContext =
    relevantChunks.length === 0 || topSimilarity < 0.35;

  const shouldEscalate =
    explicitHandoff || (noUsefulContext && topSimilarity < confidenceThreshold);

  return {
    answer,
    confidence: topSimilarity,
    shouldEscalate,
    sources: relevantChunks.map((c) => c.content.slice(0, 100)),
  };
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  hi: 'Hindi',
  ar: 'Arabic',
  ja: 'Japanese',
  zh: 'Chinese',
};

function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code;
}

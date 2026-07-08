export type AiMode = 'platform' | 'byok';
export type ChatProvider = 'openai' | 'anthropic' | 'groq' | 'google';
export type EmbedProvider = 'openai' | 'google';

export const EMBEDDING_DIMENSIONS = 768;

export const CHAT_PROVIDERS: ChatProvider[] = ['openai', 'anthropic', 'groq', 'google'];
export const EMBED_PROVIDERS: EmbedProvider[] = ['openai', 'google'];

export const CHAT_MODELS: Record<ChatProvider, { id: string; label: string }[]> = {
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  ],
  groq: [
    { id: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B' },
    { id: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B' },
  ],
  google: [
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
};

export const EMBED_MODELS: Record<EmbedProvider, { id: string; label: string }[]> = {
  openai: [{ id: 'text-embedding-3-small', label: 'text-embedding-3-small (768d)' }],
  google: [{ id: 'gemini-embedding-001', label: 'gemini-embedding-001 (768d)' }],
};

export const PLATFORM_CHAT_MODEL = 'llama-3.1-8b-instant';
export const PLATFORM_CHAT_PROVIDER: ChatProvider = 'groq';
export const PLATFORM_EMBED_MODEL = 'gemini-embedding-001';
export const PLATFORM_EMBED_PROVIDER: EmbedProvider = 'google';

export function defaultChatModel(provider: ChatProvider): string {
  return CHAT_MODELS[provider][0].id;
}

export function defaultEmbedModel(provider: EmbedProvider): string {
  return EMBED_MODELS[provider][0].id;
}

export function chatProviderSupportsEmbeddings(provider: ChatProvider): boolean {
  return provider === 'openai' || provider === 'google';
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
  billingSource: 'platform' | 'byok';
}

export interface EmbeddingResult {
  values: number[];
  model: string;
  promptTokens: number;
  billingSource: 'platform' | 'byok';
}

export interface ResolvedAiConfig {
  businessId: string;
  chatMode: AiMode;
  chatProvider: ChatProvider;
  chatApiKey: string;
  chatModel: string;
  embedMode: AiMode;
  embedProvider: EmbedProvider;
  embedApiKey: string;
  embedModel: string;
  embedConfigVersion: number;
  usesOwnChatKey: boolean;
  usesOwnEmbedKey: boolean;
}

import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { decryptSecret, encryptSecret, maskApiKey } from '../encryption.service';
import {
  type AiMode,
  type ChatProvider,
  type EmbedProvider,
  defaultChatModel,
  defaultEmbedModel,
  PLATFORM_CHAT_MODEL,
  PLATFORM_CHAT_PROVIDER,
  PLATFORM_EMBED_MODEL,
  PLATFORM_EMBED_PROVIDER,
  type ResolvedAiConfig,
} from './providers';

export interface PublicAiConfig {
  chatMode: AiMode;
  chatProvider: ChatProvider | null;
  chatModel: string | null;
  chatApiKeyMasked: string | null;
  hasChatApiKey: boolean;
  embedMode: AiMode;
  embedProvider: EmbedProvider | null;
  embedModel: string | null;
  embedApiKeyMasked: string | null;
  hasEmbedApiKey: boolean;
  embedConfigVersion: number;
  usesOwnChatKey: boolean;
  usesOwnEmbedKey: boolean;
}

interface SettingsRow {
  chatMode: string;
  chatProvider: string | null;
  chatApiKeyEnc: string | null;
  chatModel: string | null;
  embedMode: string;
  embedProvider: string | null;
  embedApiKeyEnc: string | null;
  embedModel: string | null;
  embedConfigVersion: number;
}

function decryptKey(enc: string | null): string | null {
  if (!enc) return null;
  try {
    return decryptSecret(enc);
  } catch {
    return null;
  }
}

function resolveChatProvider(raw: string | null): ChatProvider {
  if (raw === 'openai' || raw === 'anthropic' || raw === 'groq' || raw === 'google') {
    return raw;
  }
  return PLATFORM_CHAT_PROVIDER;
}

function resolveEmbedProvider(raw: string | null): EmbedProvider {
  if (raw === 'openai' || raw === 'google') return raw;
  return PLATFORM_EMBED_PROVIDER;
}

export async function getPublicAiConfig(businessId: string): Promise<PublicAiConfig> {
  const settings = await prisma.businessSettings.findUnique({ where: { businessId } });
  if (!settings) {
    return {
      chatMode: 'platform',
      chatProvider: null,
      chatModel: null,
      chatApiKeyMasked: null,
      hasChatApiKey: false,
      embedMode: 'platform',
      embedProvider: null,
      embedModel: null,
      embedApiKeyMasked: null,
      hasEmbedApiKey: false,
      embedConfigVersion: 1,
      usesOwnChatKey: false,
      usesOwnEmbedKey: false,
    };
  }

  const chatKey = decryptKey(settings.chatApiKeyEnc);
  const embedKey = decryptKey(settings.embedApiKeyEnc);
  const chatMode = settings.chatMode as AiMode;
  const embedMode = settings.embedMode as AiMode;

  return {
    chatMode,
    chatProvider: settings.chatProvider as ChatProvider | null,
    chatModel: settings.chatModel,
    chatApiKeyMasked: maskApiKey(chatKey),
    hasChatApiKey: Boolean(settings.chatApiKeyEnc),
    embedMode,
    embedProvider: settings.embedProvider as EmbedProvider | null,
    embedModel: settings.embedModel,
    embedApiKeyMasked: maskApiKey(embedKey),
    hasEmbedApiKey: Boolean(settings.embedApiKeyEnc),
    embedConfigVersion: settings.embedConfigVersion,
    usesOwnChatKey: chatMode === 'byok' && Boolean(settings.chatApiKeyEnc),
    usesOwnEmbedKey: embedMode === 'byok' && Boolean(settings.embedApiKeyEnc),
  };
}

export async function resolveAiConfig(businessId: string): Promise<ResolvedAiConfig> {
  const settings = await prisma.businessSettings.findUnique({ where: { businessId } });
  const row = settings as SettingsRow | null;

  const chatMode = (row?.chatMode ?? 'platform') as AiMode;
  const embedMode = (row?.embedMode ?? 'platform') as AiMode;

  const chatProvider =
    chatMode === 'byok' && row?.chatProvider
      ? resolveChatProvider(row.chatProvider)
      : PLATFORM_CHAT_PROVIDER;

  const embedProvider =
    embedMode === 'byok' && row?.embedProvider
      ? resolveEmbedProvider(row.embedProvider)
      : PLATFORM_EMBED_PROVIDER;

  const chatModel =
    chatMode === 'byok' && row?.chatModel
      ? row.chatModel
      : PLATFORM_CHAT_MODEL;

  const embedModel =
    embedMode === 'byok' && row?.embedModel
      ? row.embedModel
      : PLATFORM_EMBED_MODEL;

  const tenantChatKey = decryptKey(row?.chatApiKeyEnc ?? null);
  const tenantEmbedKey = decryptKey(row?.embedApiKeyEnc ?? null);

  const usesOwnChatKey = chatMode === 'byok' && Boolean(tenantChatKey);
  const usesOwnEmbedKey = embedMode === 'byok' && Boolean(tenantEmbedKey);

  const chatApiKey = usesOwnChatKey ? tenantChatKey! : env.groqApiKey;
  const embedApiKey = usesOwnEmbedKey ? tenantEmbedKey! : env.geminiApiKey;

  return {
    businessId,
    chatMode,
    chatProvider,
    chatApiKey,
    chatModel,
    embedMode,
    embedProvider,
    embedApiKey,
    embedModel,
    embedConfigVersion: row?.embedConfigVersion ?? 1,
    usesOwnChatKey,
    usesOwnEmbedKey,
  };
}

export async function usesOwnChatKey(businessId: string): Promise<boolean> {
  const pub = await getPublicAiConfig(businessId);
  return pub.usesOwnChatKey;
}

export async function usesOwnEmbedKey(businessId: string): Promise<boolean> {
  const pub = await getPublicAiConfig(businessId);
  return pub.usesOwnEmbedKey;
}

export interface UpdateAiConfigInput {
  chatMode: AiMode;
  chatProvider?: ChatProvider | null;
  chatModel?: string | null;
  chatApiKey?: string;
  embedMode: AiMode;
  embedProvider?: EmbedProvider | null;
  embedModel?: string | null;
  embedApiKey?: string;
}

export async function updateAiConfig(
  businessId: string,
  input: UpdateAiConfigInput
): Promise<PublicAiConfig> {
  const existing = await prisma.businessSettings.findUnique({ where: { businessId } });
  if (!existing) {
    throw new Error('Business settings not found');
  }

  const embedChanged =
    input.embedMode === 'byok' &&
    (input.embedProvider !== existing.embedProvider ||
      input.embedModel !== existing.embedModel);

  const data: Record<string, unknown> = {
    chatMode: input.chatMode,
    embedMode: input.embedMode,
  };

  if (input.chatMode === 'platform') {
    data.chatProvider = null;
    data.chatModel = null;
    data.chatApiKeyEnc = null;
  } else {
    const provider = input.chatProvider ?? resolveChatProvider(existing.chatProvider);
    data.chatProvider = provider;
    data.chatModel = input.chatModel ?? existing.chatModel ?? defaultChatModel(provider);
    if (input.chatApiKey?.trim()) {
      data.chatApiKeyEnc = encryptSecret(input.chatApiKey.trim());
    }
  }

  if (input.embedMode === 'platform') {
    data.embedProvider = null;
    data.embedModel = null;
    data.embedApiKeyEnc = null;
  } else {
    const provider = input.embedProvider ?? resolveEmbedProvider(existing.embedProvider);
    data.embedProvider = provider;
    data.embedModel = input.embedModel ?? existing.embedModel ?? defaultEmbedModel(provider);
    if (input.embedApiKey?.trim()) {
      data.embedApiKeyEnc = encryptSecret(input.embedApiKey.trim());
    }
  }

  if (embedChanged) {
    data.embedConfigVersion = existing.embedConfigVersion + 1;
  }

  await prisma.businessSettings.update({
    where: { businessId },
    data,
  });

  return getPublicAiConfig(businessId);
}

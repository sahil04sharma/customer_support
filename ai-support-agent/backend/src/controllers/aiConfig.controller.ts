import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';
import {
  getPublicAiConfig,
  updateAiConfig,
} from '../services/ai/aiConfig.service';
import { testChatConnection } from '../services/ai/chat.service';
import { testEmbedConnection } from '../services/ai/embedding.service';
import {
  CHAT_MODELS,
  CHAT_PROVIDERS,
  EMBED_MODELS,
  EMBED_PROVIDERS,
  defaultChatModel,
  defaultEmbedModel,
  type ChatProvider,
  type EmbedProvider,
} from '../services/ai/providers';
import { reembedAllDocuments } from '../services/ai/reembed.service';
import { decryptSecret } from '../services/encryption.service';
import { testAiConfigSchema, updateAiConfigSchema } from '../validation/aiConfig.schema';

export async function getAiConfigHandler(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const [config, providers] = await Promise.all([
    getPublicAiConfig(businessId),
    Promise.resolve({
      chatProviders: CHAT_PROVIDERS,
      embedProviders: EMBED_PROVIDERS,
      chatModels: CHAT_MODELS,
      embedModels: EMBED_MODELS,
    }),
  ]);

  res.json({ config, providers });
}

export async function updateAiConfigHandler(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const body = updateAiConfigSchema.parse(req.body);

  const existing = await prisma.businessSettings.findUnique({ where: { businessId } });
  if (!existing) {
    throw new AppError(404, 'Settings not found');
  }

  if (body.chatMode === 'byok' && !body.chatApiKey && !existing.chatApiKeyEnc) {
    throw new AppError(400, 'Chat API key is required when switching to your own key');
  }
  if (body.embedMode === 'byok' && !body.embedApiKey && !existing.embedApiKeyEnc) {
    throw new AppError(400, 'Embedding API key is required when switching to your own key');
  }

  const embedWillChange =
    body.embedMode === 'byok' &&
    (body.embedProvider !== existing.embedProvider ||
      body.embedModel !== existing.embedModel);

  const config = await updateAiConfig(businessId, {
    chatMode: body.chatMode,
    chatProvider: body.chatProvider ?? undefined,
    chatModel: body.chatModel ?? undefined,
    chatApiKey: body.chatApiKey,
    embedMode: body.embedMode,
    embedProvider: body.embedProvider ?? undefined,
    embedModel: body.embedModel ?? undefined,
    embedApiKey: body.embedApiKey,
  });

  let reembed: { queued: number } | undefined;
  if (body.triggerReembed || embedWillChange) {
    if (config.embedMode === 'byok' && config.hasEmbedApiKey) {
      reembed = await reembedAllDocuments(businessId);
    }
  }

  res.json({ config, reembed });
}

export async function testAiConfigHandler(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const body = testAiConfigSchema.parse(req.body);
  const existing = await prisma.businessSettings.findUnique({ where: { businessId } });

  const results: { chat?: string; embed?: string } = {};

  if (body.target === 'chat' || body.target === 'both') {
    const provider = (body.chatProvider ??
      existing?.chatProvider ??
      'openai') as ChatProvider;
    const model =
      body.chatModel ??
      existing?.chatModel ??
      defaultChatModel(provider);
    let apiKey = body.chatApiKey;
    if (!apiKey && existing?.chatApiKeyEnc) {
      apiKey = decryptSecret(existing.chatApiKeyEnc);
    }
    if (!apiKey) {
      throw new AppError(400, 'Chat API key is required to test');
    }
    try {
      await testChatConnection(provider, apiKey, model);
      results.chat = 'ok';
    } catch (err) {
      throw new AppError(
        400,
        `Chat connection failed: ${err instanceof Error ? err.message : 'unknown error'}`
      );
    }
  }

  if (body.target === 'embed' || body.target === 'both') {
    const provider = (body.embedProvider ??
      existing?.embedProvider ??
      'openai') as EmbedProvider;
    const model =
      body.embedModel ??
      existing?.embedModel ??
      defaultEmbedModel(provider);
    let apiKey = body.embedApiKey;
    if (!apiKey && existing?.embedApiKeyEnc) {
      apiKey = decryptSecret(existing.embedApiKeyEnc);
    }
    if (!apiKey) {
      throw new AppError(400, 'Embedding API key is required to test');
    }
    try {
      await testEmbedConnection(provider, apiKey, model);
      results.embed = 'ok';
    } catch (err) {
      throw new AppError(
        400,
        `Embedding connection failed: ${err instanceof Error ? err.message : 'unknown error'}`
      );
    }
  }

  res.json({ ok: true, results });
}

export async function reembedHandler(req: Request, res: Response): Promise<void> {
  const businessId = req.auth!.businessId;
  const config = await getPublicAiConfig(businessId);

  if (config.embedMode !== 'byok' || !config.hasEmbedApiKey) {
    throw new AppError(400, 'Configure your own embedding key before re-indexing');
  }

  const result = await reembedAllDocuments(businessId);
  res.json(result);
}

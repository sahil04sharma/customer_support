import { UsageType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logError } from '../utils/safeLog';

/** USD per 1M tokens — update when provider pricing changes */
const RATES_PER_MILLION: Record<string, { input: number; output: number }> = {
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  'gemini-embedding-001': { input: 0.01, output: 0 },
};

export interface RecordUsageInput {
  businessId: string;
  type: UsageType;
  model?: string;
  promptTokens?: number;
  outputTokens?: number;
  conversationId?: string;
}

function estimateCost(model: string, promptTokens: number, outputTokens: number): number {
  const rates = RATES_PER_MILLION[model] ?? { input: 0.1, output: 0.1 };
  return (promptTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output;
}

export function estimateTokensFromText(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export async function recordUsage(input: RecordUsageInput): Promise<void> {
  const promptTokens = input.promptTokens ?? 0;
  const outputTokens = input.outputTokens ?? 0;
  const totalTokens = promptTokens + outputTokens;
  const model = input.model ?? 'unknown';
  const estimatedCost = estimateCost(model, promptTokens, outputTokens);

  await prisma.usageEvent.create({
    data: {
      businessId: input.businessId,
      type: input.type,
      model,
      promptTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      conversationId: input.conversationId,
    },
  });
}

/** Best-effort metering — never throw to callers */
export function recordUsageSafe(input: RecordUsageInput): void {
  void recordUsage(input).catch((err) => logError('usage.record', err));
}

import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveAiConfig } from './aiConfig.service';
import {
  type ChatCompletionResult,
  type ChatMessage,
  type ChatProvider,
} from './providers';

async function completeOpenAi(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<Omit<ChatCompletionResult, 'billingSource'>> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? `OpenAI error (${response.status})`);
  }

  return {
    content: data.choices?.[0]?.message?.content ?? '',
    model,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  };
}

async function completeAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<Omit<ChatCompletionResult, 'billingSource'>> {
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system,
      messages: chatMessages,
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    content?: { type: string; text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Anthropic error (${response.status})`);
  }

  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';

  return {
    content: text,
    model,
    promptTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
  };
}

async function completeGroq(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<Omit<ChatCompletionResult, 'billingSource'>> {
  const groq = new Groq({ apiKey });
  const response = await groq.chat.completions.create({
    model,
    messages,
    max_tokens: 500,
    temperature: 0.3,
  });

  return {
    content: response.choices[0]?.message?.content ?? '',
    model,
    promptTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
  };
}

async function completeGoogle(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<Omit<ChatCompletionResult, 'billingSource'>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model });

  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const history = messages.filter((m) => m.role !== 'system');
  const last = history[history.length - 1];
  if (!last) {
    throw new Error('No user message for chat completion');
  }
  const prior = history.slice(0, -1);

  const chat = gemini.startChat({
    history: prior.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    systemInstruction: system || undefined,
  });

  const result = await chat.sendMessage(last.content);
  const text = result.response.text();

  return {
    content: text,
    model,
    promptTokens: Math.ceil(
      messages.reduce((sum, m) => sum + m.content.length, 0) / 4
    ),
    outputTokens: Math.ceil(text.length / 4),
  };
}

async function completeWithProvider(
  provider: ChatProvider,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<Omit<ChatCompletionResult, 'billingSource'>> {
  switch (provider) {
    case 'openai':
      return completeOpenAi(apiKey, model, messages);
    case 'anthropic':
      return completeAnthropic(apiKey, model, messages);
    case 'groq':
      return completeGroq(apiKey, model, messages);
    case 'google':
      return completeGoogle(apiKey, model, messages);
    default:
      throw new Error(`Unsupported chat provider: ${provider}`);
  }
}

export async function completeChat(
  businessId: string,
  messages: ChatMessage[]
): Promise<ChatCompletionResult> {
  const config = await resolveAiConfig(businessId);
  const result = await completeWithProvider(
    config.chatProvider,
    config.chatApiKey,
    config.chatModel,
    messages
  );

  return {
    ...result,
    billingSource: config.usesOwnChatKey ? 'byok' : 'platform',
  };
}

/** Test a chat connection with explicit credentials (before save). */
export async function testChatConnection(
  provider: ChatProvider,
  apiKey: string,
  model: string
): Promise<void> {
  await completeWithProvider(provider, apiKey, model, [
    { role: 'user', content: 'Reply with exactly: OK' },
  ]);
}

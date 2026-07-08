export interface WidgetSettings {
  widgetColor: string;
  widgetPosition: string;
  welcomeMessage: string;
  agentName: string;
  confidenceThreshold: number;
  launcherImageUrl?: string | null;
  avatarImageUrl?: string | null;
  bubbleShape?: string;
  bubbleSize?: string;
  themeMode?: string;
  headerTitle?: string | null;
  launcherText?: string | null;
  offlineMessage?: string;
  showBranding?: boolean;
  quickReplies?: string[];
}

export interface WidgetMessage {
  id: string;
  role: 'CUSTOMER' | 'AI' | 'AGENT';
  content: string;
  createdAt: string;
}

export interface StartConversationResponse {
  conversationId: string;
  settings: WidgetSettings;
}

export interface WidgetSessionResponse {
  sessionToken: string;
  expiresIn: number;
}

let apiBaseUrl = 'http://localhost:5000';
let sessionToken: string | null = null;

export function setApiBaseUrl(url: string): void {
  apiBaseUrl = url.replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

export function getWidgetSessionToken(): string | null {
  return sessionToken;
}

export function displayHeaderTitle(settings: WidgetSettings): string {
  return settings.headerTitle?.trim() || settings.agentName;
}

async function parseError(res: Response): Promise<never> {
  let message = 'Widget unavailable';
  try {
    const data = (await res.json()) as { error?: string };
    if (data.error) message = data.error;
  } catch {
    // ignore
  }
  throw new Error(message);
}

export async function createWidgetSession(widgetKey: string): Promise<WidgetSessionResponse> {
  const res = await fetch(`${apiBaseUrl}/api/widget/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ widgetKey }),
  });

  if (!res.ok) {
    await parseError(res);
  }

  const data = (await res.json()) as WidgetSessionResponse;
  sessionToken = data.sessionToken;
  return data;
}

export async function startConversation(
  widgetKey: string,
  customer?: { customerName?: string; customerEmail?: string }
): Promise<StartConversationResponse> {
  if (!sessionToken) {
    await createWidgetSession(widgetKey);
  }

  const res = await fetch(`${apiBaseUrl}/api/widget/conversation/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(customer ?? {}),
  });

  if (res.status === 401) {
    sessionToken = null;
    await createWidgetSession(widgetKey);
    return startConversation(widgetKey, customer);
  }

  if (!res.ok) {
    await parseError(res);
  }

  return res.json();
}

export async function rateConversation(
  conversationId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  if (!sessionToken) {
    throw new Error('Widget session required');
  }

  const res = await fetch(`${apiBaseUrl}/api/widget/conversation/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ conversationId, rating, feedback }),
  });

  if (!res.ok) {
    await parseError(res);
  }
}

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

let apiBaseUrl = 'http://localhost:5000';

export function setApiBaseUrl(url: string): void {
  apiBaseUrl = url.replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

export function displayHeaderTitle(settings: WidgetSettings): string {
  return settings.headerTitle?.trim() || settings.agentName;
}

export async function startConversation(
  widgetKey: string,
  customer?: { customerName?: string; customerEmail?: string }
): Promise<StartConversationResponse> {
  const res = await fetch(`${apiBaseUrl}/api/widget/conversation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ widgetKey, ...customer }),
  });

  if (!res.ok) {
    throw new Error('Failed to start conversation');
  }

  return res.json();
}

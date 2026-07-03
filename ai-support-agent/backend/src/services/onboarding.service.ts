export const DEFAULT_WIDGET_SETTINGS = {
  widgetColor: '#1a56db',
  widgetPosition: 'bottom-right',
  welcomeMessage: 'Hi! How can I help you today?',
  agentName: 'Support Assistant',
  confidenceThreshold: 0.7,
  launcherImageUrl: null as string | null,
  avatarImageUrl: null as string | null,
  bubbleShape: 'round',
  bubbleSize: 'medium',
  themeMode: 'light',
  headerTitle: null as string | null,
  launcherText: null as string | null,
  offlineMessage: "We're offline right now, but leave a message!",
  showBranding: true,
  quickReplies: [] as string[],
} as const;

export function isSettingsCustomized(settings: {
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
}): boolean {
  const d = DEFAULT_WIDGET_SETTINGS;
  return (
    settings.widgetColor !== d.widgetColor ||
    settings.widgetPosition !== d.widgetPosition ||
    settings.welcomeMessage !== d.welcomeMessage ||
    settings.agentName !== d.agentName ||
    settings.confidenceThreshold !== d.confidenceThreshold ||
    Boolean(settings.launcherImageUrl) ||
    Boolean(settings.avatarImageUrl) ||
    (settings.bubbleShape ?? d.bubbleShape) !== d.bubbleShape ||
    (settings.bubbleSize ?? d.bubbleSize) !== d.bubbleSize ||
    (settings.themeMode ?? d.themeMode) !== d.themeMode ||
    Boolean(settings.headerTitle) ||
    Boolean(settings.launcherText) ||
    (settings.offlineMessage ?? d.offlineMessage) !== d.offlineMessage ||
    settings.showBranding === false ||
    (settings.quickReplies?.length ?? 0) > 0
  );
}

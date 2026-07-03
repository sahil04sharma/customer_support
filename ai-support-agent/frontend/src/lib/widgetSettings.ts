export interface WidgetSettingsForm {
  widgetColor: string;
  widgetPosition: string;
  welcomeMessage: string;
  agentName: string;
  confidenceThreshold: number;
  launcherImageUrl: string | null;
  avatarImageUrl: string | null;
  bubbleShape: string;
  bubbleSize: string;
  themeMode: string;
  headerTitle: string | null;
  launcherText: string | null;
  offlineMessage: string;
  showBranding: boolean;
  quickReplies: string[];
}

export const DEFAULT_WIDGET_SETTINGS: WidgetSettingsForm = {
  widgetColor: '#1a56db',
  widgetPosition: 'bottom-right',
  welcomeMessage: 'Hi! How can I help you today?',
  agentName: 'Support Assistant',
  confidenceThreshold: 0.7,
  launcherImageUrl: null,
  avatarImageUrl: null,
  bubbleShape: 'round',
  bubbleSize: 'medium',
  themeMode: 'light',
  headerTitle: null,
  launcherText: null,
  offlineMessage: "We're offline right now, but leave a message!",
  showBranding: true,
  quickReplies: [],
};

export interface ThemePreset {
  id: string;
  label: string;
  description: string;
  values: Partial<WidgetSettingsForm>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'minimal-light',
    label: 'Minimal light',
    description: 'Clean and bright',
    values: {
      themeMode: 'light',
      bubbleShape: 'round',
      bubbleSize: 'medium',
      widgetColor: '#1a56db',
    },
  },
  {
    id: 'bold-dark',
    label: 'Bold dark',
    description: 'High contrast dark chat',
    values: {
      themeMode: 'dark',
      bubbleShape: 'rounded',
      bubbleSize: 'large',
      widgetColor: '#6366f1',
    },
  },
  {
    id: 'rounded-brand',
    label: 'Rounded brand',
    description: 'Friendly squircle style',
    values: {
      themeMode: 'light',
      bubbleShape: 'rounded',
      bubbleSize: 'medium',
      widgetColor: '#059669',
    },
  },
];

export function normalizeSettings(raw: Record<string, unknown>): WidgetSettingsForm {
  return {
    widgetColor: String(raw.widgetColor ?? DEFAULT_WIDGET_SETTINGS.widgetColor),
    widgetPosition: String(raw.widgetPosition ?? DEFAULT_WIDGET_SETTINGS.widgetPosition),
    welcomeMessage: String(raw.welcomeMessage ?? DEFAULT_WIDGET_SETTINGS.welcomeMessage),
    agentName: String(raw.agentName ?? DEFAULT_WIDGET_SETTINGS.agentName),
    confidenceThreshold: Number(raw.confidenceThreshold ?? DEFAULT_WIDGET_SETTINGS.confidenceThreshold),
    launcherImageUrl: (raw.launcherImageUrl as string | null) ?? null,
    avatarImageUrl: (raw.avatarImageUrl as string | null) ?? null,
    bubbleShape: String(raw.bubbleShape ?? DEFAULT_WIDGET_SETTINGS.bubbleShape),
    bubbleSize: String(raw.bubbleSize ?? DEFAULT_WIDGET_SETTINGS.bubbleSize),
    themeMode: String(raw.themeMode ?? DEFAULT_WIDGET_SETTINGS.themeMode),
    headerTitle: (raw.headerTitle as string | null) ?? null,
    launcherText: (raw.launcherText as string | null) ?? null,
    offlineMessage: String(raw.offlineMessage ?? DEFAULT_WIDGET_SETTINGS.offlineMessage),
    showBranding: raw.showBranding !== false,
    quickReplies: Array.isArray(raw.quickReplies) ? (raw.quickReplies as string[]) : [],
  };
}

export function toSettingsPayload(settings: WidgetSettingsForm): WidgetSettingsForm {
  return { ...settings };
}

export function displayHeaderTitle(settings: WidgetSettingsForm): string {
  return settings.headerTitle?.trim() || settings.agentName;
}

const bubbleSizePx: Record<string, number> = {
  small: 48,
  medium: 56,
  large: 64,
};

const bubbleRadius: Record<string, string> = {
  round: '9999px',
  rounded: '16px',
  square: '8px',
};

export function bubbleStyle(settings: WidgetSettingsForm): Record<string, string | number> {
  const size = bubbleSizePx[settings.bubbleSize] ?? 56;
  return {
    width: size,
    height: size,
    borderRadius: bubbleRadius[settings.bubbleShape] ?? '9999px',
    backgroundColor: settings.widgetColor,
  };
}

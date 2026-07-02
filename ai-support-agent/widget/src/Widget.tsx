import { useState } from 'react';
import ChatWindow from './ChatWindow';
import { startConversation, type WidgetSettings } from './lib/api';

interface WidgetProps {
  widgetKey: string;
}

const defaultSettings: WidgetSettings = {
  widgetColor: '#1a56db',
  widgetPosition: 'bottom-right',
  welcomeMessage: 'Hi! How can I help you today?',
  agentName: 'Support Assistant',
  confidenceThreshold: 0.7,
};

export default function Widget({ widgetKey }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<WidgetSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);

  const positionClass =
    settings.widgetPosition === 'bottom-left' ? 'position-left' : 'position-right';

  async function handleOpen() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    if (!conversationId) {
      setLoading(true);
      try {
        const data = await startConversation(widgetKey);
        setConversationId(data.conversationId);
        if (data.settings) {
          setSettings(data.settings);
        }
        setWelcomeShown(true);
      } catch (err) {
        console.error('[widget] Failed to start conversation:', err);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <>
      {conversationId && !loading && (
        <ChatWindow
          settings={settings}
          conversationId={conversationId}
          welcomeShown={welcomeShown}
          visible={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}

      <button
        className={`widget-bubble ${positionClass}`}
        style={{ backgroundColor: settings.widgetColor }}
        onClick={handleOpen}
        aria-label="Open chat"
      >
        {loading ? '…' : isOpen ? '×' : '💬'}
      </button>
    </>
  );
}

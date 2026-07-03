import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { WidgetMessage, WidgetSettings } from './lib/api';
import { displayHeaderTitle } from './lib/api';
import { sendCustomerMessage, useWidgetSocket } from './hooks/useWidgetSocket';
import './widget.css';

interface ChatWindowProps {
  settings: WidgetSettings;
  conversationId: string;
  welcomeShown: boolean;
  visible: boolean;
  onClose: () => void;
}

interface DisplayMessage {
  id: string;
  role: 'CUSTOMER' | 'AI' | 'AGENT' | 'SYSTEM';
  content: string;
}

export default function ChatWindow({
  settings,
  conversationId,
  welcomeShown,
  visible,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [quickRepliesVisible, setQuickRepliesVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const positionClass = settings.widgetPosition === 'bottom-left' ? 'position-left' : 'position-right';
  const isDark = settings.themeMode === 'dark';
  const headerTitle = displayHeaderTitle(settings);
  const quickReplies = settings.quickReplies ?? [];

  useEffect(() => {
    if (welcomeShown && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'AI',
          content: settings.welcomeMessage,
        },
      ]);
    }
  }, [welcomeShown, settings.welcomeMessage, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const onHistory = useCallback((history: WidgetMessage[]) => {
    if (history.length > 0) {
      setMessages(
        history.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))
      );
      setQuickRepliesVisible(false);
    }
  }, []);

  const onAiTyping = useCallback(() => setIsTyping(true), []);

  const onAiResponse = useCallback((message: WidgetMessage) => {
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: message.id, role: 'AI', content: message.content },
    ]);
  }, []);

  const onEscalated = useCallback(() => {
    setEscalated(true);
    if (settings.offlineMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: `offline-${Date.now()}`,
          role: 'SYSTEM',
          content: settings.offlineMessage!,
        },
      ]);
    }
  }, [settings.offlineMessage]);

  const onAgentJoined = useCallback((agentName: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `agent-joined-${Date.now()}`,
        role: 'SYSTEM',
        content: `${agentName} has joined the chat.`,
      },
    ]);
  }, []);

  const onAgentResponse = useCallback((message: WidgetMessage) => {
    setMessages((prev) => [
      ...prev,
      { id: message.id, role: 'AGENT', content: message.content },
    ]);
  }, []);

  const onResolved = useCallback(() => {
    setResolved(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `resolved-${Date.now()}`,
        role: 'SYSTEM',
        content: 'This conversation has been resolved. Thank you!',
      },
    ]);
  }, []);

  const onQueueUpdate = useCallback((content: string) => {
    setIsTyping(false);
    setEscalated(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `queue-${Date.now()}`,
        role: 'SYSTEM',
        content,
      },
    ]);
  }, []);

  const onAiError = useCallback((content: string) => {
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `error-${Date.now()}`,
        role: 'SYSTEM',
        content,
      },
    ]);
  }, []);

  useWidgetSocket({
    conversationId,
    onHistory,
    onAiTyping,
    onAiResponse,
    onEscalated,
    onAgentJoined,
    onAgentResponse,
    onResolved,
    onQueueUpdate,
    onAiError,
  });

  function sendMessage(text: string) {
    if (!text.trim() || resolved) return;

    setQuickRepliesVisible(false);
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: 'CUSTOMER', content: text },
    ]);
    setInput('');
    sendCustomerMessage(conversationId, text);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input.trim());
  }

  function handleQuickReply(text: string) {
    sendMessage(text);
  }

  const showQuickReplies =
    quickRepliesVisible &&
    quickReplies.length > 0 &&
    !resolved &&
    !messages.some((m) => m.role === 'CUSTOMER');

  return (
    <div
      className={`widget-chat-window ${positionClass}${visible ? '' : ' widget-chat-hidden'}${isDark ? ' theme-dark' : ''}`}
    >
      <div className="widget-chat-header" style={{ backgroundColor: settings.widgetColor }}>
        <div className="widget-chat-header-title">
          {settings.avatarImageUrl ? (
            <img src={settings.avatarImageUrl} alt="" className="widget-chat-avatar" />
          ) : (
            <span className="widget-chat-avatar-fallback">{headerTitle[0]?.toUpperCase()}</span>
          )}
          <span>{headerTitle}</span>
        </div>
        <button className="widget-chat-close" onClick={onClose} aria-label="Close chat">
          ×
        </button>
      </div>

      <div className="widget-chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`widget-chat-message ${msg.role.toLowerCase()}`}
            style={
              msg.role === 'CUSTOMER'
                ? { backgroundColor: settings.widgetColor }
                : undefined
            }
          >
            {msg.content}
          </div>
        ))}
        {showQuickReplies && (
          <div className="widget-quick-replies">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                className="widget-quick-reply-chip"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        {isTyping && !escalated && (
          <div className="widget-chat-typing">{settings.agentName} is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="widget-chat-input-area" onSubmit={handleSubmit}>
        <input
          className="widget-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={resolved ? 'Conversation ended' : 'Type a message...'}
          disabled={resolved}
        />
        <button
          type="submit"
          className="widget-chat-send"
          style={{ backgroundColor: settings.widgetColor }}
          disabled={resolved || !input.trim()}
        >
          Send
        </button>
      </form>

      {settings.showBranding !== false && (
        <p className="widget-branding">Powered by SupportDesk</p>
      )}
    </div>
  );
}

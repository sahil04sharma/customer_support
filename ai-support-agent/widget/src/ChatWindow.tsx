import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { WidgetMessage, WidgetSettings } from './lib/api';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const positionClass = settings.widgetPosition === 'bottom-left' ? 'position-left' : 'position-right';

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
  }, []);

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || resolved) return;

    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: 'CUSTOMER', content: text },
    ]);
    setInput('');
    sendCustomerMessage(conversationId, text);
  }

  return (
    <div className={`widget-chat-window ${positionClass}${visible ? '' : ' widget-chat-hidden'}`}>
      <div className="widget-chat-header" style={{ backgroundColor: settings.widgetColor }}>
        <span>{settings.agentName}</span>
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
    </div>
  );
}

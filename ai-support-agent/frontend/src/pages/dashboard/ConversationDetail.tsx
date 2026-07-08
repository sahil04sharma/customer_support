import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Send,
} from 'lucide-react';
import ChatThread, { type ChatMessage } from '../../components/chat/ChatThread';
import Badge from '../../components/ui/Badge';
import CannedResponsePicker from '../../components/CannedResponsePicker';
import { api } from '../../lib/api';
import { useSocket } from '../../hooks/useSocket';

interface ConversationDetailData {
  id: string;
  status: string;
  handedOff: boolean;
  customerName: string | null;
  customerEmail: string | null;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  messages: ChatMessage[];
}

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const { emit, on } = useSocket();
  const [conversation, setConversation] = useState<ConversationDetailData | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = useCallback(() => {
    if (!id) return;
    api.get(`/api/conversations/${id}`).then((res) => setConversation(res.data));
  }, [id]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    if (!id) return;

    emit('join_conversation', { conversationId: id });

    const appendMessage = (msg: ChatMessage) => {
      setConversation((prev) => {
        if (!prev || prev.id !== id) return prev;
        if (prev.messages.some((m) => m.id === msg.id)) return prev;
        return { ...prev, messages: [...prev.messages, msg] };
      });
    };

    const unsubCustomer = on('customer_message', (data: unknown) => {
      const { conversationId, content } = data as { conversationId: string; content: string };
      if (conversationId !== id) return;
      appendMessage({
        id: `live-customer-${Date.now()}`,
        role: 'CUSTOMER',
        content,
        confidence: null,
        createdAt: new Date().toISOString(),
      });
    });

    const unsubAgent = on('agent_response', (data: unknown) => {
      const { conversationId, message } = data as {
        conversationId: string;
        message: ChatMessage;
      };
      if (conversationId !== id) return;
      appendMessage(message);
    });

    const unsubAi = on('ai_response', (data: unknown) => {
      const { conversationId, message } = data as {
        conversationId: string;
        message: ChatMessage;
      };
      if (conversationId !== id) return;
      appendMessage(message);
    });

    return () => {
      unsubCustomer?.();
      unsubAgent?.();
      unsubAi?.();
    };
  }, [id, emit, on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  async function sendReply() {
    if (!id || !input.trim() || sending) return;

    setSending(true);
    try {
      const { data } = await api.post(`/api/conversations/${id}/reply`, {
        content: input.trim(),
      });
      setConversation((prev) => {
        if (!prev) return prev;
        if (prev.messages.some((m) => m.id === data.id)) return prev;
        return {
          ...prev,
          handedOff: true,
          status: prev.status === 'OPEN' ? 'ESCALATED' : prev.status,
          messages: [...prev.messages, data],
        };
      });
      setInput('');
    } finally {
      setSending(false);
    }
  }

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    await sendReply();
  }

  async function handleExport() {
    if (!id) return;
    const res = await api.get(`/api/conversations/${id}/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-accent-600" />
      </div>
    );
  }

  const canReply = conversation.status !== 'RESOLVED';
  const displayName = conversation.customerName ?? 'Anonymous visitor';
  const initials = displayName[0]?.toUpperCase() ?? '?';

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <Link
        to="/dashboard/conversations"
        className="mb-3 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-200 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-200 text-xs font-medium text-ink-600">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-medium text-ink-900">{displayName}</h1>
              <p className="truncate text-xs text-ink-500">
                {conversation.customerEmail ?? `#${conversation.id.slice(0, 8)}`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {conversation.rating != null && (
              <span className="text-xs text-ink-500">★ {conversation.rating}/5</span>
            )}
            <button type="button" onClick={handleExport} className="btn-ghost px-2 py-1 text-xs">
              <Download className="h-3.5 w-3.5" />
            </button>
            <Badge variant={conversation.status === 'RESOLVED' ? 'success' : conversation.status === 'ESCALATED' ? 'warning' : 'info'}>
              {conversation.status}
            </Badge>
          </div>
        </div>

        {conversation.feedback && (
          <div className="shrink-0 border-b border-ink-100 bg-ink-50 px-4 py-2 text-xs text-ink-600">
            Feedback: {conversation.feedback}
          </div>
        )}

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ChatThread messages={conversation.messages} endRef={messagesEndRef} />
        </div>

        {/* Composer */}
        {canReply ? (
          <form onSubmit={handleReply} className="chat-composer">
            <div className="mb-2">
              <CannedResponsePicker
                onInsert={(content) => setInput((prev) => (prev ? `${prev}\n${content}` : content))}
                className="input-field max-w-xs text-xs"
              />
            </div>
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendReply();
                  }
                }}
                rows={2}
                className="input-field flex-1 resize-none"
                placeholder="Reply to customer…"
                disabled={sending}
              />
              <button type="submit" className="btn-primary self-end px-3" disabled={sending || !input.trim()}>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="chat-composer text-center text-xs text-ink-500">
            Conversation resolved.
          </div>
        )}
      </div>
    </div>
  );
}

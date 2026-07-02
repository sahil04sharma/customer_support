import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, Headphones, Send, User } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { useSocket } from '../../hooks/useSocket';

interface Message {
  id: string;
  role: string;
  content: string;
  confidence: number | null;
  createdAt: string;
}

interface ConversationDetailData {
  id: string;
  status: string;
  handedOff: boolean;
  messages: Message[];
}

const roleConfig: Record<string, { label: string; icon: typeof User; bubble: string; align: string }> = {
  CUSTOMER: { label: 'Customer', icon: User, bubble: 'bg-zinc-900 text-white', align: 'mr-auto max-w-[80%]' },
  AI: { label: 'AI Assistant', icon: Bot, bubble: 'bg-zinc-100 text-zinc-900', align: 'ml-auto max-w-[80%]' },
  AGENT: { label: 'You (Support)', icon: Headphones, bubble: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100', align: 'ml-auto max-w-[80%]' },
};

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

    const appendMessage = (msg: Message) => {
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
        message: Message;
      };
      if (conversationId !== id) return;
      appendMessage(message);
    });

    const unsubAi = on('ai_response', (data: unknown) => {
      const { conversationId, message } = data as {
        conversationId: string;
        message: Message;
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

  async function handleReply(e: FormEvent) {
    e.preventDefault();
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

  if (!conversation) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  const canReply = conversation.status !== 'RESOLVED';

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="shrink-0">
        <Link
          to="/dashboard/conversations"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to conversations
        </Link>

        <PageHeader
          title="Conversation"
          description={
            canReply
              ? 'Reply below — your message is sent live to the customer in the widget.'
              : `Status: ${conversation.status}`
          }
          action={
            <Badge variant={conversation.status === 'RESOLVED' ? 'success' : 'info'}>
              {conversation.status}
            </Badge>
          }
        />
      </div>

      <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {conversation.messages.map((msg) => {
              const config = roleConfig[msg.role] ?? roleConfig.AI;
              const Icon = config.icon;
              const isCustomer = msg.role === 'CUSTOMER';

              return (
                <div key={msg.id} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                  <div className={`mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500 ${isCustomer ? '' : 'flex-row-reverse'}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                    <span className="text-zinc-300">·</span>
                    <span className="font-normal">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${config.bubble} ${config.align}`}>
                    {msg.content}
                  </div>
                  {msg.confidence != null && (
                    <p className="mt-1 text-xs text-zinc-400">
                      AI confidence: {(msg.confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {canReply && (
          <form onSubmit={handleReply} className="border-t border-zinc-100 bg-zinc-50/80 p-4">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input-field flex-1"
                placeholder="Type your reply to the customer…"
                disabled={sending}
              />
              <button type="submit" className="btn-primary gap-2 px-5" disabled={sending || !input.trim()}>
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Tip: open the widget test page in another tab to see replies appear live.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

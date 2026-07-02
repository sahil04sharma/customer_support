import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Headphones,
  LogOut,
  MessageSquare,
  Send,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import Badge from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Escalation {
  conversationId: string;
}

export default function AgentDashboard() {
  const { user, setAuth, logout, accessToken } = useAuth();
  const { emit, on, connected } = useSocket();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [escalations, setEscalations] = useState<string[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'AGENT') return;

    const unsubEscalation = on('new_escalation', (data: unknown) => {
      const { conversationId } = data as Escalation;
      setEscalations((prev) =>
        prev.includes(conversationId) ? prev : [...prev, conversationId]
      );
    });

    const unsubResponse = on('customer_message', (data: unknown) => {
      const { conversationId, content } = data as { conversationId: string; content: string };
      if (conversationId === activeConversation) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'CUSTOMER',
            content,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    });

    return () => {
      unsubEscalation?.();
      unsubResponse?.();
    };
  }, [user, on, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const { data } = await api.post('/api/auth/agent/login', { email, password });
    setAuth(data.accessToken, data.refreshToken, {
      id: data.agent.id,
      name: data.agent.name,
      email: data.agent.email,
      role: 'AGENT',
      businessId: data.agent.businessId,
    });
  }

  function toggleOnline() {
    if (!user) return;
    if (!isOnline) {
      emit('agent_online', { agentId: user.id, businessId: user.businessId });
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }
  }

  async function acceptConversation(conversationId: string) {
    if (!user) return;
    emit('accept_conversation', { conversationId, agentId: user.id });
    setActiveConversation(conversationId);
    setEscalations((prev) => prev.filter((id) => id !== conversationId));
    const { data } = await api.get(`/api/agent/conversations/${conversationId}`);
    setMessages(data.messages);
  }

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!activeConversation || !input.trim()) return;
    emit('agent_message', { conversationId: activeConversation, content: input });
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'AGENT',
        content: input,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput('');
  }

  function resolveConversation() {
    if (!activeConversation) return;
    emit('resolve_conversation', { conversationId: activeConversation });
    setActiveConversation(null);
    setMessages([]);
  }

  if (!accessToken || !user || user.role !== 'AGENT') {
    return (
      <AuthLayout title="Agent portal" subtitle="Sign in to handle escalated customer chats">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">Sign in</button>
          <p className="text-center text-sm text-zinc-500">
            <Link to="/login" className="font-medium text-zinc-900 hover:underline">
              Business dashboard
            </Link>
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="flex w-80 flex-col border-r border-zinc-200/80 bg-white">
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-200/80 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <Headphones className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Agent portal</p>
            <p className="text-xs text-zinc-500">{user.name}</p>
          </div>
        </div>

        <div className="border-b border-zinc-200/80 p-4">
          <button
            onClick={toggleOnline}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isOnline
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Circle className={`h-2 w-2 fill-current ${isOnline ? 'text-emerald-200' : 'text-zinc-400'}`} />
            {isOnline ? 'You are online' : 'Go online'}
            {!connected && <span className="text-xs opacity-70">(connecting…)</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Escalations ({escalations.length})
          </p>
          {escalations.length === 0 ? (
            <p className="rounded-lg bg-zinc-50 px-3 py-4 text-center text-sm text-zinc-500">
              No pending escalations
            </p>
          ) : (
            <div className="space-y-1">
              {escalations.map((id) => (
                <button
                  key={id}
                  onClick={() => acceptConversation(id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-100"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="truncate font-medium text-zinc-700">
                    Chat #{id.slice(0, 8)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200/80 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        {activeConversation ? (
          <>
            <div className="flex items-center justify-between border-b border-zinc-200/80 bg-white px-6 py-4">
              <div>
                <p className="font-medium text-zinc-900">Active conversation</p>
                <p className="text-xs text-zinc-500">#{activeConversation.slice(0, 8)}</p>
              </div>
              <button onClick={resolveConversation} className="btn-secondary gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Resolve
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-zinc-50 p-6">
              <div className="mx-auto max-w-2xl space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'AGENT' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'AGENT'
                          ? 'bg-zinc-900 text-white'
                          : 'bg-white text-zinc-900 shadow-card ring-1 ring-zinc-200/80'
                      }`}
                    >
                      <p className="mb-1 text-xs font-medium opacity-60">{msg.role}</p>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form onSubmit={sendMessage} className="border-t border-zinc-200/80 bg-white p-4">
              <div className="mx-auto flex max-w-2xl gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Type your reply…"
                />
                <button type="submit" className="btn-primary gap-2 px-5">
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
              <MessageSquare className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="font-medium text-zinc-900">No active conversation</p>
            <p className="mt-1 max-w-xs text-sm text-zinc-500">
              Go online and accept an escalation from the queue to start chatting.
            </p>
            {!isOnline && (
              <Badge variant="warning">You&apos;re offline — turn on availability to receive chats</Badge>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

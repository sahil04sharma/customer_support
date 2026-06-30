import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">Agent Login</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-6"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">
            Log in
          </button>
          <p className="text-sm text-slate-500 mt-4 text-center">
            <Link to="/login" className="text-blue-600">Business login</Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-white border-r p-6">
        <h1 className="text-lg font-bold mb-1">Agent Dashboard</h1>
        <p className="text-sm text-slate-500 mb-6">{user.name}</p>
        <button
          onClick={toggleOnline}
          className={`w-full py-2 rounded-lg text-sm font-medium mb-6 ${
            isOnline ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {isOnline ? 'Online' : 'Go Online'} {connected ? '' : '(connecting...)'}
        </button>
        <h3 className="text-sm font-medium text-slate-500 mb-2">Escalations</h3>
        {escalations.length === 0 && (
          <p className="text-sm text-slate-400">No pending escalations</p>
        )}
        {escalations.map((id) => (
          <button
            key={id}
            onClick={() => acceptConversation(id)}
            className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm mb-1"
          >
            Conversation {id.slice(0, 8)}...
          </button>
        ))}
        <button onClick={logout} className="mt-8 text-sm text-red-600">
          Log out
        </button>
      </aside>
      <main className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-lg ${
                    msg.role === 'AGENT' ? 'bg-green-50 ml-auto' : 'bg-blue-50'
                  }`}
                >
                  <p className="text-xs text-slate-500 mb-1">{msg.role}</p>
                  <p>{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Type a message..."
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Send
              </button>
              <button
                type="button"
                onClick={resolveConversation}
                className="px-4 py-2 bg-slate-200 rounded-lg"
              >
                Resolve
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select an escalation to start chatting
          </div>
        )}
      </main>
    </div>
  );
}

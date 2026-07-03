import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { api } from '../../lib/api';

interface Agent {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
  createdAt: string;
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);

  function fetchAgents() {
    api.get('/api/business/agents').then((res) => setAgents(res.data));
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    await api.post('/api/business/agents/invite', { name, email, password });
    setName('');
    setEmail('');
    setPassword('');
    setShowForm(false);
    fetchAgents();
  }

  async function handleDelete(id: string) {
    await api.delete(`/api/business/agents/${id}`);
    fetchAgents();
  }

  return (
    <div>
      <PageHeader
        title="Support team"
        description="Invite team members who handle conversations when the AI escalates to a human."
        action={
          !showForm ? (
            <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
              <UserPlus className="h-4 w-4" />
              Invite agent
            </button>
          ) : undefined
        }
      />

      {showForm && (
        <form onSubmit={handleInvite} className="card mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900">Invite a support agent</h3>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost p-1.5">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-5 text-sm text-zinc-500">
            They&apos;ll log in at the agent portal to accept escalated chats from customers.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Jane Smith"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="jane@company.com"
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
                placeholder="Min. 8 characters"
                minLength={8}
                required
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" className="btn-primary">Send invite</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {agents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No agents yet"
          description="Invite team members to handle customer chats when the AI can't answer confidently."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
                <UserPlus className="h-4 w-4" />
                Invite your first agent
              </button>
              <Link to="/dashboard/getting-started" className="btn-secondary text-sm">
                Setup guide
              </Link>
            </div>
          }
        />
      ) : (
        <div className="card divide-y divide-zinc-100 overflow-hidden">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600">
                  {agent.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-zinc-900">{agent.name}</p>
                  <p className="text-sm text-zinc-500">{agent.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={agent.isOnline ? 'success' : 'neutral'}>
                  {agent.isOnline ? 'Online' : 'Offline'}
                </Badge>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="text-sm font-medium text-zinc-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { FormEvent, useEffect, useState } from 'react';
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Support Agents</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Invite Agent
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleInvite} className="bg-white p-6 rounded-xl border mb-6 space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            minLength={8}
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Send Invite
          </button>
        </form>
      )}
      <div className="bg-white rounded-xl border divide-y">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm text-slate-500">{agent.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  agent.isOnline ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {agent.isOnline ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={() => handleDelete(agent.id)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { adminApi } from '../../lib/adminApi';

interface BusinessRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  agentCount: number;
  documentCount: number;
  conversationCount: number;
  totalTokens: number;
  estimatedCost: number;
  createdAt: string;
  lastActivity: string;
}

export default function AdminBusinesses() {
  const [items, setItems] = useState<BusinessRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .get('/api/admin/businesses', { params: { search: search || undefined, limit: 50 } })
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <PageHeader title="Businesses" description="All tenants on the platform" variant="dark" />

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input-field border-zinc-700 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-center text-zinc-400">
          No businesses found
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Agents</th>
                <th className="px-5 py-3">Docs</th>
                <th className="px-5 py-3">Chats</th>
                <th className="px-5 py-3">Tokens</th>
                <th className="px-5 py-3">Est. cost</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-800/50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{b.name}</p>
                    <p className="text-xs text-zinc-500">{b.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={b.plan === 'PRO' ? 'success' : 'neutral'}>{b.plan}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={b.status === 'ACTIVE' ? 'success' : 'error'}>{b.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-zinc-300">{b.agentCount}</td>
                  <td className="px-5 py-4 text-zinc-300">{b.documentCount}</td>
                  <td className="px-5 py-4 text-zinc-300">{b.conversationCount}</td>
                  <td className="px-5 py-4 text-zinc-300">{b.totalTokens.toLocaleString()}</td>
                  <td className="px-5 py-4 text-zinc-300">${b.estimatedCost.toFixed(4)}</td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/admin/businesses/${b.id}`}
                      className="inline-flex items-center text-violet-400 hover:text-violet-300"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

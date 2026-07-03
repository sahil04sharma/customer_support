import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { adminApi } from '../../lib/adminApi';

interface BusinessDetail {
  business: {
    id: string;
    name: string;
    email: string;
    plan: string;
    status: string;
    createdAt: string;
    agents: { id: string; name: string; email: string; isOnline: boolean }[];
    counts: { agents: number; documents: number; conversations: number };
  };
  usage: { totalTokens: number; estimatedCost: number; eventCount: number };
  usageByDay: { day: string; tokens: number; cost: number }[];
}

export default function AdminBusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BusinessDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  function fetchDetail() {
    if (!id) return;
    adminApi.get(`/api/admin/businesses/${id}`).then((res) => setData(res.data));
  }

  useEffect(() => {
    fetchDetail();
  }, [id]);

  async function changePlan(plan: 'FREE' | 'PRO') {
    if (!id || !confirm(`Change plan to ${plan}?`)) return;
    setActionLoading(true);
    try {
      await adminApi.patch(`/api/admin/businesses/${id}/plan`, { plan });
      fetchDetail();
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleStatus() {
    if (!id || !data) return;
    const next = data.business.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`${next === 'SUSPENDED' ? 'Suspend' : 'Reactivate'} this business?`)) return;
    setActionLoading(true);
    try {
      await adminApi.patch(`/api/admin/businesses/${id}/status`, { status: next });
      fetchDetail();
    } finally {
      setActionLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
      </div>
    );
  }

  const { business, usage, usageByDay } = data;
  const chartData = usageByDay.map((d) => ({
    day: new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    tokens: d.tokens,
    cost: d.cost,
  }));

  return (
    <div>
      <Link
        to="/admin/businesses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to businesses
      </Link>

      <PageHeader
        title={business.name}
        description={business.email}
        variant="dark"
        action={
          <div className="flex items-center gap-2">
            <Badge variant={business.plan === 'PRO' ? 'success' : 'neutral'}>{business.plan}</Badge>
            <Badge variant={business.status === 'ACTIVE' ? 'success' : 'error'}>
              {business.status}
            </Badge>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => changePlan(business.plan === 'PRO' ? 'FREE' : 'PRO')}
          disabled={actionLoading}
          className="btn-secondary border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
        >
          {business.plan === 'PRO' ? 'Downgrade to FREE' : 'Upgrade to PRO'}
        </button>
        <button
          onClick={toggleStatus}
          disabled={actionLoading}
          className={`btn-secondary border-zinc-700 ${
            business.status === 'ACTIVE'
              ? 'bg-red-950/50 text-red-400 hover:bg-red-950'
              : 'bg-emerald-950/50 text-emerald-400 hover:bg-emerald-950'
          }`}
        >
          {business.status === 'ACTIVE' ? 'Suspend account' : 'Reactivate account'}
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total tokens</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {usage.totalTokens.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Est. cost</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            ${usage.estimatedCost.toFixed(4)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Usage events</p>
          <p className="mt-1 text-2xl font-semibold text-white">{usage.eventCount}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Usage (last 30 days)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#7c3aed" fill="#7c3aed33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Counts</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-400">Agents</dt>
              <dd className="text-white">{business.counts.agents}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-400">Documents</dt>
              <dd className="text-white">{business.counts.documents}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-400">Conversations</dt>
              <dd className="text-white">{business.counts.conversations}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Team</h3>
          {business.agents.length === 0 ? (
            <p className="text-sm text-zinc-500">No agents</p>
          ) : (
            <ul className="space-y-2">
              {business.agents.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{a.name}</span>
                  <Badge variant={a.isOnline ? 'success' : 'neutral'}>
                    {a.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

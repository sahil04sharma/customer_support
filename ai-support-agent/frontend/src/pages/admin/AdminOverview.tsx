import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Building2, Coins, MessageSquare, Users, Zap } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { adminApi } from '../../lib/adminApi';

interface Metrics {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalEstimatedCost: number;
  tokensThisMonth: number;
  costThisMonth: number;
  signups7d: number;
  signups30d: number;
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    adminApi.get('/api/admin/metrics').then((res) => setMetrics(res.data));
  }, []);

  const signupData = metrics
    ? [
        { name: '7 days', count: metrics.signups7d },
        { name: '30 days', count: metrics.signups30d },
      ]
    : [];

  const stats = [
    {
      label: 'Businesses',
      value: metrics?.totalBusinesses ?? '—',
      sub: `${metrics?.activeBusinesses ?? 0} active`,
      icon: Building2,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Conversations',
      value: metrics?.totalConversations ?? '—',
      sub: `${metrics?.totalMessages ?? 0} messages`,
      icon: MessageSquare,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Tokens (month)',
      value: metrics ? metrics.tokensThisMonth.toLocaleString() : '—',
      sub: `${(metrics?.totalTokens ?? 0).toLocaleString()} all time`,
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Est. cost (month)',
      value: metrics ? `$${metrics.costThisMonth.toFixed(4)}` : '—',
      sub: `$${(metrics?.totalEstimatedCost ?? 0).toFixed(4)} all time`,
      icon: Coins,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Platform overview"
        description="Cross-tenant metrics for SupportDesk"
        variant="dark"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{stat.sub}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold text-white">
            <Users className="h-4 w-4 text-violet-400" />
            New signups
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Account health</h3>
          <dl className="space-y-4">
            <div className="flex justify-between border-b border-zinc-800 pb-3">
              <dt className="text-sm text-zinc-400">Active businesses</dt>
              <dd className="font-medium text-emerald-400">{metrics.activeBusinesses}</dd>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-3">
              <dt className="text-sm text-zinc-400">Suspended</dt>
              <dd className="font-medium text-red-400">{metrics.suspendedBusinesses}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-400">Signups (30d)</dt>
              <dd className="font-medium text-white">{metrics.signups30d}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

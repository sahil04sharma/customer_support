import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, Clock, MessageSquareWarning } from 'lucide-react';
import OnboardingChecklist from '../../components/OnboardingChecklist';
import PageHeader from '../../components/ui/PageHeader';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { api } from '../../lib/api';

interface Analytics {
  resolved: number;
  escalated: number;
  avgResponseTimeMs: number;
}

export default function Overview() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const { status, tested, showChecklist, dismiss, refresh } = useOnboardingProgress();

  useEffect(() => {
    api.get('/api/business/analytics').then((res) => setAnalytics(res.data));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const chartData = analytics
    ? [
        { name: 'Resolved', count: analytics.resolved },
        { name: 'Escalated', count: analytics.escalated },
      ]
    : [];

  const hasActivity = analytics && (analytics.resolved > 0 || analytics.escalated > 0);

  const stats = [
    {
      label: 'Resolved',
      value: analytics?.resolved ?? '—',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Escalated to human',
      value: analytics?.escalated ?? '—',
      icon: MessageSquareWarning,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Avg. first response',
      value: analytics ? `${(analytics.avgResponseTimeMs / 1000).toFixed(1)}s` : '—',
      icon: Clock,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Monitor how your AI assistant is handling customer conversations."
      />

      {showChecklist && (
        <div className="mb-8">
          <OnboardingChecklist status={status} tested={tested} onDismiss={dismiss} />
        </div>
      )}

      {!hasActivity && !showChecklist && (
        <div className="mb-8 rounded-xl border border-zinc-200 bg-zinc-50/80 px-5 py-4">
          <p className="text-sm font-medium text-zinc-900">No conversations yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Analytics will appear once customers chat via your widget.{' '}
            <Link to="/dashboard/test" className="font-medium text-zinc-700 underline hover:text-zinc-900">
              Test your assistant
            </Link>{' '}
            or{' '}
            <Link to="/dashboard/embed" className="font-medium text-zinc-700 underline hover:text-zinc-900">
              install the widget
            </Link>{' '}
            to get started.
          </p>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {chartData.length > 0 && hasActivity && (
        <div className="card p-6">
          <h3 className="mb-6 text-sm font-semibold text-zinc-900">Conversation outcomes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Bar dataKey="count" fill="#18181b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

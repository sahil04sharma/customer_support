import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, CheckCircle2, Clock, MessageSquareWarning } from 'lucide-react';
import OnboardingChecklist from '../../components/OnboardingChecklist';
import PlanUsageBanner from '../../components/PlanUsageBanner';
import PageHeader from '../../components/ui/PageHeader';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { api } from '../../lib/api';

interface Analytics {
  resolved: number;
  escalated: number;
  avgResponseTimeMs: number;
  days?: number;
}

const CHART_COLORS = ['#0d9488', '#f59e0b'];

export default function Overview() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const { status, tested, showChecklist, dismiss, refresh } = useOnboardingProgress();

  useEffect(() => {
    api.get('/api/business/analytics', { params: { days: 30 } }).then((res) => setAnalytics(res.data));
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
      iconColor: 'text-accent-600',
    },
    {
      label: 'Escalated',
      value: analytics?.escalated ?? '—',
      icon: MessageSquareWarning,
      iconColor: 'text-amber-600',
    },
    {
      label: 'Avg. response',
      value: analytics ? `${(analytics.avgResponseTimeMs / 1000).toFixed(1)}s` : '—',
      icon: Clock,
      iconColor: 'text-ink-400',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Overview"
        description="How your AI assistant is handling customer conversations."
      />

      <PlanUsageBanner />

      {showChecklist && (
        <div className="mb-8">
          <OnboardingChecklist status={status} tested={tested} onDismiss={dismiss} />
        </div>
      )}

      {!hasActivity && !showChecklist && (
        <div className="card-muted mb-8 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="font-semibold text-ink-900">No conversations yet</p>
            <p className="mt-1 text-sm text-ink-500">
              Analytics appear once customers chat via your widget.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/test" className="btn-secondary gap-1.5 text-sm">
              Test assistant
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/dashboard/embed" className="btn-primary gap-1.5 text-sm">
              Install widget
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-ink-900">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {chartData.length > 0 && hasActivity && (
        <div className="card p-4">
          <p className="mb-4 text-sm font-medium text-ink-900">Conversation outcomes</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={56}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf2" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#7488a5', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#7488a5' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgb(13 148 136 / 0.06)', radius: 8 }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e8ecf2',
                    boxShadow: '0 8px 24px rgb(12 18 34 / 0.08)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

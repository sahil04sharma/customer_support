import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../lib/api';

interface Analytics {
  resolved: number;
  escalated: number;
  avgResponseTimeMs: number;
}

export default function Overview() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get('/api/business/analytics').then((res) => setAnalytics(res.data));
  }, []);

  const chartData = analytics
    ? [
        { name: 'Resolved', count: analytics.resolved },
        { name: 'Escalated', count: analytics.escalated },
      ]
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-3xl font-bold">{analytics?.resolved ?? '—'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-slate-500">Escalated</p>
          <p className="text-3xl font-bold">{analytics?.escalated ?? '—'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-slate-500">Avg Response Time</p>
          <p className="text-3xl font-bold">
            {analytics ? `${(analytics.avgResponseTimeMs / 1000).toFixed(1)}s` : '—'}
          </p>
        </div>
      </div>
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1a56db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

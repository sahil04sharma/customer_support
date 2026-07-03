import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { adminApi } from '../../lib/adminApi';

interface UsageData {
  series: { day: string; tokens: number; cost: number; events: number }[];
  topConsumers: {
    businessId: string;
    totalTokens: number;
    estimatedCost: number;
    business?: { name: string; email: string; plan: string };
  }[];
}

export default function AdminUsage() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    adminApi.get('/api/admin/usage', { params: { range: '30d' } }).then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
      </div>
    );
  }

  const chartData = data.series.map((d) => ({
    day: new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    tokens: d.tokens,
    cost: d.cost,
  }));

  return (
    <div>
      <PageHeader
        title="Usage & cost"
        description="Platform-wide AI consumption (last 30 days)"
        variant="dark"
      />

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Daily tokens</h3>
        <div className="h-64">
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

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Top consumers</h3>
        {data.topConsumers.length === 0 ? (
          <p className="text-sm text-zinc-500">No usage recorded yet</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                <th className="pb-3">Business</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Tokens</th>
                <th className="pb-3">Est. cost</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.topConsumers.map((row) => (
                <tr key={row.businessId}>
                  <td className="py-3">
                    <p className="font-medium text-white">{row.business?.name ?? row.businessId}</p>
                    <p className="text-xs text-zinc-500">{row.business?.email}</p>
                  </td>
                  <td className="py-3">
                    {row.business && (
                      <Badge variant={row.business.plan === 'PRO' ? 'success' : 'neutral'}>
                        {row.business.plan}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 text-zinc-300">{row.totalTokens.toLocaleString()}</td>
                  <td className="py-3 text-zinc-300">${row.estimatedCost.toFixed(4)}</td>
                  <td className="py-3">
                    <Link
                      to={`/admin/businesses/${row.businessId}`}
                      className="text-violet-400 hover:text-violet-300"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

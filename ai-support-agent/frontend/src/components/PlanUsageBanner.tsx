import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Infinity, KeyRound, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

interface PlanUsage {
  plan: 'FREE' | 'PRO';
  aiMessages: { used: number; limit: number };
  documents: { used: number; limit: number };
  agents: { used: number; limit: number };
  isOverLimit: boolean;
  nearLimit: boolean;
  periodEnd: string;
  usingOwnChatKey: boolean;
  usingOwnEmbedKey: boolean;
}

export default function PlanUsageBanner() {
  const [usage, setUsage] = useState<PlanUsage | null>(null);

  useEffect(() => {
    api.get('/api/business/plan-usage').then((res) => setUsage(res.data));
  }, []);

  if (!usage) return null;

  if (usage.usingOwnChatKey) {
    return (
      <div className="usage-banner border-accent-200/70 bg-accent-50/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white">
              <Infinity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Your AI keys are active</p>
              <p className="mt-0.5 text-xs text-ink-500">
                Unlimited chat via your provider
                {usage.usingOwnEmbedKey ? ' · your embeddings' : ' · hosted embeddings'}
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/ai"
            className="btn-secondary gap-1.5 py-1.5 text-xs"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Manage
          </Link>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((usage.aiMessages.used / usage.aiMessages.limit) * 100));
  const resetDate = new Date(usage.periodEnd).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const bannerClass = usage.isOverLimit
    ? 'usage-banner-over'
    : usage.nearLimit
      ? 'usage-banner-warn'
      : 'usage-banner-normal';

  return (
    <div className={`usage-banner ${bannerClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              usage.isOverLimit
                ? 'bg-red-100 text-red-600'
                : usage.nearLimit
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-ink-100 text-ink-600'
            }`}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">
              {usage.plan === 'FREE' ? 'Free plan' : 'Pro plan'}
              <span className="ml-2 font-normal text-ink-400">
                {usage.aiMessages.used}/{usage.aiMessages.limit} AI messages
              </span>
            </p>
            <p className="mt-0.5 text-xs text-ink-500">
              {usage.isOverLimit
                ? 'Monthly limit reached — add your key for unlimited replies'
                : `Resets ${resetDate} · ${usage.documents.used}/${usage.documents.limit} docs · ${usage.agents.used}/${usage.agents.limit} agents`}
            </p>
          </div>
        </div>
        {(usage.isOverLimit || usage.nearLimit) && (
          <Link to="/dashboard/ai" className="btn-primary gap-1.5 py-1.5 text-xs">
            <KeyRound className="h-3.5 w-3.5" />
            Add API key
          </Link>
        )}
      </div>
      <div className="progress-track mt-3">
        <div
          className={`progress-fill ${usage.isOverLimit ? '!bg-red-500' : usage.nearLimit ? '!bg-amber-500' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

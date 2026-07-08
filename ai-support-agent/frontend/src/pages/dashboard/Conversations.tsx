import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ChevronRight, Headphones, MessageSquare, User } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { api } from '../../lib/api';

interface LastMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  status: string;
  customerName: string | null;
  handedOff: boolean;
  rating: number | null;
  updatedAt: string;
  messages: LastMessage[];
  _count: { messages: number };
}

const statusVariant: Record<string, 'success' | 'warning' | 'neutral' | 'info'> = {
  OPEN: 'info',
  RESOLVED: 'success',
  ESCALATED: 'warning',
};

const statusLabel: Record<string, string> = {
  OPEN: 'Open',
  RESOLVED: 'Resolved',
  ESCALATED: 'Escalated',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function previewIcon(role: string) {
  if (role === 'AI') return Bot;
  if (role === 'AGENT') return Headphones;
  return User;
}

function truncate(text: string, max = 72): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max)}…`;
}

interface PaginatedConversations {
  items: Conversation[];
  total: number;
  page: number;
  pageSize: number;
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    api
      .get('/api/conversations', { params: { page: 1, pageSize } })
      .then((res) => {
        const data = res.data as PaginatedConversations;
        setConversations(data.items);
        setTotal(data.total);
        setPage(1);
      })
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const { data } = await api.get<PaginatedConversations>('/api/conversations', {
        params: { page: nextPage, pageSize },
      });
      setConversations((prev) => [...prev, ...data.items]);
      setPage(nextPage);
      setTotal(data.total);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Conversations"
        description="Chats between customers and your AI or support team."
      />

      {loading ? (
        <div className="card flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-accent-600" />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Conversations appear here once customers start chatting via your embedded widget."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/dashboard/embed" className="btn-primary">
                Install the widget
              </Link>
              <Link to="/dashboard/test" className="btn-secondary">
                Test your assistant
              </Link>
            </div>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-ink-100">
            {conversations.map((conv) => {
              const last = conv.messages[0];
              const PreviewIcon = last ? previewIcon(last.role) : MessageSquare;
              const displayName = conv.customerName ?? 'Anonymous visitor';

              return (
                <Link
                  key={conv.id}
                  to={`/dashboard/conversations/${conv.id}`}
                  className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ink-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-200 text-xs font-medium text-ink-600">
                    {displayName[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">
                          {displayName}
                        </p>
                        {last ? (
                          <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-500">
                            <PreviewIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                            <span className="line-clamp-2 leading-snug">{truncate(last.content)}</span>
                          </p>
                        ) : (
                          <p className="mt-1 text-sm italic text-ink-400">No messages</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-ink-400">
                          {relativeTime(conv.updatedAt)}
                        </p>
                        <div className="mt-2 flex flex-col items-end gap-1.5">
                          <Badge variant={statusVariant[conv.status] ?? 'neutral'}>
                            {statusLabel[conv.status] ?? conv.status}
                          </Badge>
                          {conv.rating != null && (
                            <span className="text-[10px] font-medium text-amber-600">
                              ★ {conv.rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-400">
                      <span>
                        {conv._count.messages} message{conv._count.messages !== 1 ? 's' : ''}
                      </span>
                      {conv.handedOff && (
                        <>
                          <span className="text-ink-300">·</span>
                          <span className="font-medium text-amber-600/90">Handed off</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-600" />
                </Link>
              );
            })}
          </div>
          {conversations.length < total && (
            <div className="border-t border-ink-100 p-4 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary text-sm"
              >
                {loadingMore ? 'Loading…' : `Load more (${conversations.length} of ${total})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { api } from '../../lib/api';

interface Conversation {
  id: string;
  status: string;
  customerName: string | null;
  handedOff: boolean;
  updatedAt: string;
  _count: { messages: number };
}

const statusVariant: Record<string, 'success' | 'warning' | 'neutral' | 'info'> = {
  OPEN: 'info',
  RESOLVED: 'success',
  ESCALATED: 'warning',
};

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    api.get('/api/conversations').then((res) => setConversations(res.data));
  }, []);

  return (
    <div>
      <PageHeader
        title="Conversations"
        description="Every chat between your customers and the AI or your support team."
      />

      {conversations.length === 0 ? (
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
        <div className="card divide-y divide-zinc-100 overflow-hidden">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              to={`/dashboard/conversations/${conv.id}`}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-zinc-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600">
                  {(conv.customerName ?? 'A')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-zinc-900">{conv.customerName ?? 'Anonymous visitor'}</p>
                  <p className="text-sm text-zinc-500">
                    {conv._count.messages} message{conv._count.messages !== 1 ? 's' : ''}
                    {conv.handedOff && ' · Handed off to agent'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge variant={statusVariant[conv.status] ?? 'neutral'}>{conv.status}</Badge>
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(conv.updatedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

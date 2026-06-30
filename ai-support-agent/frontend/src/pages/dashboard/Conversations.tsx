import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface Conversation {
  id: string;
  status: string;
  customerName: string | null;
  handedOff: boolean;
  updatedAt: string;
  _count: { messages: number };
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    api.get('/api/conversations').then((res) => setConversations(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Conversations</h2>
      <div className="bg-white rounded-xl border divide-y">
        {conversations.length === 0 && (
          <p className="p-6 text-slate-500">No conversations yet.</p>
        )}
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            to={`/dashboard/conversations/${conv.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium">{conv.customerName ?? 'Anonymous'}</p>
              <p className="text-sm text-slate-500">{conv._count.messages} messages</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100">
                {conv.status}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(conv.updatedAt).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

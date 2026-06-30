import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';

interface Message {
  id: string;
  role: string;
  content: string;
  confidence: number | null;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  status: string;
  messages: Message[];
}

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);

  useEffect(() => {
    if (id) {
      api.get(`/api/conversations/${id}`).then((res) => setConversation(res.data));
    }
  }, [id]);

  if (!conversation) return <p>Loading...</p>;

  const roleStyle: Record<string, string> = {
    CUSTOMER: 'bg-blue-50 ml-0 mr-12',
    AI: 'bg-slate-100 ml-12 mr-0',
    AGENT: 'bg-green-50 ml-12 mr-0',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Conversation</h2>
      <p className="text-sm text-slate-500 mb-6">Status: {conversation.status}</p>
      <div className="space-y-4">
        {conversation.messages.map((msg) => (
          <div key={msg.id} className={`p-4 rounded-lg ${roleStyle[msg.role] ?? ''}`}>
            <p className="text-xs font-medium text-slate-500 mb-1">{msg.role}</p>
            <p>{msg.content}</p>
            {msg.confidence != null && (
              <p className="text-xs text-slate-400 mt-1">
                Confidence: {(msg.confidence * 100).toFixed(0)}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

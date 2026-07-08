import { Bot, Headphones, User } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  confidence: number | null;
  createdAt: string;
}

interface ChatThreadProps {
  messages: ChatMessage[];
  endRef?: React.RefObject<HTMLDivElement>;
}

const roleMeta: Record<string, { label: string; icon: typeof User; avatar: string; bubble: string }> = {
  CUSTOMER: {
    label: 'Customer',
    icon: User,
    avatar: 'bg-ink-200 text-ink-600',
    bubble: 'chat-bubble-customer',
  },
  AI: {
    label: 'AI',
    icon: Bot,
    avatar: 'bg-ink-100 text-ink-500',
    bubble: 'chat-bubble-ai',
  },
  AGENT: {
    label: 'You',
    icon: Headphones,
    avatar: 'bg-ink-800 text-white',
    bubble: 'chat-bubble-agent',
  },
};

function dateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function groupMessages(messages: ChatMessage[]) {
  const groups: { date: string; label: string; items: ChatMessage[] }[] = [];
  for (const msg of messages) {
    const key = new Date(msg.createdAt).toDateString();
    const last = groups[groups.length - 1];
    if (last?.date === key) last.items.push(msg);
    else groups.push({ date: key, label: dateLabel(msg.createdAt), items: [msg] });
  }
  return groups;
}

export default function ChatThread({ messages, endRef }: ChatThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-ink-500">
        No messages in this conversation yet.
      </div>
    );
  }

  return (
    <div className="chat-thread space-y-4 px-4 py-4">
      {groupMessages(messages).map((group) => (
        <div key={group.date}>
          <div className="chat-date-divider">
            <span>{group.label}</span>
          </div>
          <div className="mt-3 space-y-3">
            {group.items.map((msg) => {
              const meta = roleMeta[msg.role] ?? roleMeta.AI;
              const Icon = meta.icon;
              const isCustomer = msg.role === 'CUSTOMER';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isCustomer ? '' : 'flex-row-reverse'}`}
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.avatar}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className={`max-w-[75%] ${isCustomer ? '' : 'text-right'}`}>
                    <p className="mb-1 text-xs text-ink-400">
                      {meta.label} · {formatTime(msg.createdAt)}
                    </p>
                    <div className={`${meta.bubble} inline-block text-left whitespace-pre-wrap break-words`}>
                      {msg.content}
                    </div>
                    {msg.confidence != null && (
                      <p className="mt-1 text-xs text-ink-400">
                        {(msg.confidence * 100).toFixed(0)}% confidence
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

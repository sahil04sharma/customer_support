import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface CannedResponse {
  id: string;
  title: string;
  content: string;
}

interface CannedResponsePickerProps {
  onInsert: (content: string) => void;
  className?: string;
}

export default function CannedResponsePicker({ onInsert, className }: CannedResponsePickerProps) {
  const [items, setItems] = useState<CannedResponse[]>([]);

  useEffect(() => {
    api.get('/api/canned-responses').then((res) => setItems(res.data));
  }, []);

  if (items.length === 0) return null;

  return (
    <select
      className={className ?? 'input-field text-sm'}
      defaultValue=""
      onChange={(e) => {
        const id = e.target.value;
        if (!id) return;
        const item = items.find((c) => c.id === id);
        if (item) onInsert(item.content);
        e.target.value = '';
      }}
    >
      <option value="">Insert canned response…</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.title}
        </option>
      ))}
    </select>
  );
}

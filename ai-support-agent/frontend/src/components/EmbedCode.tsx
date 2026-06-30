import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function EmbedCode() {
  const [widgetKey, setWidgetKey] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  useEffect(() => {
    api.get('/api/business/widget-key').then((res: { data: { widgetKey: string } }) => {
      setWidgetKey(res.data.widgetKey);
    });
  }, []);

  const script = `<script src="${apiUrl}/widget.js" data-widget-key="${widgetKey}"></script>`;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Embed Code</h2>
      <p className="text-slate-600 mb-6">
        Paste this script tag before the closing &lt;/body&gt; tag on your website.
      </p>
      <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
        {script}
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(script)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Copy to clipboard
      </button>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import { api } from '../lib/api';

export default function EmbedCode() {
  const [widgetKey, setWidgetKey] = useState('');
  const [copied, setCopied] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  useEffect(() => {
    api.get('/api/business/widget-key').then((res: { data: { widgetKey: string } }) => {
      setWidgetKey(res.data.widgetKey);
    });
  }, []);

  const script = `<script src="${apiUrl}/widget.js" data-widget-key="${widgetKey}"></script>`;

  async function handleCopy() {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Install chat widget"
        description="Add this code to your website so customers can chat with your AI assistant."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-1 font-semibold text-zinc-900">Embed code</h3>
          <p className="mb-5 text-sm text-zinc-500">
            Paste before the closing <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">&lt;/body&gt;</code> tag on any page.
          </p>
          <div className="overflow-x-auto rounded-lg bg-zinc-950 p-4">
            <pre className="font-mono text-sm leading-relaxed text-emerald-400">{script}</pre>
          </div>
          <button onClick={handleCopy} className="btn-primary mt-4 gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>

        <div className="card p-6">
          <h3 className="mb-1 font-semibold text-zinc-900">How to install</h3>
          <ol className="mt-4 space-y-4 text-sm text-zinc-600">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">1</span>
              <span>Upload your knowledge base documents first so the AI has content to answer from.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">2</span>
              <span>Copy the embed code and paste it on your website, or send it to your web developer.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">3</span>
              <span>A chat bubble will appear on your site. Customers click it to start a conversation.</span>
            </li>
          </ol>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <ExternalLink className="h-4 w-4" />
              Works with WordPress, Shopify, Wix, and any HTML site
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Not technical? Send the code to whoever manages your website — it takes about 2 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

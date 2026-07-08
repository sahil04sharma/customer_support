import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from './ui/PageHeader';
import LowContentWarning from './knowledge/LowContentWarning';
import { api } from '../lib/api';
import { isLowReadiness, type DocumentsSummary } from '../lib/knowledgeBase';

const defaultSummary: DocumentsSummary = {
  totalDocuments: 0,
  readyDocuments: 0,
  statusCounts: { READY: 0, PROCESSING: 0, FAILED: 0 },
  totalChunks: 0,
  readinessLevel: 'EMPTY',
};

export default function EmbedCode() {
  const [widgetKey, setWidgetKey] = useState('');
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState('');
  const [domainsSaved, setDomainsSaved] = useState(false);
  const [summary, setSummary] = useState<DocumentsSummary>(defaultSummary);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  useEffect(() => {
    api.get('/api/business/profile').then((res) => {
      setAllowedDomains(res.data.allowedDomains ?? []);
    });
    api.get('/api/business/widget-key').then((res: { data: { widgetKey: string } }) => {
      setWidgetKey(res.data.widgetKey);
    });
    api.get<DocumentsSummary>('/api/documents/summary').then((res) => setSummary(res.data));
  }, []);

  const script = `<script src="${apiUrl}/widget.js" data-widget-key="${widgetKey}"></script>`;

  async function handleRotateKey() {
    if (
      !window.confirm(
        'Regenerate your widget key? The old embed code will stop working until you update your site.'
      )
    ) {
      return;
    }
    setRotating(true);
    try {
      const { data } = await api.post<{ widgetKey: string }>('/api/business/widget-key/rotate');
      setWidgetKey(data.widgetKey);
    } finally {
      setRotating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function addDomain() {
    const value = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    if (!value || allowedDomains.includes(value)) return;
    setAllowedDomains((prev) => [...prev, value]);
    setDomainInput('');
  }

  async function saveDomains() {
    await api.put('/api/business/allowed-domains', { allowedDomains });
    setDomainsSaved(true);
    setTimeout(() => setDomainsSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        title="Install chat widget"
        description="Add this code to your website so customers can chat with your AI assistant."
      />

      {isLowReadiness(summary.readinessLevel) && (
        <div className="mb-6">
          <LowContentWarning />
        </div>
      )}

      <div className="mb-6 card p-6">
        <h3 className="mb-1 font-semibold text-zinc-900">Allowed domains</h3>
        <p className="mb-4 text-sm text-zinc-500">
          Restrict where your widget works. If someone copies your embed code to another site, chat
          will be blocked. Leave empty to allow any domain (fine for testing).{' '}
          <code className="rounded bg-zinc-100 px-1 text-xs">localhost</code> is always allowed for
          development.
        </p>
        <div className="flex flex-wrap gap-2">
          {allowedDomains.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700"
            >
              {domain}
              <button
                type="button"
                onClick={() => setAllowedDomains((prev) => prev.filter((d) => d !== domain))}
                className="text-zinc-400 hover:text-red-600"
                aria-label={`Remove ${domain}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDomain();
              }
            }}
            placeholder="yourstore.com"
            className="input-field max-w-xs"
          />
          <button type="button" onClick={addDomain} className="btn-secondary">
            Add domain
          </button>
          <button type="button" onClick={saveDomains} className="btn-primary">
            {domainsSaved ? 'Saved!' : 'Save domains'}
          </button>
        </div>
      </div>

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
          <button
            type="button"
            onClick={handleRotateKey}
            disabled={rotating}
            className="btn-secondary mt-3 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${rotating ? 'animate-spin' : ''}`} />
            {rotating ? 'Regenerating…' : 'Regenerate widget key'}
          </button>
          <p className="mt-2 text-xs text-amber-700">
            Only regenerate if your key was leaked or abused. You must update the embed code on every site.
          </p>
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
              <span>
                Test first with the{' '}
                <Link to="/dashboard/test" className="font-medium text-zinc-900 underline">
                  in-app preview
                </Link>
                , then confirm the chat bubble appears on your live site.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">4</span>
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

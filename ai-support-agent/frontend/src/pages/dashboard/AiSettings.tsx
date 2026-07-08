import { FormEvent, useEffect, useState } from 'react';
import {
  Bot,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Database,
  Infinity,
  KeyRound,
  Lock,
  MessageSquare,
  RefreshCw,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { api } from '../../lib/api';

type AiMode = 'platform' | 'byok';
type ChatProvider = 'openai' | 'anthropic' | 'groq' | 'google';
type EmbedProvider = 'openai' | 'google';

interface AiConfig {
  chatMode: AiMode;
  chatProvider: ChatProvider | null;
  chatModel: string | null;
  chatApiKeyMasked: string | null;
  hasChatApiKey: boolean;
  embedMode: AiMode;
  embedProvider: EmbedProvider | null;
  embedModel: string | null;
  embedApiKeyMasked: string | null;
  hasEmbedApiKey: boolean;
  embedConfigVersion: number;
  usesOwnChatKey: boolean;
  usesOwnEmbedKey: boolean;
}

interface ProviderMeta {
  chatProviders: ChatProvider[];
  embedProviders: EmbedProvider[];
  chatModels: Record<ChatProvider, { id: string; label: string }[]>;
  embedModels: Record<EmbedProvider, { id: string; label: string }[]>;
}

const PROVIDER_META: Record<
  string,
  { label: string; short: string; color: string; bg: string }
> = {
  openai: { label: 'OpenAI', short: 'OA', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  anthropic: { label: 'Anthropic', short: 'An', color: 'text-amber-800', bg: 'bg-amber-100' },
  groq: { label: 'Groq', short: 'Gq', color: 'text-orange-700', bg: 'bg-orange-100' },
  google: { label: 'Gemini', short: 'Gm', color: 'text-blue-700', bg: 'bg-blue-100' },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{children}</p>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Sparkles;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ai-mode-card w-full ${active ? 'ai-mode-card-active' : ''}`}
    >
      {active && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
          active ? 'bg-accent-600 text-white' : 'bg-ink-100 text-ink-500'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-500">{description}</p>
      {badge && (
        <span className="mt-3 inline-flex w-fit rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
          {badge}
        </span>
      )}
    </button>
  );
}

function ProviderTile({
  id,
  active,
  onClick,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
}) {
  const meta = PROVIDER_META[id];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ai-provider-tile w-full ${active ? 'ai-provider-tile-active' : ''}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${meta.bg} ${meta.color}`}
      >
        {meta.short}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink-900">{meta.label}</span>
      </span>
      {active && <Check className="h-4 w-4 shrink-0 text-ink-900" strokeWidth={2.5} />}
    </button>
  );
}

function ApiKeyField({
  label,
  hint,
  value,
  onChange,
  maskedSaved,
  hasSaved,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  maskedSaved: string | null;
  hasSaved: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="label mb-0">{label}</label>
        {hasSaved && (
          <Badge variant="success">
            <Lock className="mr-1 inline h-3 w-3" />
            {maskedSaved}
          </Badge>
        )}
      </div>
      <div className="ai-key-input-wrap">
        <KeyRound className="ml-3 h-4 w-4 shrink-0 text-ink-400" />
        <input
          type={visible ? 'text' : 'password'}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-0"
          placeholder={hasSaved ? 'Leave blank to keep current key' : hint}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="mr-2 rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          aria-label={visible ? 'Hide key' : 'Show key'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-ink-400">Encrypted at rest · never sent to the widget</p>
    </div>
  );
}

export default function AiSettings() {
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [providers, setProviders] = useState<ProviderMeta | null>(null);
  const [chatMode, setChatMode] = useState<AiMode>('platform');
  const [chatProvider, setChatProvider] = useState<ChatProvider>('openai');
  const [chatModel, setChatModel] = useState('');
  const [chatApiKey, setChatApiKey] = useState('');
  const [embedMode, setEmbedMode] = useState<AiMode>('platform');
  const [embedProvider, setEmbedProvider] = useState<EmbedProvider>('openai');
  const [embedModel, setEmbedModel] = useState('');
  const [embedApiKey, setEmbedApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<'chat' | 'embed' | 'both' | null>(null);
  const [reembedding, setReembedding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/api/business/ai-config')
      .then((res) => {
        const { config: c, providers: p } = res.data as {
          config: AiConfig;
          providers: ProviderMeta;
        };
        setConfig(c);
        setProviders(p);
        setChatMode(c.chatMode);
        setChatProvider(c.chatProvider ?? 'openai');
        setChatModel(c.chatModel ?? p.chatModels.openai[0].id);
        setEmbedMode(c.embedMode);
        setEmbedProvider(c.embedProvider ?? 'openai');
        setEmbedModel(c.embedModel ?? p.embedModels.openai[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!providers) return;
    const models = providers.chatModels[chatProvider];
    if (models && !models.some((m) => m.id === chatModel)) {
      setChatModel(models[0].id);
    }
  }, [chatProvider, providers, chatModel]);

  useEffect(() => {
    if (!providers) return;
    const models = providers.embedModels[embedProvider];
    if (models && !models.some((m) => m.id === embedModel)) {
      setEmbedModel(models[0].id);
    }
  }, [embedProvider, providers, embedModel]);

  function parseError(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
      return (
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
        'Request failed'
      );
    }
    return 'Request failed';
  }

  async function handleTest(target: 'chat' | 'embed' | 'both') {
    setTesting(target);
    setError('');
    setMessage('');
    try {
      await api.post('/api/business/ai-config/test', {
        target,
        chatProvider: chatMode === 'byok' ? chatProvider : undefined,
        chatModel: chatMode === 'byok' ? chatModel : undefined,
        chatApiKey: chatApiKey || undefined,
        embedProvider: embedMode === 'byok' ? embedProvider : undefined,
        embedModel: embedMode === 'byok' ? embedModel : undefined,
        embedApiKey: embedApiKey || undefined,
      });
      setMessage(
        target === 'both'
          ? 'Chat and embedding connections verified.'
          : target === 'chat'
            ? 'Chat connection verified.'
            : 'Embedding connection verified.'
      );
    } catch (err) {
      setError(parseError(err));
    } finally {
      setTesting(null);
    }
  }

  async function handleReembed() {
    setReembedding(true);
    setError('');
    try {
      const { data } = await api.post<{ queued: number }>('/api/business/ai-config/re-embed');
      setMessage(`Re-indexing ${data.queued} document${data.queued === 1 ? '' : 's'} in the background.`);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setReembedding(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    setSaved(false);
    try {
      const { data } = await api.put('/api/business/ai-config', {
        chatMode,
        chatProvider: chatMode === 'byok' ? chatProvider : null,
        chatModel: chatMode === 'byok' ? chatModel : null,
        chatApiKey: chatApiKey || undefined,
        embedMode,
        embedProvider: embedMode === 'byok' ? embedProvider : null,
        embedModel: embedMode === 'byok' ? embedModel : null,
        embedApiKey: embedApiKey || undefined,
        triggerReembed: true,
      });
      setConfig(data.config);
      setChatApiKey('');
      setEmbedApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (data.reembed?.queued) {
        setMessage(`Saved · re-indexing ${data.reembed.queued} document(s).`);
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !providers) {
    return (
      <div className="card flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-accent-600" />
      </div>
    );
  }

  const chatActive = chatMode === 'byok';
  const embedActive = embedMode === 'byok';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI providers"
        description="Choose hosted AI on the free plan, or plug in your own keys for unlimited usage."
      />

      {/* Hero strip */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="card flex items-start gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Free hosted</p>
            <p className="mt-0.5 text-lg font-semibold text-ink-900">150</p>
            <p className="text-[11px] text-ink-400">AI replies / month</p>
          </div>
        </div>
        <div className="card flex items-start gap-3 border-accent-200/60 bg-accent-50/20 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white">
            <Infinity className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-accent-800">Your chat key</p>
            <p className="mt-0.5 text-lg font-semibold text-ink-900">Unlimited</p>
            <p className="text-[11px] text-ink-500">Billed by your provider</p>
          </div>
        </div>
        <div className="card flex items-start gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Embeddings</p>
            <p className="mt-0.5 text-sm font-semibold text-ink-900">Separate key</p>
            <p className="text-[11px] text-ink-400">OpenAI or Gemini for docs</p>
          </div>
        </div>
      </div>

      {error && <div className="alert-error mb-6">{error}</div>}
      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50/60 px-4 py-3 text-sm text-accent-900">
          <Check className="h-4 w-4 shrink-0 text-accent-600" />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            {/* Chat section */}
            <section className="card overflow-hidden">
              <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-ink-500" />
                  <h2 className="text-sm font-semibold text-ink-900">Chat replies</h2>
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Powers customer-facing answers in the widget and test assistant.
                </p>
              </div>

              <div className="space-y-5 p-5">
                <SectionLabel>How should we run chat?</SectionLabel>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModeCard
                    active={chatMode === 'platform'}
                    onClick={() => setChatMode('platform')}
                    icon={Sparkles}
                    title="Hosted by SupportDesk"
                    description="No setup. Uses our keys with a monthly cap on the free plan."
                    badge="150 msgs / mo"
                  />
                  <ModeCard
                    active={chatMode === 'byok'}
                    onClick={() => setChatMode('byok')}
                    icon={Zap}
                    title="My provider key"
                    description="OpenAI, Anthropic, Groq, or Gemini. You pay them directly."
                    badge="Unlimited"
                  />
                </div>

                {chatActive && (
                  <div className="animate-slide-up space-y-5 rounded-xl border border-ink-100 bg-paper-warm/80 p-4">
                    <div>
                      <SectionLabel>Provider</SectionLabel>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {providers.chatProviders.map((p) => (
                          <ProviderTile
                            key={p}
                            id={p}
                            active={chatProvider === p}
                            onClick={() => setChatProvider(p)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label">Model</label>
                      <select
                        className="input-field"
                        value={chatModel}
                        onChange={(e) => setChatModel(e.target.value)}
                      >
                        {providers.chatModels[chatProvider].map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ApiKeyField
                      label="API key"
                      hint="sk-… or gsk_…"
                      value={chatApiKey}
                      onChange={setChatApiKey}
                      hasSaved={Boolean(config?.hasChatApiKey)}
                      maskedSaved={config?.chatApiKeyMasked ?? null}
                    />

                    <button
                      type="button"
                      className="btn-secondary text-sm"
                      disabled={testing !== null}
                      onClick={() => handleTest('chat')}
                    >
                      {testing === 'chat' ? 'Testing…' : 'Test chat connection'}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Embeddings section */}
            <section className="card overflow-hidden">
              <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-ink-500" />
                  <h2 className="text-sm font-semibold text-ink-900">Knowledge base search</h2>
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Embeddings power document upload and semantic search. Anthropic has no embedding API.
                </p>
              </div>

              <div className="space-y-5 p-5">
                <SectionLabel>Embedding source</SectionLabel>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModeCard
                    active={embedMode === 'platform'}
                    onClick={() => setEmbedMode('platform')}
                    icon={Sparkles}
                    title="Hosted embeddings"
                    description="We embed your documents with our Gemini key."
                  />
                  <ModeCard
                    active={embedMode === 'byok'}
                    onClick={() => setEmbedMode('byok')}
                    icon={KeyRound}
                    title="My embedding key"
                    description="OpenAI or Google Gemini. Required if chat uses Anthropic."
                  />
                </div>

                {embedActive && (
                  <div className="animate-slide-up space-y-5 rounded-xl border border-ink-100 bg-paper-warm/80 p-4">
                    <div>
                      <SectionLabel>Provider</SectionLabel>
                      <div className="mt-2 grid gap-2">
                        {providers.embedProviders.map((p) => (
                          <ProviderTile
                            key={p}
                            id={p}
                            active={embedProvider === p}
                            onClick={() => setEmbedProvider(p)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label">Model</label>
                      <select
                        className="input-field"
                        value={embedModel}
                        onChange={(e) => setEmbedModel(e.target.value)}
                      >
                        {providers.embedModels[embedProvider].map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ApiKeyField
                      label="Embedding API key"
                      hint="OpenAI or Google AI key"
                      value={embedApiKey}
                      onChange={setEmbedApiKey}
                      hasSaved={Boolean(config?.hasEmbedApiKey)}
                      maskedSaved={config?.embedApiKeyMasked ?? null}
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-secondary text-sm"
                        disabled={testing !== null}
                        onClick={() => handleTest('embed')}
                      >
                        {testing === 'embed' ? 'Testing…' : 'Test embedding'}
                      </button>
                      {config?.usesOwnEmbedKey && (
                        <button
                          type="button"
                          className="btn-secondary gap-2 text-sm"
                          disabled={reembedding}
                          onClick={handleReembed}
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${reembedding ? 'animate-spin' : ''}`}
                          />
                          Re-index docs
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-2">
              <button type="submit" className="btn-primary gap-2" disabled={saving}>
                {saved ? <Check className="h-4 w-4" /> : null}
                {saving ? 'Saving…' : saved ? 'Saved' : 'Save configuration'}
              </button>
              {chatActive && embedActive && (
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  disabled={testing !== null}
                  onClick={() => handleTest('both')}
                >
                  {testing === 'both' ? 'Testing…' : 'Test both'}
                </button>
              )}
            </div>
          </div>

          {/* Status sidebar */}
          <aside className="ai-status-panel hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Current setup
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3">
                <p className="text-[11px] font-medium text-ink-500">Chat</p>
                <p className="mt-1 text-sm font-medium text-ink-900">
                  {config?.usesOwnChatKey
                    ? PROVIDER_META[config.chatProvider ?? 'openai']?.label
                    : 'Hosted'}
                </p>
                {config?.usesOwnChatKey && config.chatModel && (
                  <p className="mt-0.5 truncate text-[11px] text-ink-400">{config.chatModel}</p>
                )}
                <div className="mt-2">
                  {config?.usesOwnChatKey ? (
                    <Badge variant="success">Unlimited</Badge>
                  ) : (
                    <Badge variant="neutral">150 / mo</Badge>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3">
                <p className="text-[11px] font-medium text-ink-500">Embeddings</p>
                <p className="mt-1 text-sm font-medium text-ink-900">
                  {config?.usesOwnEmbedKey
                    ? PROVIDER_META[config.embedProvider ?? 'openai']?.label
                    : 'Hosted'}
                </p>
                {config?.usesOwnEmbedKey && config.embedModel && (
                  <p className="mt-0.5 truncate text-[11px] text-ink-400">{config.embedModel}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 rounded-lg border border-ink-100 bg-white p-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              <p className="text-[11px] leading-relaxed text-ink-500">
                Keys are encrypted server-side and never exposed to your widget or visitors.
              </p>
            </div>

            {chatProvider === 'anthropic' && chatActive && embedMode === 'platform' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3">
                <p className="text-xs font-medium text-amber-900">Anthropic tip</p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                  Add an OpenAI or Gemini embedding key so document search keeps working.
                </p>
              </div>
            )}

            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg px-1 py-1 text-xs text-ink-500 hover:text-accent-700"
            >
              Get OpenAI keys
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </aside>
        </div>
      </form>
    </div>
  );
}

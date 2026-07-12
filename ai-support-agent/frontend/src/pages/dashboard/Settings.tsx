import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ImagePlus, Plus, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import WidgetSettingsPreview from '../../components/WidgetSettingsPreview';
import { api } from '../../lib/api';
import {
  DEFAULT_WIDGET_SETTINGS,
  normalizeSettings,
  THEME_PRESETS,
  toSettingsPayload,
  type WidgetSettingsForm,
} from '../../lib/widgetSettings';

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-zinc-100 pb-3">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
    </div>
  );
}

interface ImageFieldProps {
  label: string;
  hint: string;
  value: string | null;
  type: 'launcher' | 'avatar';
  onChange: (url: string | null) => void;
}

const MAX_WIDGET_IMAGE_BYTES = 1024 * 1024;

function ImageField({ label, hint, value, type, onChange }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFile(file: File) {
    setUploadError('');
    if (file.size > MAX_WIDGET_IMAGE_BYTES) {
      setUploadError('Image must be 1 MB or smaller.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const { data } = await api.post<{ url: string }>('/api/business/widget-image', formData);
      onChange(data.url);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Upload failed. Check Cloudinary settings and try again.';
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <p className="mb-2 text-xs text-zinc-500">{hint}</p>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-zinc-400" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-xs"
          >
            {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="btn-ghost text-xs text-red-600">
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
      {value && (
        <p className="mt-2 text-xs text-zinc-400">Click Save changes below to apply this image on your site.</p>
      )}
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<WidgetSettingsForm | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickReplyInput, setQuickReplyInput] = useState('');

  useEffect(() => {
    api.get('/api/business/profile').then((res) => {
      setSettings(normalizeSettings(res.data.settings ?? DEFAULT_WIDGET_SETTINGS));
    });
  }, []);

  function update(patch: Partial<WidgetSettingsForm>) {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function applyPreset(presetId: string) {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) update(preset.values);
  }

  function addQuickReply() {
    const text = quickReplyInput.trim();
    if (!text || !settings || settings.quickReplies.length >= 5) return;
    if (settings.quickReplies.includes(text)) return;
    update({ quickReplies: [...settings.quickReplies, text] });
    setQuickReplyInput('');
  }

  function removeQuickReply(index: number) {
    if (!settings) return;
    update({ quickReplies: settings.quickReplies.filter((_, i) => i !== index) });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.put<WidgetSettingsForm>(
        '/api/business/settings',
        toSettingsPayload(settings)
      );
      setSettings(normalizeSettings(data as unknown as Record<string, unknown>));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to save settings. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Widget settings"
        description="Customize how the chat widget looks and behaves on your website."
      />

      <div className="card-muted mb-8 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div>
          <p className="font-semibold text-ink-900">Make it yours</p>
          <p className="mt-1 text-sm text-ink-500">
            Use the live preview on the right, then test before installing.
          </p>
        </div>
        <Link to="/dashboard/test" className="btn-secondary gap-1.5 text-sm">
          Test widget
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="card space-y-4 p-6">
              <SectionHeader title="Theme presets" description="Apply a starting look, then fine-tune below." />
              <div className="grid gap-2 sm:grid-cols-3">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-left transition-colors hover:border-zinc-300 hover:bg-white"
                  >
                    <p className="text-xs font-medium text-zinc-900">{preset.label}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="card space-y-5 p-6">
              <SectionHeader title="Brand" />
              <div>
                <label className="label">Brand color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.widgetColor}
                    onChange={(e) => update({ widgetColor: e.target.value })}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1"
                  />
                  <span className="text-sm text-zinc-500">{settings.widgetColor}</span>
                </div>
              </div>
              <div>
                <label className="label">Position on page</label>
                <select
                  value={settings.widgetPosition}
                  onChange={(e) => update({ widgetPosition: e.target.value })}
                  className="input-field"
                >
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                </select>
              </div>
              <div>
                <label className="label">Theme</label>
                <select
                  value={settings.themeMode}
                  onChange={(e) => update({ themeMode: e.target.value })}
                  className="input-field"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={settings.showBranding}
                  onChange={(e) => update({ showBranding: e.target.checked })}
                  className="rounded border-zinc-300"
                />
                Show &quot;Powered by SupportDesk&quot;
              </label>
            </div>

            <div className="card space-y-5 p-6">
              <SectionHeader
                title="Launcher"
                description="The chat bubble customers click to open the widget."
              />
              <ImageField
                label="Launcher image"
                hint="Recommended 64×64 px. PNG, JPG, WebP, or SVG. Falls back to 💬 if empty."
                value={settings.launcherImageUrl}
                type="launcher"
                onChange={(url) => update({ launcherImageUrl: url })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Bubble shape</label>
                  <select
                    value={settings.bubbleShape}
                    onChange={(e) => update({ bubbleShape: e.target.value })}
                    className="input-field"
                  >
                    <option value="round">Round</option>
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                <div>
                  <label className="label">Bubble size</label>
                  <select
                    value={settings.bubbleSize}
                    onChange={(e) => update({ bubbleSize: e.target.value })}
                    className="input-field"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Launcher label (optional)</label>
                <input
                  type="text"
                  value={settings.launcherText ?? ''}
                  onChange={(e) => update({ launcherText: e.target.value || null })}
                  placeholder="Chat with us"
                  maxLength={40}
                  className="input-field"
                />
              </div>
            </div>

            <div className="card space-y-5 p-6">
              <SectionHeader title="Messages" />
              <ImageField
                label="Assistant avatar"
                hint="Square image works best. Shown in the chat header."
                value={settings.avatarImageUrl}
                type="avatar"
                onChange={(url) => update({ avatarImageUrl: url })}
              />
              <div>
                <label className="label">Header title</label>
                <input
                  type="text"
                  value={settings.headerTitle ?? ''}
                  onChange={(e) => update({ headerTitle: e.target.value || null })}
                  placeholder={settings.agentName}
                  maxLength={120}
                  className="input-field"
                />
                <p className="mt-1 text-xs text-zinc-500">Leave blank to use assistant name.</p>
              </div>
              <div>
                <label className="label">Assistant name</label>
                <input
                  type="text"
                  value={settings.agentName}
                  onChange={(e) => update({ agentName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Welcome message</label>
                <input
                  type="text"
                  value={settings.welcomeMessage}
                  onChange={(e) => update({ welcomeMessage: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Offline message</label>
                <input
                  type="text"
                  value={settings.offlineMessage}
                  onChange={(e) => update({ offlineMessage: e.target.value })}
                  className="input-field"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Shown when waiting for a human agent after escalation.
                </p>
              </div>
            </div>

            <div className="card space-y-5 p-6">
              <SectionHeader
                title="Quick replies"
                description="Suggested questions customers can tap to start (max 5)."
              />
              <div className="flex flex-wrap gap-2">
                {settings.quickReplies.map((reply, index) => (
                  <span
                    key={`${reply}-${index}`}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700"
                  >
                    {reply}
                    <button
                      type="button"
                      onClick={() => removeQuickReply(index)}
                      className="text-zinc-400 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {settings.quickReplies.length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickReplyInput}
                    onChange={(e) => setQuickReplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addQuickReply();
                      }
                    }}
                    placeholder="e.g. What are your shipping times?"
                    maxLength={80}
                    className="input-field"
                  />
                  <button type="button" onClick={addQuickReply} className="btn-secondary shrink-0 gap-1">
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="card space-y-5 p-6">
              <SectionHeader title="AI behavior" />
              <div>
                <label className="label">Response language</label>
                <select
                  value={settings.aiLanguage}
                  onChange={(e) => update({ aiLanguage: e.target.value })}
                  className="input-field"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              <div>
                <label className="label">AI tone / persona</label>
                <input
                  type="text"
                  value={settings.aiPersona}
                  onChange={(e) => update({ aiPersona: e.target.value })}
                  placeholder="friendly and professional"
                  maxLength={200}
                  className="input-field"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  How the assistant should sound — e.g. &quot;warm and concise&quot; or &quot;formal and technical&quot;.
                </p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="label mb-0">Escalation threshold</label>
                  <span className="text-sm font-medium text-zinc-900">
                    {(settings.confidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mb-3 text-xs text-zinc-500">
                  Below this confidence score, the AI hands off to a human agent.
                </p>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.confidenceThreshold}
                  onChange={(e) =>
                    update({ confidenceThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-zinc-900"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving…' : 'Save changes'}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              )}
              {error && (
                <span className="text-sm font-medium text-red-600">{error}</span>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <WidgetSettingsPreview settings={settings} />
          </div>
        </div>
      </form>
    </div>
  );
}

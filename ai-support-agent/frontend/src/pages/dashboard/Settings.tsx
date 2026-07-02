import { FormEvent, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { api } from '../../lib/api';

interface Settings {
  widgetColor: string;
  widgetPosition: string;
  welcomeMessage: string;
  agentName: string;
  confidenceThreshold: number;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/business/profile').then((res) => setSettings(res.data.settings));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    await api.put('/api/business/settings', settings);
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2500);
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

      <form onSubmit={handleSubmit} className="card max-w-xl p-6">
        <div className="space-y-6">
          <div>
            <label className="label">Brand color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.widgetColor}
                onChange={(e) => setSettings({ ...settings, widgetColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1"
              />
              <span className="text-sm text-zinc-500">{settings.widgetColor}</span>
            </div>
          </div>

          <div>
            <label className="label">Position on page</label>
            <select
              value={settings.widgetPosition}
              onChange={(e) => setSettings({ ...settings, widgetPosition: e.target.value })}
              className="input-field"
            >
              <option value="bottom-right">Bottom right</option>
              <option value="bottom-left">Bottom left</option>
            </select>
          </div>

          <div>
            <label className="label">Welcome message</label>
            <input
              type="text"
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Assistant name</label>
            <input
              type="text"
              value={settings.agentName}
              onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
              className="input-field"
            />
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
                setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-zinc-900"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 border-t border-zinc-100 pt-6">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : 'Save changes'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

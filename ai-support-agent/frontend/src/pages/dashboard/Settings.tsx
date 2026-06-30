import { FormEvent, useEffect, useState } from 'react';
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

  useEffect(() => {
    api.get('/api/business/profile').then((res) => setSettings(res.data.settings));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    await api.put('/api/business/settings', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!settings) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Widget Settings</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Widget Color</label>
          <input
            type="color"
            value={settings.widgetColor}
            onChange={(e) => setSettings({ ...settings, widgetColor: e.target.value })}
            className="w-full h-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <select
            value={settings.widgetPosition}
            onChange={(e) => setSettings({ ...settings, widgetPosition: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Welcome Message</label>
          <input
            type="text"
            value={settings.welcomeMessage}
            onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Agent Name</label>
          <input
            type="text"
            value={settings.agentName}
            onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Confidence Threshold ({settings.confidenceThreshold})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.confidenceThreshold}
            onChange={(e) =>
              setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })
            }
            className="w-full"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Settings
        </button>
        {saved && <p className="text-green-600 text-sm">Settings saved!</p>}
      </form>
    </div>
  );
}

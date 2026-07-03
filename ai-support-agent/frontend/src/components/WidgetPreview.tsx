import { useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { setOnboardingTested } from '../lib/onboarding';

const WIDGET_ROOT_ID = 'ai-support-widget-root';
const WIDGET_SCRIPT_ID = 'supportdesk-widget-preview-script';

interface WidgetPreviewProps {
  onLoaded?: () => void;
  className?: string;
}

export default function WidgetPreview({ onLoaded, className = '' }: WidgetPreviewProps) {
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    let cancelled = false;

    async function loadWidget() {
      try {
        const { data } = await api.get<{ widgetKey: string }>('/api/business/widget-key');
        if (cancelled) return;

        const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

        const existing = document.getElementById(WIDGET_SCRIPT_ID);
        existing?.remove();
        document.getElementById(WIDGET_ROOT_ID)?.remove();

        const script = document.createElement('script');
        script.id = WIDGET_SCRIPT_ID;
        script.src = `${apiUrl}/widget.js`;
        script.setAttribute('data-widget-key', data.widgetKey);
        script.setAttribute('data-api-url', apiUrl);
        script.async = true;
        script.onload = () => {
          setOnboardingTested();
          onLoadedRef.current?.();
        };
        document.body.appendChild(script);
      } catch {
        // Widget key fetch failed — preview stays empty
      }
    }

    loadWidget();

    return () => {
      cancelled = true;
      document.getElementById(WIDGET_SCRIPT_ID)?.remove();
      document.getElementById(WIDGET_ROOT_ID)?.remove();
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white ${className}`}
    >
      <div className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs text-zinc-400">Preview — your website</span>
        </div>
      </div>
      <div className="px-8 py-12">
        <h3 className="text-lg font-semibold text-zinc-900">Welcome to your store</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
          This is a sandbox page. Click the chat bubble in the corner to talk to your AI assistant
          exactly as customers will on your real site.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-lg bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

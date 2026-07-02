import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Widget from './Widget';
import { setApiBaseUrl } from './lib/api';
import './widget.css';

const CONTAINER_ID = 'ai-support-widget-root';

function getCurrentScript(): HTMLScriptElement | null {
  const scripts = document.querySelectorAll('script[data-widget-key]');
  return scripts[scripts.length - 1] as HTMLScriptElement | null;
}

function init(): void {
  const script = document.currentScript as HTMLScriptElement | null ?? getCurrentScript();
  const widgetKey = script?.getAttribute('data-widget-key');

  if (!widgetKey) {
    console.error('[widget] Missing data-widget-key on script tag');
    return;
  }

  const apiUrl =
    script?.getAttribute('data-api-url') ??
    (script?.src ? new URL(script.src).origin : 'http://localhost:5000');

  setApiBaseUrl(apiUrl);

  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(createElement(Widget, { widgetKey }));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

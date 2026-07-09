import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const STORAGE_KEY = 'supportdesk-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-ink-200/80 bg-white/95 p-4 shadow-card-hover backdrop-blur-xl md:bottom-5 md:left-5 md:right-auto md:max-w-sm md:rounded-2xl md:border">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">Cookies & local storage</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
            We use essential storage for sign-in and preferences. Read our{' '}
            <Link to="/data" className="font-medium text-accent-700 hover:underline">
              data notice
            </Link>{' '}
            for details.
          </p>
          <button type="button" onClick={accept} className="btn-primary mt-3 px-4 py-2 text-xs">
            Got it
          </button>
        </div>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 text-ink-400 hover:text-ink-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  description,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <div className="bg-mesh-subtle">
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ink-500">{description}</p>
          <p className="mt-4 text-xs text-ink-400">Last updated: {lastUpdated}</p>
        </header>

        <article className="legal-prose card p-6 md:p-8">{children}</article>

        <p className="mt-8 text-center text-xs text-ink-400">
          See also{' '}
          <Link to="/privacy" className="text-accent-700 hover:underline">Privacy</Link>
          {' · '}
          <Link to="/terms" className="text-accent-700 hover:underline">Terms</Link>
          {' · '}
          <Link to="/data" className="text-accent-700 hover:underline">Data & consent</Link>
        </p>
      </div>
    </div>
  );
}

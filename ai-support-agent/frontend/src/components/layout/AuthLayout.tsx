import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="hidden w-2/5 flex-col justify-between border-r border-ink-200 bg-ink-950 p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2 text-white hover:opacity-90">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-semibold">SupportDesk</span>
        </Link>
        <p className="max-w-sm text-sm leading-relaxed text-ink-300">
          Upload your docs, embed a chat widget, and let AI handle routine support — with handoff to your team when needed.
        </p>
        <p className="text-xs text-ink-500">
          © {new Date().getFullYear()} SupportDesk ·{' '}
          <Link to="/privacy" className="hover:text-ink-300">Privacy</Link>
          {' · '}
          <Link to="/terms" className="hover:text-ink-300">Terms</Link>
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-ink-900" />
            <span className="text-sm font-semibold text-ink-900">SupportDesk</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-8 text-xs text-ink-400">
          <Link to="/" className="hover:text-ink-600">Home</Link>
          {' · '}
          <Link to="/login" className="hover:text-ink-600">Business</Link>
          {' · '}
          <Link to="/agent" className="hover:text-ink-600">Agent portal</Link>
        </p>
      </div>
    </div>
  );
}

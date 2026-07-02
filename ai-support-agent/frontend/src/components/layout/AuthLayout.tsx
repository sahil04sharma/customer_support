import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-950 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">SupportDesk</span>
        </div>

        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            AI support that knows your business
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
            Upload your docs, embed a chat widget, and let AI answer customers — with seamless
            handoff to your team when needed.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Answers from your FAQ & policies
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Embeddable chat for any website
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Human agents for complex issues
            </li>
          </ul>
        </div>

        <p className="text-xs text-zinc-600">© SupportDesk</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-zinc-900">SupportDesk</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
            <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          <Link to="/login" className="hover:text-zinc-600">Business</Link>
          {' · '}
          <Link to="/agent" className="hover:text-zinc-600">Agent portal</Link>
        </p>
      </div>
    </div>
  );
}

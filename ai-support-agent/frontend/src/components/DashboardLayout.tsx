import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Code2,
  FileText,
  HelpCircle,
  LogOut,
  KeyRound,
  MessageSquare,
  MessageSquareText,
  Settings,
  Users,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: BarChart3, exact: true },
  { to: '/dashboard/getting-started', label: 'Getting started', icon: HelpCircle },
  { to: '/dashboard/documents', label: 'Knowledge base', icon: FileText },
  { to: '/dashboard/ai', label: 'AI providers', icon: KeyRound },
  { to: '/dashboard/conversations', label: 'Conversations', icon: MessageSquareText },
  { to: '/dashboard/agents', label: 'Team', icon: Users },
  { to: '/dashboard/settings', label: 'Widget', icon: Settings },
  { to: '/dashboard/embed', label: 'Install', icon: Code2 },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  function isActive(path: string, exact?: boolean) {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-ink-200/60 bg-white">
        <div className="flex h-14 items-center gap-2.5 border-b border-ink-100 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-900">
            <MessageSquare className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-ink-900">SupportDesk</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
              >
                <Icon className={`nav-icon h-4 w-4 shrink-0 ${active ? '' : 'text-ink-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-100 p-3">
          <div className="mb-2 truncate px-2 py-1.5">
            <p className="truncate text-sm font-medium text-ink-900">{user?.name}</p>
            <p className="truncate text-xs text-ink-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

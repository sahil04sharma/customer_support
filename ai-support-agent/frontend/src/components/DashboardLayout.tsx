import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Code2,
  FileText,
  LogOut,
  MessageSquare,
  MessageSquareText,
  Settings,
  Users,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: BarChart3, exact: true },
  { to: '/dashboard/documents', label: 'Knowledge base', icon: FileText },
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
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-zinc-200/80 bg-white">
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-200/80 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-zinc-900">SupportDesk</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-zinc-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200/80 p-3">
          <div className="mb-2 rounded-lg bg-zinc-50 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-zinc-900">{user?.name}</p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div className="mx-auto max-w-6xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

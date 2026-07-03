import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, BarChart3, LogOut, Shield, Activity } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const navItems = [
  { to: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { to: '/admin/businesses', label: 'Businesses', icon: Building2 },
  { to: '/admin/usage', label: 'Usage & cost', icon: Activity },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAdminAuth();

  function isActive(path: string, exact?: boolean) {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Operator</p>
            <p className="text-xs text-zinc-500">Platform admin</p>
          </div>
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
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <div className="mb-2 rounded-lg bg-zinc-800/80 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div className="mx-auto max-w-7xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

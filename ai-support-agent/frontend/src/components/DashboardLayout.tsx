import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/documents', label: 'Documents' },
  { to: '/dashboard/conversations', label: 'Conversations' },
  { to: '/dashboard/agents', label: 'Agents' },
  { to: '/dashboard/settings', label: 'Settings' },
  { to: '/dashboard/embed', label: 'Embed Code' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-slate-200 p-6">
        <h1 className="text-lg font-bold text-blue-700 mb-1">Support Agent</h1>
        <p className="text-sm text-slate-500 mb-8">{user?.name}</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block px-3 py-2 rounded-lg text-sm ${
                location.pathname === item.to
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-8 text-sm text-red-600 hover:text-red-700"
        >
          Log out
        </button>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

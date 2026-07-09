import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#pricing', label: 'Pricing' },
];

const legalLinks = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/data', label: 'Data & consent' },
];

export default function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  function navTo(path: string) {
    setMenuOpen(false);
    if (path.startsWith('/#') && isHome) {
      const id = path.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink-900">
      <header className="sticky top-0 z-40 border-b border-ink-200/40 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ink-900 to-ink-700 shadow-sm transition-transform group-hover:scale-105">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">SupportDesk</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) =>
              link.to.startsWith('/#') ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => {
                    if (isHome) {
                      e.preventDefault();
                      navTo(link.to);
                    }
                  }}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100/60 hover:text-ink-900"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100/60 hover:text-ink-900"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100/60 hover:text-ink-900"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary px-5 py-2.5 text-sm shadow-sm">
              Get started free
            </Link>
          </div>

          <button
            type="button"
            className="rounded-xl p-2.5 text-ink-600 transition-colors hover:bg-ink-100/60 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-ink-100 bg-white/95 px-5 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-2 border-ink-100" />
              <Link
                to="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary mt-1 text-center text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-200/40 bg-ink-950 text-ink-300">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-white">SupportDesk</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
                AI customer support for small teams. Upload your knowledge base, embed a chat widget,
                and escalate to humans when it matters.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">Product</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href="/#features" className="transition-colors hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="transition-colors hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/register" className="transition-colors hover:text-white">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link to="/agent" className="transition-colors hover:text-white">
                    Agent portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">Legal</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {legalLinks.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-ink-800 pt-8 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SupportDesk. All rights reserved.</p>
            <p>
              Questions?{' '}
              <a
                href="mailto:support@supportdesk.app"
                className="text-ink-300 transition-colors hover:text-white"
              >
                support@supportdesk.app
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

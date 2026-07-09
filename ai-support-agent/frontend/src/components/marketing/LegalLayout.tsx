import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface LegalSection {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
  children: React.ReactNode;
}

const relatedPages = [
  {
    to: '/privacy',
    label: 'Privacy Policy',
    description: 'What we collect and how we protect it.',
    icon: Shield,
  },
  {
    to: '/terms',
    label: 'Terms of Service',
    description: 'The rules for using SupportDesk.',
    icon: Scale,
  },
  {
    to: '/data',
    label: 'Data & consent',
    description: 'Plain-language guide for you and your customers.',
    icon: FileText,
  },
];

export default function LegalLayout({
  title,
  description,
  lastUpdated,
  sections,
  children,
}: LegalLayoutProps) {
  const location = useLocation();
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  }

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden border-b border-ink-200/40">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute inset-0 bg-dot-grid bg-[length:24px_24px] opacity-30" />

        <div className="relative mx-auto max-w-6xl px-5 py-10 md:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-ink-500 transition-colors hover:bg-white/60 hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-6 max-w-2xl">
            <p className="marketing-section-label">Legal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-950 md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-600">{description}</p>
            <p className="mt-4 inline-flex rounded-full border border-ink-200/80 bg-white/70 px-3 py-1 text-xs text-ink-500 backdrop-blur-sm">
              Last updated {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
                On this page
              </p>
              <ul className="mt-4 space-y-1 border-l border-ink-200">
                {sections.map(({ id, title: sectionTitle }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(id)}
                      className={`block w-full border-l-2 py-1.5 pl-4 text-left text-sm transition-colors ${
                        activeId === id
                          ? 'border-accent-600 font-medium text-ink-900'
                          : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700'
                      }`}
                    >
                      {sectionTitle}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="legal-prose min-w-0 space-y-5">{children}</article>
        </div>

        {/* Related */}
        <div className="mt-16 border-t border-ink-200/60 pt-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
            Related documents
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {relatedPages
              .filter((p) => p.to !== location.pathname)
              .map(({ to, label, description: desc, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="marketing-card group flex flex-col p-5 no-underline"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-700 transition-colors group-hover:bg-ink-900 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink-900">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500">{desc}</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="legal-section scroll-mt-24">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function LegalCallout({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'important';
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${
        variant === 'important'
          ? 'border-accent-200/80 bg-accent-50/50 text-ink-800'
          : 'border-ink-200/80 bg-ink-50/60 text-ink-700'
      }`}
    >
      {children}
    </div>
  );
}

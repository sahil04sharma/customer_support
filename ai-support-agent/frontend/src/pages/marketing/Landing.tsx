import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  Headphones,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Knowledge-base AI',
    description:
      'Upload PDFs and docs. Answers are grounded in your content — not generic chatbot guesses.',
    span: 'md:col-span-2',
    accent: 'from-accent-500/10 to-accent-600/5',
  },
  {
    icon: Headphones,
    title: 'Human handoff',
    description:
      'When AI is unsure, conversations escalate to your team with a real-time agent inbox.',
    span: '',
    accent: 'from-ink-900/5 to-ink-900/0',
  },
  {
    icon: MessageSquare,
    title: 'Embeddable widget',
    description:
      'One script tag on your site. Customize colors, copy, and allowed domains from the dashboard.',
    span: '',
    accent: 'from-ink-900/5 to-ink-900/0',
  },
  {
    icon: Shield,
    title: 'Your data, your control',
    description:
      'Tenant isolation, encrypted API keys, domain allowlists, and clear data disclosures.',
    span: 'md:col-span-2',
    accent: 'from-accent-500/10 to-accent-600/5',
  },
];

const steps = [
  {
    step: '01',
    title: 'Upload docs',
    text: 'Add your FAQs, policies, and product guides to the knowledge base.',
  },
  {
    step: '02',
    title: 'Embed widget',
    text: 'Copy one snippet into your website or app — live in minutes.',
  },
  {
    step: '03',
    title: 'AI + humans',
    text: 'Customers chat with AI; your team steps in when it matters.',
  },
];

const stats = [
  { value: '24/7', label: 'AI availability' },
  { value: '< 2 min', label: 'Setup time' },
  { value: '150', label: 'Free replies/mo' },
  { value: '1 line', label: 'To embed' },
];

const freePlanFeatures = [
  '150 hosted AI replies / month',
  'Up to 10 knowledge-base documents',
  'Up to 3 support agents',
  'Embeddable chat widget',
  'Human escalation & agent inbox',
];

const byokPlanFeatures = [
  'OpenAI, Anthropic, Groq, or Gemini for chat',
  'OpenAI or Gemini for document embeddings',
  'Keys encrypted at rest',
  'Same free doc & agent limits',
  'Pro plan with hosted limits — coming soon',
];

function HeroChatMockup() {
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent-400/20 via-transparent to-ink-900/5 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card-hover">
        <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/60 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 flex-1 rounded-md bg-white/80 px-2 py-0.5 text-center text-[10px] text-ink-400">
            your-site.com
          </span>
        </div>

        <div className="grid md:grid-cols-5">
          <div className="hidden bg-gradient-to-br from-ink-50 to-white p-6 md:col-span-3 md:block">
            <div className="h-28 rounded-xl bg-gradient-to-br from-ink-100 to-ink-50" />
            <div className="mt-4 space-y-2.5">
              <div className="h-2 w-[85%] rounded-full bg-ink-100" />
              <div className="h-2 w-[65%] rounded-full bg-ink-100" />
              <div className="h-2 w-[75%] rounded-full bg-ink-100" />
            </div>
          </div>

          <div className="border-t border-ink-100 p-4 md:col-span-2 md:border-l md:border-t-0">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-700 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-900">Support Assistant</p>
                  <p className="flex items-center gap-1 text-[10px] text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />
                    Online
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-ink-900 px-3 py-2 text-[11px] leading-relaxed text-white">
                How do I reset my password?
              </div>
              <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-ink-100 bg-ink-50 px-3 py-2 text-[11px] leading-relaxed text-ink-700">
                Go to <span className="font-medium">Settings → Security → Reset password</span>.
                You&apos;ll get an email within 2 minutes.
              </div>
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-ink-900 px-3 py-2 text-[11px] leading-relaxed text-white">
                What if I don&apos;t get the email?
              </div>
              <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[11px] leading-relaxed text-ink-700">
                <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-amber-700">
                  <Headphones className="h-3 w-3" />
                  Connecting to agent…
                </span>
                Let me connect you with our team for account recovery.
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2">
              <span className="flex-1 text-[10px] text-ink-300">Type a message…</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-600">
                <ArrowRight className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-200/40">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute inset-0 bg-dot-grid bg-[length:24px_24px] opacity-40" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="animate-slide-up">
              <p className="marketing-badge">
                <Sparkles className="h-3.5 w-3.5 text-accent-600" />
                Free tier live · BYOK supported
              </p>

              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-ink-950 md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                AI support that actually knows{' '}
                <span className="bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent">
                  your business
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600 md:text-lg">
                Turn your documentation into a 24/7 support assistant — with seamless escalation
                to your team when customers need a human.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/register"
                  className="btn-primary gap-2 px-7 py-3 text-base shadow-lg shadow-ink-900/10"
                >
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-secondary px-7 py-3 text-base">
                  Sign in
                </Link>
              </div>

              <p className="mt-5 text-xs text-ink-400">
                No credit card · 150 AI replies/mo on free plan ·{' '}
                <Link to="/data" className="text-accent-600 underline-offset-2 hover:underline">
                  How we handle data
                </Link>
              </p>
            </div>

            <div className="animate-fade-in lg:pl-4">
              <HeroChatMockup />
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200/60 bg-ink-200/60 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/90 px-5 py-5 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold tracking-tight text-ink-900">{s.value}</p>
                <p className="mt-0.5 text-xs text-ink-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — bento grid */}
      <section id="features" className="scroll-mt-20 border-b border-ink-200/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-section-label">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950 md:text-4xl">
              Built for real support teams
            </h2>
            <p className="mt-3 text-base text-ink-500">
              Not a generic chatbot — a doc-trained assistant with escalation and analytics.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`marketing-card group relative overflow-hidden p-7 ${f.span}`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-ink-900">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-b border-ink-200/40 bg-ink-950 py-20 text-white md:py-28"
      >
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-section-label text-accent-400">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Live in three steps
            </h2>
            <p className="mt-3 text-base text-ink-300">
              From docs to deployed widget — most teams are up and running in under ten minutes.
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
            <div className="absolute left-[16.67%] right-[16.67%] top-8 hidden h-px bg-gradient-to-r from-transparent via-ink-700 to-transparent md:block" />

            {steps.map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-ink-700 bg-ink-900 text-lg font-bold text-accent-400 shadow-lg">
                  {s.step}
                </div>
                <h3 className="mt-6 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-section-label">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950 md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-base text-ink-500">
              Start free. Bring your own AI keys when you scale.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="marketing-card flex flex-col p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Free</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-ink-950">$0</span>
                <span className="text-sm text-ink-500">/month</span>
              </div>
              <p className="mt-1 text-sm text-ink-500">Everything you need to get started</p>

              <ul className="mt-8 flex-1 space-y-3">
                {freePlanFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/register" className="btn-primary mt-8 w-full py-3">
                Get started free
              </Link>
            </div>

            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-accent-300/60 bg-gradient-to-br from-accent-50/80 via-white to-white p-8 shadow-glow">
              <div className="absolute right-4 top-4 rounded-full bg-accent-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Popular
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-700">
                Bring your keys
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Zap className="h-8 w-8 text-accent-600" />
                <span className="text-2xl font-bold text-ink-950">BYOK</span>
              </div>
              <p className="mt-1 text-sm text-ink-500">Unlimited AI via your provider</p>

              <ul className="mt-8 flex-1 space-y-3">
                {byokPlanFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/register" className="btn-secondary mt-8 w-full border-accent-200 py-3 hover:bg-accent-50">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-200/40 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950 py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to support customers smarter?
          </h2>
          <p className="mt-4 text-base text-ink-300">
            Set up in minutes. Upload docs, embed the widget, and go live.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-ink-900 shadow-lg shadow-black/20 transition-colors hover:bg-ink-50"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

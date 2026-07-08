import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
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
  },
  {
    icon: Headphones,
    title: 'Human handoff',
    description:
      'When AI is unsure, conversations escalate to your team with a real-time agent inbox.',
  },
  {
    icon: MessageSquare,
    title: 'Embeddable widget',
    description:
      'One script tag on your site. Customize colors, copy, and allowed domains from the dashboard.',
  },
  {
    icon: Shield,
    title: 'Your data, your control',
    description:
      'Tenant isolation, encrypted API keys, domain allowlists, and clear data disclosures.',
  },
];

const steps = [
  { step: '1', title: 'Upload docs', text: 'Add your FAQs, policies, and product guides.' },
  { step: '2', title: 'Embed widget', text: 'Copy the snippet into your website or app.' },
  { step: '3', title: 'AI + humans', text: 'Customers chat with AI; your team steps in when needed.' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-200/60 bg-mesh-subtle">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50/80 px-3 py-1 text-xs font-medium text-accent-800">
              <Sparkles className="h-3.5 w-3.5" />
              Free tier live · BYOK supported
            </p>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink-900 md:text-5xl md:leading-tight">
              AI support that knows
              <span className="text-accent-700"> your business</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-600 md:text-lg">
              SupportDesk turns your documentation into a 24/7 support assistant — with seamless
              escalation to your team when customers need a human.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary gap-2 px-6 py-2.5">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-2.5">
                Sign in
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              No credit card · 150 AI replies/mo on free plan ·{' '}
              <Link to="/data" className="text-ink-500 underline-offset-2 hover:underline">
                How we handle data
              </Link>
            </p>
          </div>

          {/* Mock product preview */}
          <div className="mx-auto mt-14 max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
              <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/80 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-2 text-xs text-ink-400">your-site.com</span>
              </div>
              <div className="grid gap-0 md:grid-cols-5">
                <div className="hidden bg-ink-50/50 p-6 md:col-span-3 md:block">
                  <div className="h-32 rounded-lg bg-ink-100/80" />
                  <div className="mt-4 space-y-2">
                    <div className="h-2 w-[80%] rounded bg-ink-100" />
                    <div className="h-2 w-[60%] rounded bg-ink-100" />
                  </div>
                </div>
                <div className="border-t border-ink-100 p-4 md:col-span-2 md:border-l md:border-t-0">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-ink-900">Support Assistant</span>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-lg rounded-tl-sm bg-ink-100 px-3 py-2 text-xs text-ink-700">
                      How do I reset my password?
                    </div>
                    <div className="rounded-lg rounded-tr-sm border border-ink-200 bg-white px-3 py-2 text-xs text-ink-700">
                      Go to Settings → Security → Reset password. You&apos;ll get an email within 2 minutes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-b border-ink-200/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-ink-900">Built for real support teams</h2>
            <p className="mt-2 text-sm text-ink-500">
              Not a generic chatbot — a doc-trained assistant with escalation and analytics.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card p-6 transition-shadow hover:shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-ink-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-b border-ink-200/60 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-2xl font-semibold text-ink-900">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                  {s.step}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-ink-900">Simple pricing</h2>
            <p className="mt-2 text-sm text-ink-500">Start free. Bring your own AI keys when you scale.</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Free</p>
              <p className="mt-2 text-3xl font-semibold text-ink-900">$0</p>
              <p className="text-sm text-ink-500">per month</p>
              <ul className="mt-6 space-y-3 text-sm text-ink-600">
                <li>150 hosted AI replies / month</li>
                <li>Up to 10 knowledge-base documents</li>
                <li>Up to 3 support agents</li>
                <li>Embeddable chat widget</li>
                <li>Human escalation & agent inbox</li>
              </ul>
              <Link to="/register" className="btn-primary mt-8 w-full">
                Get started
              </Link>
            </div>

            <div className="card border-accent-200/60 bg-accent-50/20 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">Bring your keys</p>
              <p className="mt-2 text-3xl font-semibold text-ink-900">
                <Zap className="mb-1 inline h-7 w-7 text-accent-600" />
              </p>
              <p className="text-sm text-ink-500">Unlimited AI via your provider</p>
              <ul className="mt-6 space-y-3 text-sm text-ink-600">
                <li>OpenAI, Anthropic, Groq, or Gemini for chat</li>
                <li>OpenAI or Gemini for document embeddings</li>
                <li>Keys encrypted at rest</li>
                <li>Same free doc & agent limits</li>
                <li>Pro plan with hosted limits — coming soon</li>
              </ul>
              <Link to="/register" className="btn-secondary mt-8 w-full">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-200/60 bg-ink-950 py-16 text-white">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="text-2xl font-semibold">Ready to support customers smarter?</h2>
          <p className="mt-3 text-sm text-ink-300">
            Set up in minutes. Upload docs, embed the widget, and go live.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-100"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

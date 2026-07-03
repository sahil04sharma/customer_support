import { Link } from 'react-router-dom';
import {
  BarChart3,
  Code2,
  FileText,
  MessageSquare,
  MessageSquareText,
  Settings,
  Users,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import WidgetPreview from '../../components/WidgetPreview';

const walkthrough = [
  {
    step: 1,
    title: 'Upload your knowledge base',
    description:
      'Add PDF or TXT files with FAQs, policies, and product info. The AI only answers from what you upload.',
    to: '/dashboard/documents',
    label: 'Knowledge base',
    icon: FileText,
  },
  {
    step: 2,
    title: 'Customize the widget',
    description:
      'Set your brand color, welcome message, and when to hand off to a human agent.',
    to: '/dashboard/settings',
    label: 'Widget settings',
    icon: Settings,
  },
  {
    step: 3,
    title: 'Install on your website',
    description:
      'Copy one line of code and paste it before </body> on your site. Works with WordPress, Shopify, and any HTML page.',
    to: '/dashboard/embed',
    label: 'Install',
    icon: Code2,
  },
  {
    step: 4,
    title: 'Test before you go live',
    description:
      'Use the in-app preview to chat with your assistant — no need to edit code or open developer tools.',
    to: '/dashboard/test',
    label: 'Test assistant',
    icon: MessageSquare,
  },
  {
    step: 5,
    title: 'Invite your team (optional)',
    description:
      'Add support agents who take over when the AI escalates a conversation.',
    to: '/dashboard/agents',
    label: 'Team',
    icon: Users,
  },
  {
    step: 6,
    title: 'Monitor conversations',
    description:
      'Track chats, reply when needed, and see analytics on the overview page.',
    to: '/dashboard/conversations',
    label: 'Conversations',
    icon: MessageSquareText,
  },
];

const faq = [
  {
    q: 'What is a widget key?',
    a: 'A unique ID for your business embedded in the install code. It tells our servers which knowledge base and settings to use. You never share it publicly — it lives in your website code.',
  },
  {
    q: 'Why do I need to upload documents?',
    a: 'The AI does not know your business by default. It searches your uploaded content to answer customer questions accurately. More relevant docs = better answers.',
  },
  {
    q: 'When does a human take over?',
    a: 'When the AI is not confident enough (based on your escalation threshold in Widget settings), or when a customer asks for a person. Escalated chats appear in Conversations and your agent portal.',
  },
  {
    q: 'Local vs production — what URL do I use?',
    a: 'During development, the embed code points to localhost. After you deploy (Phase 8), update VITE_API_URL and use your production API URL in the script. The dashboard Install page always shows the correct URL for your current setup.',
  },
];

export default function GettingStarted() {
  return (
    <div>
      <PageHeader
        title="Getting started"
        description="Everything you need to set up SupportDesk and launch your AI assistant."
      />

      <div className="mb-8 card p-6">
        <h3 className="font-semibold text-zinc-900">Recommended setup order</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Complete these steps in order for the smoothest launch.
        </p>
        <div className="mt-6 space-y-4">
          {walkthrough.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {item.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-zinc-900">{item.title}</h4>
                    <Link
                      to={item.to}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label} →
                    </Link>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-semibold text-zinc-900">Dashboard sections</h3>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li className="flex gap-2">
              <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                <strong className="text-zinc-900">Overview</strong> — resolved chats, escalations, and
                response times.
              </span>
            </li>
            <li className="flex gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                <strong className="text-zinc-900">Knowledge base</strong> — upload and manage training
                documents.
              </span>
            </li>
            <li className="flex gap-2">
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                <strong className="text-zinc-900">Conversations</strong> — read and reply to customer
                chats.
              </span>
            </li>
            <li className="flex gap-2">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                <strong className="text-zinc-900">Team</strong> — invite agents for escalated chats.
              </span>
            </li>
            <li className="flex gap-2">
              <Settings className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                <strong className="text-zinc-900">Widget</strong> — appearance and escalation behavior.
              </span>
            </li>
            <li className="flex gap-2">
              <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                <strong className="text-zinc-900">Install</strong> — embed code for your website.
              </span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-semibold text-zinc-900">FAQ</h3>
          <div className="space-y-5">
            {faq.map((item) => (
              <div key={item.q}>
                <p className="text-sm font-medium text-zinc-900">{item.q}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="font-semibold text-zinc-900">Quick test</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Try your assistant right here, or open the full test page.
            </p>
          </div>
          <Link to="/dashboard/test" className="btn-primary text-sm">
            Open full test page
          </Link>
        </div>
        <WidgetPreview className="min-h-[280px]" />
      </div>
    </div>
  );
}

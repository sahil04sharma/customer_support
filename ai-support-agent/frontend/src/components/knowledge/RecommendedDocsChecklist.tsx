import {
  BookOpen,
  Clock,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  Wrench,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { RECOMMENDED_DOCS } from '../../lib/knowledgeBase';

const icons: Record<string, typeof HelpCircle> = {
  faq: HelpCircle,
  refund: Package,
  shipping: MapPin,
  pricing: CreditCard,
  product: BookOpen,
  contact: Clock,
  troubleshooting: Wrench,
};

interface RecommendedDocsChecklistProps {
  coverage: Record<string, boolean>;
}

export default function RecommendedDocsChecklist({ coverage }: RecommendedDocsChecklistProps) {
  const coveredCount = RECOMMENDED_DOCS.filter((d) => coverage[d.id]).length;

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-zinc-900">Recommended content</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Upload documents covering these topics for the best customer experience.
          </p>
        </div>
        <Badge variant={coveredCount >= 4 ? 'success' : 'neutral'}>
          {coveredCount} of {RECOMMENDED_DOCS.length} likely covered
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {RECOMMENDED_DOCS.map((doc) => {
          const Icon = icons[doc.id] ?? HelpCircle;
          const covered = coverage[doc.id];

          return (
            <div
              key={doc.id}
              className={`flex gap-3 rounded-lg border p-4 ${
                covered ? 'border-emerald-200/80 bg-emerald-50/40' : 'border-zinc-200 bg-zinc-50/50'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  covered ? 'bg-emerald-100' : 'bg-zinc-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${covered ? 'text-emerald-600' : 'text-zinc-500'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900">{doc.title}</p>
                  <Badge variant={covered ? 'success' : 'neutral'}>
                    {covered ? 'Likely covered' : 'Not detected'}
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{doc.why}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Coverage is guessed from file names. Rename files with clear keywords (e.g. &quot;shipping-policy.pdf&quot;) or
        upload dedicated docs for each topic.
      </p>
    </div>
  );
}

import {
  READINESS_DESCRIPTIONS,
  READINESS_LABELS,
  READINESS_STEPS,
  type DocumentsSummary,
} from '../../lib/knowledgeBase';

interface ReadinessMeterProps {
  summary: DocumentsSummary;
}

const stepColors: Record<string, string> = {
  active: 'bg-emerald-500',
  current: 'bg-amber-500',
  empty: 'bg-zinc-200',
};

function segmentClass(current: string, index: number): string {
  const currentIndex = READINESS_STEPS.indexOf(current as (typeof READINESS_STEPS)[number]);
  if (index < currentIndex) return stepColors.active;
  if (index === currentIndex) {
    return current === 'EMPTY' || current === 'LOW' ? stepColors.current : stepColors.active;
  }
  return stepColors.empty;
}

export default function ReadinessMeter({ summary }: ReadinessMeterProps) {
  const { readinessLevel, readyDocuments, totalChunks } = summary;

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-900">Knowledge readiness</h3>
          <p className="mt-1 text-sm text-zinc-500">{READINESS_DESCRIPTIONS[readinessLevel]}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium text-zinc-900">
            {readyDocuments} ready doc{readyDocuments !== 1 ? 's' : ''} · {totalChunks} chunk
            {totalChunks !== 1 ? 's' : ''}
          </p>
          <p className="mt-0.5 text-zinc-500">Level: {READINESS_LABELS[readinessLevel]}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex gap-1.5">
          {READINESS_STEPS.map((step, index) => (
            <div key={step} className="flex-1">
              <div
                className={`h-2 rounded-full transition-colors ${segmentClass(readinessLevel, index)}`}
              />
              <p className="mt-2 text-center text-xs text-zinc-500">{READINESS_LABELS[step]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

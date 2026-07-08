import { Link } from 'react-router-dom';
import { Check, Circle, X } from 'lucide-react';
import {
  countCompletedSteps,
  isStepComplete,
  ONBOARDING_STEPS,
  type OnboardingStatus,
} from '../lib/onboarding';

interface OnboardingChecklistProps {
  status: OnboardingStatus;
  tested: boolean;
  onDismiss: () => void;
}

export default function OnboardingChecklist({
  status,
  tested,
  onDismiss,
}: OnboardingChecklistProps) {
  const completed = countCompletedSteps(status, tested);
  const total = ONBOARDING_STEPS.length;
  const allDone = completed === total;

  return (
    <div className="card relative p-4">
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-8">
        <p className="text-sm font-medium text-ink-900">
          {allDone ? 'Setup complete' : `Getting started (${completed}/${total})`}
        </p>
        {!allDone && (
          <p className="mt-0.5 text-xs text-ink-500">Finish these steps to go live.</p>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {ONBOARDING_STEPS.map((step) => {
          const done = isStepComplete(step.id, status, tested);
          return (
            <div
              key={step.id}
              className="flex items-center justify-between gap-3 rounded-md border border-ink-100 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                {done ? (
                  <Check className="h-4 w-4 shrink-0 text-accent-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-ink-300" />
                )}
                <span className={`text-sm ${done ? 'text-ink-400 line-through' : 'text-ink-800'}`}>
                  {step.title}
                </span>
              </div>
              {!done && (
                <Link to={step.to} className="btn-secondary shrink-0 px-2 py-1 text-xs">
                  {step.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

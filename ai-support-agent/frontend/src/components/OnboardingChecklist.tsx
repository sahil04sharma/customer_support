import { Link } from 'react-router-dom';
import { Check, Circle, PartyPopper, X } from 'lucide-react';
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
  const progress = Math.round((completed / total) * 100);
  const allDone = completed === total;

  return (
    <div className="card relative overflow-hidden p-6">
      <button
        onClick={onDismiss}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        aria-label="Dismiss checklist"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-wrap items-start gap-6 pr-8">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e4e4e7" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={allDone ? '#10b981' : '#18181b'}
              strokeWidth="3"
              strokeDasharray={`${progress} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-semibold text-zinc-900">
            {completed}/{total}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {allDone ? (
            <>
              <div className="flex items-center gap-2">
                <PartyPopper className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-zinc-900">You&apos;re live!</h3>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                All setup steps are complete. Your assistant is ready for customers.
              </p>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-zinc-900">Getting started</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Follow these steps to launch your AI support assistant. Most businesses finish in
                under 15 minutes.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {ONBOARDING_STEPS.map((step) => {
          const done = isStepComplete(step.id, status, tested);

          return (
            <div
              key={step.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
                done ? 'border-emerald-200/80 bg-emerald-50/40' : 'border-zinc-200 bg-zinc-50/50'
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {done ? (
                    <Check className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-300" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${done ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{step.description}</p>
                </div>
              </div>
              {!done && (
                <Link to={step.to} className="btn-primary shrink-0 text-xs">
                  {step.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Need more help?{' '}
        <Link to="/dashboard/getting-started" className="text-zinc-600 underline hover:text-zinc-900">
          Open the full guide
        </Link>
      </p>
    </div>
  );
}

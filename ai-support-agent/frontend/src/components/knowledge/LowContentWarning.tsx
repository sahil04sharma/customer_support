import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LowContentWarningProps {
  className?: string;
  showLink?: boolean;
}

export default function LowContentWarning({
  className = '',
  showLink = true,
}: LowContentWarningProps) {
  return (
    <div
      className={`rounded-xl border border-amber-200/80 bg-amber-50/80 px-5 py-4 ${className}`}
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">Add more content for better answers</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-800/90">
            Your AI can only answer from what you upload. With limited content, customers may get
            vague or incomplete replies.
          </p>
          {showLink && (
            <Link
              to="/dashboard/documents"
              className="mt-2 inline-block text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950"
            >
              Go to Knowledge base →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

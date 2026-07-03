import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import WidgetPreview from '../../components/WidgetPreview';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';

export default function TestAssistant() {
  const { markTested, refresh } = useOnboardingProgress();

  useEffect(() => {
    markTested();
    refresh();
  }, [markTested, refresh]);

  return (
    <div>
      <PageHeader
        title="Test your assistant"
        description="Chat with your AI in a live preview — the same experience your customers will have."
      />

      <div className="mb-6 rounded-xl border border-blue-200/60 bg-blue-50/50 px-5 py-4">
        <p className="text-sm font-medium text-blue-900">How to test</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-blue-800/90">
          <li>Make sure you have at least one READY document in your knowledge base.</li>
          <li>Click the chat bubble in the bottom corner of the preview below.</li>
          <li>Ask a question your docs can answer, then try something off-topic to see escalation.</li>
        </ol>
        <p className="mt-3 text-sm text-blue-800/80">
          No documents yet?{' '}
          <Link to="/dashboard/documents" className="font-medium underline">
            Upload your knowledge base first
          </Link>
          .
        </p>
      </div>

      <WidgetPreview className="min-h-[360px]" />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <p className="flex items-center gap-2 text-sm text-zinc-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Opening this page marks the &quot;Test your assistant&quot; setup step complete.
        </p>
        <Link to="/dashboard/embed" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Ready to install? Get embed code →
        </Link>
      </div>
    </div>
  );
}

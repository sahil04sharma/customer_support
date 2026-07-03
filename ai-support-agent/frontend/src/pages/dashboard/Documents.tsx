import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, RefreshCw, Trash2, Upload } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LowContentWarning from '../../components/knowledge/LowContentWarning';
import ReadinessMeter from '../../components/knowledge/ReadinessMeter';
import RecommendedDocsChecklist from '../../components/knowledge/RecommendedDocsChecklist';
import { api } from '../../lib/api';
import {
  detectRecommendedCoverage,
  isLowReadiness,
  type DocumentRow,
  type DocumentsSummary,
} from '../../lib/knowledgeBase';

const statusVariant = {
  PROCESSING: 'warning' as const,
  READY: 'success' as const,
  FAILED: 'error' as const,
};

const statusLabel = {
  PROCESSING: 'Processing',
  READY: 'Ready',
  FAILED: 'Failed',
};

const defaultSummary: DocumentsSummary = {
  totalDocuments: 0,
  readyDocuments: 0,
  statusCounts: { READY: 0, PROCESSING: 0, FAILED: 0 },
  totalChunks: 0,
  readinessLevel: 'EMPTY',
};

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [summary, setSummary] = useState<DocumentsSummary>(defaultSummary);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(() => {
    Promise.all([
      api.get<DocumentRow[]>('/api/documents'),
      api.get<DocumentsSummary>('/api/documents/summary'),
    ]).then(([docsRes, summaryRes]) => {
      setDocuments(docsRes.data);
      setSummary(summaryRes.data);
    });
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', files[0]);
      try {
        await api.post('/api/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        fetchData();
      } finally {
        setUploading(false);
      }
    },
    [fetchData]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    multiple: false,
    noClick: false,
  });

  async function handleDelete(id: string) {
    await api.delete(`/api/documents/${id}`);
    fetchData();
  }

  const coverage = detectRecommendedCoverage(
    documents.filter((d) => d.status === 'READY').map((d) => d.name)
  );
  const showLowWarning = isLowReadiness(summary.readinessLevel);

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        description="Upload documents your AI uses to answer customers — FAQs, return policies, product guides, and more."
      />

      <div className="mb-6 space-y-6">
        <ReadinessMeter summary={summary} />
        {showLowWarning && <LowContentWarning showLink={false} />}
        <RecommendedDocsChecklist coverage={coverage} />
      </div>

      <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50/80 px-5 py-4">
        <p className="text-sm font-medium text-zinc-900">
          Your AI can only answer from what you upload
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          Add all your support content — PDF or TXT files. You can upload multiple files and the AI
          searches all of them. File names help us suggest what topics you&apos;ve covered.
        </p>
      </div>

      <div
        id="doc-upload"
        {...getRootProps()}
        className={`mb-8 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive
            ? 'border-zinc-900 bg-zinc-50'
            : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
          <Upload className="h-5 w-5 text-zinc-500" />
        </div>
        {uploading ? (
          <p className="text-sm font-medium text-zinc-600">Uploading and processing…</p>
        ) : (
          <>
            <p className="text-sm font-medium text-zinc-900">
              Drop a PDF or TXT file here, or click to browse
            </p>
            <p className="mt-1 text-xs text-zinc-500">Max 10 MB per file</p>
          </>
        )}
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first FAQ or policy document to train your AI assistant."
          action={
            <button
              type="button"
              onClick={() => document.getElementById('doc-upload')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload your first document
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-5 py-3.5 font-medium text-zinc-500">File</th>
                <th className="px-5 py-3.5 font-medium text-zinc-500">Status</th>
                <th className="px-5 py-3.5 font-medium text-zinc-500">Chunks</th>
                <th className="px-5 py-3.5 font-medium text-zinc-500">Uploaded</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="group hover:bg-zinc-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                        <FileText className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div>
                        <span className="font-medium text-zinc-900">{doc.name}</span>
                        {doc.status === 'FAILED' && (
                          <p className="mt-0.5 text-xs text-red-600">
                            Processing failed — try a different file or re-upload.
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant[doc.status]}>{statusLabel[doc.status]}</Badge>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {doc.status === 'READY' ? doc.chunkCount : doc.status === 'PROCESSING' ? '—' : '0'}
                  </td>
                  <td className="px-5 py-4 text-zinc-500">
                    {new Date(doc.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {doc.status === 'FAILED' && (
                        <button
                          onClick={() => open()}
                          className="rounded-lg p-2 text-amber-600 opacity-100 transition-all hover:bg-amber-50"
                          aria-label="Re-upload document"
                          title="Re-upload"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="rounded-lg p-2 text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        aria-label="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Trash2, Upload } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { api } from '../../lib/api';

interface Document {
  id: string;
  name: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: string;
}

const statusVariant = {
  PROCESSING: 'warning' as const,
  READY: 'success' as const,
  FAILED: 'error' as const,
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(() => {
    api.get('/api/documents').then((res) => setDocuments(res.data));
  }, []);

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

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
        fetchDocuments();
      } finally {
        setUploading(false);
      }
    },
    [fetchDocuments]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    multiple: false,
  });

  async function handleDelete(id: string) {
    await api.delete(`/api/documents/${id}`);
    fetchDocuments();
  }

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        description="Upload documents your AI uses to answer customers — FAQs, return policies, product guides, and more."
      />

      <div className="mb-6 rounded-xl border border-blue-200/60 bg-blue-50/50 px-5 py-4">
        <p className="text-sm font-medium text-blue-900">What to upload</p>
        <p className="mt-1 text-sm leading-relaxed text-blue-800/80">
          PDF or TXT files with your support content. You can upload multiple files — the AI
          searches all of them. File names don&apos;t matter; only the text inside is used.
        </p>
      </div>

      <div
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
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-5 py-3.5 font-medium text-zinc-500">File</th>
                <th className="px-5 py-3.5 font-medium text-zinc-500">Status</th>
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
                      <span className="font-medium text-zinc-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant[doc.status]}>{doc.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-zinc-500">
                    {new Date(doc.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="rounded-lg p-2 text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      aria-label="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

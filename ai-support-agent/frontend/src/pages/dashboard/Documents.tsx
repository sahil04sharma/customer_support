import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../lib/api';

interface Document {
  id: string;
  name: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: string;
}

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
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  async function handleDelete(id: string) {
    await api.delete(`/api/documents/${id}`);
    fetchDocuments();
  }

  const statusColor = {
    PROCESSING: 'text-yellow-600 bg-yellow-50',
    READY: 'text-green-600 bg-green-50',
    FAILED: 'text-red-600 bg-red-50',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Documents</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center mb-8 cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>Uploading...</p>
        ) : (
          <p className="text-slate-500">
            Drag & drop a PDF or TXT file here, or click to select
          </p>
        )}
      </div>
      <table className="w-full bg-white rounded-xl border overflow-hidden">
        <thead className="bg-slate-50 text-left text-sm text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Uploaded</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-t">
              <td className="px-4 py-3">{doc.name}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[doc.status]}`}>
                  {doc.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {new Date(doc.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 text-sm hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

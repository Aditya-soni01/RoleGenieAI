import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Trash2, Zap, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import SuccessAlert from '@/components/common/SuccessAlert';
import { authStore } from '@/store/authStore';

interface Resume {
  id: number;
  file_name: string;
  original_content: string;
  optimized_content?: string;
  created_at: string;
}

const ResumePage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = authStore();
  const [successMsg, setSuccessMsg] = useState('');

  const { data: resumes = [], isLoading, error } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => apiClient.get<Resume[]>('/resumes').then((r) => r.data),
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSuccessMsg('Resume uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/resumes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
  });

  const optimizeMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/resumes/${id}/optimize`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSuccessMsg('Resume optimized!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  if (!user) {
    return (
      <div className="p-8">
        <ErrorAlert message="Please log in to access resume management." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Resume Management</h1>
            <p className="text-slate-400 text-sm mt-0.5">Upload and optimize your resumes with AI</p>
          </div>
        </div>

        {successMsg && <SuccessAlert message={successMsg} className="mb-4" />}

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-8 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800 p-10 cursor-pointer hover:border-primary-500 transition-colors"
        >
          <Upload className="h-10 w-10 text-slate-400" />
          <p className="text-slate-300 font-medium">Click to upload resume</p>
          <p className="text-xs text-slate-500">PDF, DOCX, or TXT — max 5 MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploadMutation.isPending && <p className="text-sm text-primary-400">Uploading...</p>}
          {uploadMutation.isError && (
            <ErrorAlert message={(uploadMutation.error as Error).message} />
          )}
        </div>

        {/* Resumes list */}
        {isLoading ? (
          <LoadingSpinner message="Loading resumes..." />
        ) : error ? (
          <ErrorAlert message="Failed to load resumes." />
        ) : resumes.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No resumes uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="rounded-xl border border-slate-700 bg-slate-800 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">{resume.file_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!resume.optimized_content && (
                      <button
                        onClick={() => optimizeMutation.mutate(resume.id)}
                        disabled={optimizeMutation.isPending}
                        className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        AI Optimize
                      </button>
                    )}
                    {resume.optimized_content && (
                      <span className="text-xs text-green-400 font-medium">✓ Optimized</span>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(resume.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {resume.optimized_content && (
                  <div className="mt-3 rounded-lg bg-slate-900/50 p-3">
                    <p className="text-xs font-medium text-green-400 mb-1">Optimized preview</p>
                    <p className="text-xs text-slate-400 line-clamp-3">{resume.optimized_content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePage;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import apiClient from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  experience_level?: string;
  required_skills?: string;
  job_type?: string;
  remote?: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ['job', id],
    queryFn: () => apiClient.get<Job>(`/jobs/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner message="Loading job details..." />;
  if (error || !job) return (
    <div className="p-8">
      <ErrorAlert message="Failed to load job details." />
    </div>
  );

  const skills = (job.required_skills || '').split(',').map((s) => s.trim()).filter(Boolean);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(min || max!);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </button>

        {/* Header */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
          <p className="text-lg text-primary-400 font-medium mb-4">{job.company}</p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" /> {formatSalary(job.salary_min, job.salary_max)}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" /> {job.experience_level || 'Not specified'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {job.job_type || 'Full-time'}
            </span>
            {job.remote && (
              <span className="px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-700 text-xs font-medium">
                Remote
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Job Description</h2>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>

            {skills.length > 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-primary-900/40 text-primary-300 border border-primary-700 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Apply</h3>
              <p className="text-sm text-slate-400 mb-4">
                Use AI to generate a tailored cover letter.
              </p>
              <button className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700 transition-colors">
                Generate Cover Letter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;

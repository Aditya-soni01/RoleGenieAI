import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import { authStore } from '@/store/authStore';

interface Resume {
  id: number;
  file_name?: string;
  original_filename: string;
  optimized_content: string | null;
  created_at: string;
}

interface OptimizedData {
  optimized?: { ats_score_after?: number; ats_score_before?: number; job_title?: string };
  analysis?: { job_title?: string; analyzed_job?: { title?: string } };
  job_title?: string;
}

const FREE_PLAN_LIMIT = 5;

function tryParseOptimized(content: string | null): OptimizedData | null {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = authStore();
  const firstName = user?.first_name || user?.username || 'there';

  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => apiClient.get<Resume[]>('/resumes').then((r) => r.data),
  });

  const optimized = resumes.filter((resume) => resume.optimized_content);
  const totalResumes = resumes.length;
  const totalOptimizations = optimized.length;
  const avgAts =
    optimized.length > 0
      ? Math.round(
          optimized.reduce((sum, resume) => {
            const parsed = tryParseOptimized(resume.optimized_content);
            return sum + (parsed?.optimized?.ats_score_after ?? 0);
          }, 0) / optimized.length
        )
      : 0;

  const recentOptimizations = [...optimized]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const optimizationsUsed = totalOptimizations;
  const usagePercent = Math.min(100, Math.round((optimizationsUsed / FREE_PLAN_LIMIT) * 100));

  const stats = [
    {
      label: 'Resumes',
      value: isLoading ? '-' : String(totalResumes),
      icon: FileText,
      iconColor: 'text-[#d0bcff]',
      iconBg: 'bg-[#d0bcff]/10',
    },
    {
      label: 'Optimizations',
      value: isLoading ? '-' : String(totalOptimizations),
      icon: Sparkles,
      iconColor: 'text-[#4edea3]',
      iconBg: 'bg-[#4edea3]/10',
    },
    {
      label: 'Avg ATS Score',
      value: isLoading ? '-' : avgAts > 0 ? String(avgAts) : '-',
      icon: TrendingUp,
      iconColor: 'text-[#ffb3af]',
      iconBg: 'bg-[#ffb3af]/10',
    },
  ];

  return (
    <div className="theme-shell mx-auto min-h-screen max-w-5xl p-6 lg:p-8">
      <section className="mb-10">
        <h2 className="theme-text mb-1 text-4xl font-bold tracking-tight">
          Welcome back, <span className="genie-gradient-text">{firstName}</span>
        </h2>
        <p className="theme-text-muted mono-label text-sm tracking-tight">
          Your AI resume optimization workspace
        </p>
      </section>

      <section className="mb-8">
        <div
          className="relative overflow-hidden rounded-2xl border p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(208,188,255,0.08) 0%, rgba(78,222,163,0.06) 100%)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(208,188,255,0.2)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(ellipse at top left, #d0bcff 0%, transparent 60%)' }}
          />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
              >
                <Zap className="h-6 w-6 text-[#340080]" />
              </div>
              <div>
                <h3 className="theme-text mb-1 text-xl font-bold">Start New Optimization</h3>
                <p className="theme-text-muted max-w-sm text-sm">
                  Upload your resume and paste a job description to get AI-powered suggestions
                  and an ATS score.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/resume')}
              className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                color: '#340080',
              }}
            >
              Optimize Resume
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="glass-card rounded-xl border p-5"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
              <Icon className={`${iconColor} h-4 w-4`} />
            </div>
            <p className="theme-text mb-0.5 text-2xl font-bold">{value}</p>
            <p className="theme-text-muted mono-label text-[10px] uppercase tracking-widest">
              {label}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h3 className="theme-text mono-label mb-4 text-base font-bold uppercase tracking-widest">
          Recent Optimizations
        </h3>
        <div
          className="glass-card overflow-hidden rounded-xl border"
          style={{ borderColor: 'var(--app-border)' }}
        >
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="theme-panel-soft h-12 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentOptimizations.length === 0 ? (
            <div className="theme-text-subtle p-10 text-center">
              <Sparkles className="mx-auto mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm">No optimizations yet. Upload a resume to get started.</p>
            </div>
          ) : (
            recentOptimizations.map((resume, index) => {
              const parsed = tryParseOptimized(resume.optimized_content);
              const scoreBefore = parsed?.optimized?.ats_score_before ?? '?';
              const scoreAfter = parsed?.optimized?.ats_score_after ?? '?';
              const jobTitle =
                parsed?.job_title ||
                parsed?.analysis?.job_title ||
                parsed?.analysis?.analyzed_job?.title ||
                parsed?.optimized?.job_title ||
                'Unknown Role';
              const date = new Date(resume.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={resume.id}
                  className={`flex items-center justify-between gap-4 p-4 ${
                    index < recentOptimizations.length - 1 ? 'border-b' : ''
                  }`}
                  style={{
                    borderColor:
                      index < recentOptimizations.length - 1 ? 'var(--app-border)' : undefined,
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="theme-panel flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                      <FileText className="h-4 w-4 text-[#d0bcff]" />
                    </div>
                    <div className="min-w-0">
                      <p className="theme-text truncate text-sm font-semibold">
                        {resume.file_name || resume.original_filename}
                      </p>
                      <p className="theme-text-muted truncate text-xs">
                        for "{jobTitle}" - {date}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="theme-text-muted mono-label text-xs">ATS</p>
                      <p className="text-sm font-bold text-[#4edea3]">
                        {scoreBefore} to {scoreAfter}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/resume', { state: { resumeId: resume.id } })}
                      className="rounded-lg border border-[#d0bcff]/30 px-3 py-1.5 text-xs font-bold text-[#d0bcff] transition-colors hover:bg-[#d0bcff]/10"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section>
        <div
          className="glass-card rounded-xl border p-5"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="mono-label mb-0.5 text-xs font-bold uppercase tracking-widest text-[#d0bcff]">
                Free Plan
              </p>
              <p className="theme-text-muted text-sm">
                {optimizationsUsed} of {FREE_PLAN_LIMIT} optimizations used this month
              </p>
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="flex-shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                color: '#340080',
              }}
            >
              Upgrade to Pro
            </button>
          </div>
          <div className="theme-panel-soft h-2 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${usagePercent}%`,
                background: 'linear-gradient(90deg, #d0bcff 0%, #4edea3 100%)',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

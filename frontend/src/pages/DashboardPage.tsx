import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, FileText, Send, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import { authStore } from '@/store/authStore';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type?: string;
  remote?: boolean;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = authStore();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs-preview'],
    queryFn: () => apiClient.get<Job[]>('/jobs', { params: { limit: 4 } }).then((r) => r.data),
  });

  const firstName = user?.first_name || user?.username || 'there';

  const stats = [
    {
      icon: Briefcase,
      label: 'Jobs Available',
      value: jobs.length > 0 ? `${jobs.length}+` : '—',
      badge: '+12 new',
      badgeColor: 'text-[#4edea3]',
      iconColor: 'text-[#d0bcff]',
      iconBg: 'bg-[#d0bcff]/10',
    },
    {
      icon: FileText,
      label: 'Resumes Uploaded',
      value: '—',
      badge: 'V2 Active',
      badgeColor: 'text-[#d0bcff]',
      iconColor: 'text-[#4edea3]',
      iconBg: 'bg-[#4edea3]/10',
    },
    {
      icon: Send,
      label: 'Applications Sent',
      value: '—',
      badge: 'This Month',
      badgeColor: 'text-slate-500',
      iconColor: 'text-[#ffb3af]',
      iconBg: 'bg-[#ffb3af]/10',
    },
  ];

  return (
    <div className="min-h-screen bg-[#051424] p-8 max-w-7xl mx-auto">
      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-5xl font-bold tracking-tight text-[#d4e4fa] mb-2">
          Welcome back, <span className="genie-gradient-text">{firstName}!</span>
        </h2>
        <p className="text-xl text-[#cbc3d7]/80 mono-label tracking-tight">
          Let RoleGenie guide your next career move
        </p>
      </section>

      {/* ── Stats Cards ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {stats.map(({ icon: Icon, label, value, badge, badgeColor, iconColor, iconBg }) => (
          <div
            key={label}
            className="glass-card p-8 rounded-xl border border-[#273647]/10 hover:border-[#d0bcff]/20 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className={`${iconColor} w-6 h-6`} />
              </div>
              <span className={`mono-label text-xs font-medium ${badgeColor}`}>{badge}</span>
            </div>
            <p className="mono-label text-sm text-[#cbc3d7] uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-4xl font-bold text-[#d4e4fa]">{value}</h3>
          </div>
        ))}
      </section>

      {/* ── Recommended Roles ───────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-2xl font-bold text-[#d4e4fa]">Recommended Roles</h3>
          <p className="text-[#cbc3d7] text-sm mt-1">Based on your AI-enhanced profile preferences</p>
        </div>
        <button
          onClick={() => navigate('/jobs')}
          className="mono-label text-xs text-[#d0bcff] hover:underline decoration-[#d0bcff]/40 underline-offset-4 uppercase tracking-widest"
        >
          View All Jobs
        </button>
      </div>

      {/* ── Job Cards Grid ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass-card p-6 rounded-xl border border-[#273647]/10 animate-pulse"
            >
              <div className="h-4 bg-[#273647] rounded w-3/4 mb-4" />
              <div className="h-3 bg-[#273647] rounded w-1/2 mb-6" />
              <div className="h-8 bg-[#273647] rounded" />
            </div>
          ))
        ) : jobs.length === 0 ? (
          <div className="lg:col-span-2 text-center py-16 text-slate-500">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No jobs available yet.</p>
          </div>
        ) : (
          <>
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="glass-card p-1 rounded-xl border border-[#273647]/10 hover:shadow-glow-primary transition-all group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      {/* Company icon placeholder */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(39,54,71,0.8)', border: '1px solid rgba(73,68,84,0.3)' }}
                      >
                        <Briefcase className="w-6 h-6 text-[#d0bcff]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#d4e4fa] group-hover:text-[#d0bcff] transition-colors leading-tight">
                          {job.title}
                        </h4>
                        <p className="text-[#cbc3d7] text-sm">{job.company} · {job.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="mono-label text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter"
                        style={{
                          background: 'rgba(78,222,163,0.1)',
                          color: '#4edea3',
                          border: '1px solid rgba(78,222,163,0.2)',
                        }}
                      >
                        AI Match
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {job.remote && (
                      <span
                        className="mono-label text-[10px] px-2.5 py-0.5 rounded-full text-[#d0bcff]"
                        style={{ background: 'rgba(39,54,71,0.8)', border: '1px solid rgba(73,68,84,0.3)' }}
                      >
                        Remote
                      </span>
                    )}
                    {job.experience_level && (
                      <span
                        className="mono-label text-[10px] px-2.5 py-0.5 rounded-full text-[#4edea3]"
                        style={{ background: 'rgba(39,54,71,0.8)', border: '1px solid rgba(73,68,84,0.3)' }}
                      >
                        {job.experience_level}
                      </span>
                    )}
                    {job.salary_min && (
                      <span
                        className="mono-label text-[10px] px-2.5 py-0.5 rounded-full text-[#cbc3d7]"
                        style={{ background: 'rgba(39,54,71,0.8)', border: '1px solid rgba(73,68,84,0.3)' }}
                      >
                        ${Math.round(job.salary_min / 1000)}k+
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="flex-1 py-3 text-sm font-bold text-slate-300 rounded-xl transition-all"
                      style={{ background: 'rgba(39,54,71,0.6)', border: '1px solid rgba(73,68,84,0.2)' }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate('/resume')}
                      className="flex-1 py-3 text-sm font-bold rounded-xl transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                        color: '#340080',
                      }}
                    >
                      Optimize Resume
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA Card */}
            <div
              className="relative overflow-hidden rounded-xl group border border-[#d0bcff]/20 cursor-pointer"
              onClick={() => navigate('/jobs')}
            >
              <div
                className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
              />
              <div className="relative p-8 h-full flex flex-col">
                <div className="mb-4">
                  <Sparkles className="w-10 h-10 text-[#d0bcff]" />
                </div>
                <h4 className="text-2xl font-bold text-[#d4e4fa] mb-2">
                  Can't find the perfect role?
                </h4>
                <p className="text-[#cbc3d7] text-sm mb-8 max-w-xs leading-relaxed">
                  Let our AI agent actively source and suggest positions based on your specific requirements.
                </p>
                <div className="mt-auto flex items-center gap-2 text-[#d0bcff] font-bold group-hover:gap-3 transition-all">
                  Browse All Jobs
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/jobs')}
          className="glass-card p-6 text-left rounded-xl border border-[#273647]/10 hover:border-[#d0bcff]/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#d0bcff]/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#d0bcff]" />
            </div>
            <div>
              <p className="font-semibold text-[#d4e4fa] group-hover:text-[#d0bcff] transition-colors">
                Browse Jobs
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Find your next opportunity</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate('/resume')}
          className="glass-card p-6 text-left rounded-xl border border-[#273647]/10 hover:border-[#4edea3]/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#4edea3]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#4edea3]" />
            </div>
            <div>
              <p className="font-semibold text-[#d4e4fa] group-hover:text-[#4edea3] transition-colors">
                AI Resume Optimizer
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Upload and optimize for ATS</p>
            </div>
          </div>
        </button>
      </section>
    </div>
  );
};

export default DashboardPage;

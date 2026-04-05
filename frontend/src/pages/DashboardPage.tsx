import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import { authStore } from '@/store/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = authStore();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs-preview'],
    queryFn: () => apiClient.get<Job[]>('/jobs', { params: { limit: 5 } }).then((r) => r.data),
  });

  const firstName = user?.first_name || user?.username || 'there';

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="text-primary-400">{firstName}</span>!
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your job search.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Briefcase, label: 'Jobs Available', value: jobs.length, color: 'text-primary-400' },
            { icon: FileText, label: 'Resumes', value: 0, color: 'text-purple-400' },
            { icon: TrendingUp, label: 'Applications', value: 0, color: 'text-green-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-slate-700 bg-slate-800 p-5 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Jobs</h2>
            <button onClick={() => navigate('/jobs')} className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : jobs.length === 0 ? (
            <p className="text-slate-400 text-sm">No jobs available yet.</p>
          ) : (
            <div className="divide-y divide-slate-700">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/40 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-white text-sm">{job.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{job.company} · {job.location}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/jobs')} className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-left hover:border-primary-500 transition-colors">
            <Briefcase className="h-6 w-6 text-primary-400 mb-2" />
            <p className="font-medium text-white">Browse Jobs</p>
            <p className="text-xs text-slate-400 mt-0.5">Find your next opportunity</p>
          </button>
          <button onClick={() => navigate('/resume')} className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-left hover:border-purple-500 transition-colors">
            <FileText className="h-6 w-6 text-purple-400 mb-2" />
            <p className="font-medium text-white">Manage Resume</p>
            <p className="text-xs text-slate-400 mt-0.5">Upload and AI-optimize your resume</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

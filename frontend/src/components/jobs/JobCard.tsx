import React from 'react';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';

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

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const skills = (job.required_skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const initials = job.company
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(min || max!);
  };

  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <div
      onClick={onClick}
      className="rounded-xl border border-slate-700 bg-slate-800 p-5 cursor-pointer hover:border-primary-500 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{job.title}</h3>
          <p className="text-sm text-primary-400 mt-0.5">{job.company}</p>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {job.location}
            </span>
            {salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> {salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {job.experience_level || 'Any level'}
            </span>
            {job.remote && (
              <span className="rounded-full bg-green-900/40 border border-green-700 px-2 py-0.5 text-green-400">
                Remote
              </span>
            )}
          </div>

          {skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;

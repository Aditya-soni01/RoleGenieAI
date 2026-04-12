import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';

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

const PAGE_SIZE = 9;

// Map job details to tag chips
function getJobTags(job: Job): Array<{ label: string; color: string }> {
  const tags: Array<{ label: string; color: string }> = [];
  if (job.remote) tags.push({ label: 'Remote', color: '#d0bcff' });
  if (job.job_type) tags.push({ label: job.job_type, color: '#4edea3' });
  if (job.experience_level) tags.push({ label: job.experience_level, color: '#cbc3d7' });
  return tags.slice(0, 3);
}

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  const skip = (page - 1) * PAGE_SIZE;

  const { data: jobs = [], isLoading, error } = useQuery<Job[]>({
    queryKey: ['jobs', skip, search, location, experience],
    queryFn: async () => {
      if (search.trim()) {
        const res = await apiClient.get<Job[]>('/jobs/search/keyword', {
          params: { q: search.trim(), skip, limit: PAGE_SIZE },
        });
        return res.data;
      }
      const params: Record<string, string | number> = { skip, limit: PAGE_SIZE };
      if (location) params.location = location;
      if (experience) params.experience_level = experience;
      const res = await apiClient.get<Job[]>('/jobs/filter', { params });
      return res.data;
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setExperience('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#051424] px-8 py-10">
      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <section className="mb-12 relative">
        {/* Ambient glows */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#d0bcff]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4edea3]/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <span className="mono-label text-[#4edea3] text-sm tracking-[0.3em] font-bold uppercase mb-3 block">
              Intelligence-Matched
            </span>
            <h2 className="text-5xl font-extrabold tracking-tighter text-[#d4e4fa] max-w-2xl leading-[1.1]">
              Find Your Next{' '}
              <span className="genie-gradient-text">Opportunity</span>
            </h2>
          </div>
          <div className="flex gap-4">
            <div
              className="p-4 rounded-xl glass-card border border-[#273647]/10"
            >
              <p className="mono-label text-[10px] text-slate-500 uppercase tracking-widest mb-1">Showing</p>
              <p className="text-2xl font-bold text-[#d4e4fa]">{jobs.length}</p>
            </div>
            <div
              className="p-4 rounded-xl glass-card border border-[#273647]/10"
            >
              <p className="mono-label text-[10px] text-slate-500 uppercase tracking-widest mb-1">Page</p>
              <p className="text-2xl font-bold text-[#d4e4fa]">{page}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter Controls ──────────────────────────────────────────── */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 mb-10 items-center">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.15)' }}
        >
          <Search className="w-4 h-4 text-[#d0bcff]" />
          <input
            type="text"
            placeholder="Search roles or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm text-[#cbc3d7] placeholder:text-slate-500 w-48"
          />
        </div>

        {/* Location */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.15)' }}
        >
          <MapPin className="w-4 h-4 text-[#d0bcff]" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm text-[#cbc3d7] placeholder:text-slate-500 w-36"
          />
        </div>

        {/* Experience */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.15)' }}
        >
          <Filter className="w-4 h-4 text-[#d0bcff]" />
          <select
            value={experience}
            onChange={(e) => { setExperience(e.target.value); setPage(1); }}
            className="bg-transparent border-none focus:outline-none text-sm text-[#cbc3d7] cursor-pointer py-0.5"
          >
            <option value="" className="bg-[#122131]">Experience Level</option>
            <option value="entry" className="bg-[#122131]">Entry Level</option>
            <option value="mid" className="bg-[#122131]">Mid-Level</option>
            <option value="senior" className="bg-[#122131]">Senior</option>
          </select>
        </div>

        <div className="h-6 w-px bg-[#273647]/40 mx-1 hidden sm:block" />

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{
            background: 'rgba(39,54,71,0.8)',
            border: '1px solid rgba(73,68,84,0.25)',
            color: '#d4e4fa',
          }}
        >
          <Search className="w-4 h-4" />
          Search
        </button>

        <button
          type="button"
          onClick={resetFilters}
          className="ml-auto flex items-center gap-2 text-[#d0bcff] font-bold text-sm hover:text-[#4edea3] transition-colors"
        >
          Reset All
        </button>
      </form>

      {/* ── Job Cards Grid ────────────────────────────────────────────── */}
      {isLoading ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="glass-card p-6 rounded-3xl border border-[#273647]/10 animate-pulse"
              style={{ minHeight: 280 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#273647]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#273647] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#273647] rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-[#273647] rounded w-full mb-2" />
              <div className="h-3 bg-[#273647] rounded w-4/5 mb-6" />
              <div className="h-10 bg-[#273647] rounded-xl" />
            </div>
          ))}
        </section>
      ) : error ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'rgba(147,0,10,0.15)', border: '1px solid rgba(255,180,171,0.2)' }}
        >
          <p className="text-[#ffb4ab] font-medium">Failed to load jobs. Please try again.</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-medium text-[#cbc3d7]">No jobs found</p>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => {
            const tags = getJobTags(job);
            const isHighlighted = index === 0;
            return (
              <div
                key={job.id}
                className="glass-card p-6 rounded-3xl border border-[#273647]/10 hover:border-[#d0bcff]/30 transition-all duration-300 group hover:-translate-y-1 flex flex-col relative overflow-hidden"
              >
                {/* Match badge for first result */}
                {isHighlighted && (
                  <div className="absolute top-0 right-0 p-4">
                    <div
                      className="mono-label text-[10px] px-2 py-1 rounded-md flex items-center gap-1"
                      style={{
                        background: 'rgba(78,222,163,0.1)',
                        color: '#4edea3',
                        border: '1px solid rgba(78,222,163,0.2)',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                      TOP MATCH
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#273647]/30 flex-shrink-0"
                    style={{ background: 'rgba(39,54,71,0.8)' }}
                  >
                    <Briefcase className="w-6 h-6 text-[#d0bcff]" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="text-base font-bold text-[#d4e4fa] group-hover:text-[#d0bcff] transition-colors leading-tight truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-400 truncate">{job.company}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{job.location}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="mono-label text-[10px] px-2 py-0.5 rounded"
                      style={{
                        background: 'rgba(39,54,71,0.8)',
                        color: tag.color,
                        border: '1px solid rgba(73,68,84,0.2)',
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                  {job.salary_min && (
                    <span
                      className="mono-label text-[10px] px-2 py-0.5 rounded"
                      style={{
                        background: 'rgba(39,54,71,0.8)',
                        color: '#cbc3d7',
                        border: '1px solid rgba(73,68,84,0.2)',
                      }}
                    >
                      ${Math.round(job.salary_min / 1000)}k+
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed line-clamp-3">
                  {job.description}
                </p>

                {/* Actions */}
                <div
                  className="flex items-center gap-3 pt-4 mt-auto"
                  style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}
                >
                  <button
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="flex-1 py-3 text-sm font-bold text-slate-300 rounded-xl transition-all"
                    style={{ background: 'rgba(39,54,71,0.6)' }}
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
            );
          })}
        </section>
      )}

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {!isLoading && jobs.length > 0 && (
        <footer className="mt-16 flex items-center justify-between">
          <p className="mono-label text-sm text-slate-500 uppercase tracking-widest">
            Showing {jobs.length} opportunities
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
              style={{
                background: 'rgba(13,28,45,1)',
                border: '1px solid rgba(73,68,84,0.15)',
                color: '#d4e4fa',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[#340080]"
              style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
            >
              {page}
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={jobs.length < PAGE_SIZE}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
              style={{
                background: 'rgba(13,28,45,1)',
                border: '1px solid rgba(73,68,84,0.15)',
                color: '#d4e4fa',
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default JobsPage;

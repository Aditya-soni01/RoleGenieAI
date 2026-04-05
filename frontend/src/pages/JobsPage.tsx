import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, DollarSign, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import Pagination from '@/components/common/Pagination';
import JobCard from '@/components/jobs/JobCard';

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

const PAGE_SIZE = 10;

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

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Job Listings</h1>
          <p className="text-slate-400">Find your next opportunity</p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearchSubmit} className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white focus:border-primary-500 focus:outline-none"
          >
            <option value="">All levels</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </form>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner message="Loading jobs..." />
        ) : error ? (
          <ErrorAlert message="Failed to load jobs. Please try again." />
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg">No jobs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
            <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;

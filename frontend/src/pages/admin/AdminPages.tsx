import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import apiClient from '@/lib/api';

type WindowCounts = { today: number; seven_days: number; thirty_days: number };
type FunnelItem = { event_name: string; count: number };
type EventItem = {
  id: number;
  event_name: string;
  user_id: number | null;
  user_email?: string | null;
  page_path?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown>;
};

interface DashboardStats {
  total_users: number;
  new_users: WindowCounts;
  active_users: WindowCounts;
  free_users: number;
  paid_users: number;
  resume_uploads_count: number;
  resume_optimizations_count: number;
  downloads_count: number;
  conversion_funnel: FunnelItem[];
  most_common_drop_off_page: string | null;
  recent_activity_feed: EventItem[];
}

interface AdminUserRow {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_admin: boolean;
  plan_tier: string;
  paid_status: string;
  created_at: string;
  last_login_at?: string | null;
  last_activity_at?: string | null;
  resume_count: number;
  event_count: number;
}

interface UsersResponse {
  items: AdminUserRow[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

const pageClass = 'min-h-screen p-5 lg:p-8 max-w-7xl mx-auto';
const panelStyle = { background: 'rgba(13,28,45,0.96)', border: '1px solid rgba(73,68,84,0.26)' };

const formatDate = (value?: string | null) => {
  if (!value) return 'Never';
  return new Date(value).toLocaleString();
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="rounded-xl p-8 text-center text-sm text-[#8da8c0]" style={panelStyle}>
    {label}
  </div>
);

const LoadingState = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((item) => (
      <div key={item} className="h-20 rounded-xl animate-pulse bg-[#273647]/40" />
    ))}
  </div>
);

const ErrorState: React.FC<{ label?: string }> = ({ label = 'Unable to load admin data.' }) => (
  <div className="rounded-xl p-4 text-sm text-[#ffb4ab] flex items-center gap-2" style={{ background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.2)' }}>
    <AlertTriangle className="w-4 h-4" />
    {label}
  </div>
);

const PageHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <header className="mb-7">
    <p className="mono-label text-xs uppercase tracking-widest text-[#4edea3]/80 mb-2">Admin Console</p>
    <h2 className="text-3xl lg:text-4xl font-bold text-[#d4e4fa] tracking-tight">{title}</h2>
    <p className="text-sm text-[#8da8c0] mt-1">{subtitle}</p>
  </header>
);

const MetricCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; helper?: string }> = ({ label, value, icon: Icon, helper }) => (
  <div className="rounded-xl p-5" style={panelStyle}>
    <div className="w-9 h-9 rounded-lg bg-[#d0bcff]/10 flex items-center justify-center mb-4">
      <Icon className="w-4 h-4 text-[#d0bcff]" />
    </div>
    <p className="text-2xl font-bold text-[#d4e4fa]">{value}</p>
    <p className="mono-label text-[10px] uppercase tracking-widest text-[#8da8c0]">{label}</p>
    {helper && <p className="text-xs text-[#8da8c0] mt-2">{helper}</p>}
  </div>
);

const EventList: React.FC<{ events: EventItem[] }> = ({ events }) => {
  if (!events.length) return <EmptyState label="No activity recorded yet." />;
  return (
    <div className="rounded-xl overflow-hidden" style={panelStyle}>
      {events.map((event, index) => (
        <div key={event.id} className={`p-4 flex items-center justify-between gap-4 ${index < events.length - 1 ? 'border-b border-[#273647]/40' : ''}`}>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#d4e4fa]">{event.event_name}</p>
            <p className="text-xs text-[#8da8c0] truncate">
              {event.user_email || (event.user_id ? `User #${event.user_id}` : 'Anonymous')} {event.page_path ? `on ${event.page_path}` : ''}
            </p>
          </div>
          <p className="text-xs text-[#8da8c0] whitespace-nowrap">{formatDate(event.created_at)}</p>
        </div>
      ))}
    </div>
  );
};

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.get('/admin/dashboard').then((response) => response.data),
  });

  return (
    <div className={pageClass}>
      <PageHeader title="Dashboard" subtitle="Core SaaS health, funnel movement, and recent user activity." />
      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && (
        <div className="space-y-7">
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard label="Total Users" value={data.total_users} icon={Users} helper={`${data.new_users.today} today / ${data.new_users.seven_days} 7d / ${data.new_users.thirty_days} 30d`} />
            <MetricCard label="Active Users" value={data.active_users.thirty_days} icon={Activity} helper={`${data.active_users.today} today / ${data.active_users.seven_days} 7d`} />
            <MetricCard label="Free vs Paid" value={`${data.free_users} / ${data.paid_users}`} icon={CreditCard} helper="Starter users vs upgraded plan tiers" />
            <MetricCard label="Downloads" value={data.downloads_count} icon={FileText} helper={`${data.resume_uploads_count} uploads / ${data.resume_optimizations_count} optimizations`} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-xl p-5" style={panelStyle}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#d4e4fa]">Conversion Funnel</h3>
                <TrendingUp className="w-5 h-5 text-[#4edea3]" />
              </div>
              <div className="space-y-3">
                {data.conversion_funnel.map((step) => (
                  <div key={step.event_name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#cbc3d7]">{step.event_name}</span>
                      <span className="font-bold text-[#d4e4fa]">{step.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#273647]/60 overflow-hidden">
                      <div className="h-full genie-gradient" style={{ width: `${Math.min(100, step.count * 12)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-5" style={panelStyle}>
              <h3 className="text-lg font-bold text-[#d4e4fa] mb-3">Drop-off Signal</h3>
              <p className="text-3xl font-bold text-[#d0bcff] mb-2">{data.most_common_drop_off_page || 'Not enough data'}</p>
              <p className="text-sm text-[#8da8c0]">Derived from last known session page, not exact browser-close detection.</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#d4e4fa] mb-3">Recent Activity</h3>
            <EventList events={data.recent_activity_feed} />
          </section>
        </div>
      )}
    </div>
  );
};

export const AdminUsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planTier, setPlanTier] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');

  const { data, isLoading, isError } = useQuery<UsersResponse>({
    queryKey: ['admin-users', page, search, planTier, statusFilter, paidFilter],
    queryFn: () =>
      apiClient
        .get('/admin/users', {
          params: {
            page,
            per_page: 20,
            search: search || undefined,
            plan_tier: planTier || undefined,
            status_filter: statusFilter || undefined,
            paid_filter: paidFilter || undefined,
          },
        })
        .then((response) => response.data),
  });

  return (
    <div className={pageClass}>
      <PageHeader title="Users" subtitle="Search, filter, and inspect customer activity without exposing resume content." />

      <div className="rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-5 gap-3" style={panelStyle}>
        <div className="md:col-span-2 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(39,54,71,0.45)' }}>
          <Search className="w-4 h-4 text-[#8da8c0]" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search email, name, username" className="bg-transparent outline-none text-sm text-[#d4e4fa] w-full" />
        </div>
        <select value={planTier} onChange={(event) => { setPlanTier(event.target.value); setPage(1); }} className="rounded-lg px-3 py-2 bg-[#16283d] text-sm text-[#d4e4fa] outline-none">
          <option value="">All plans</option>
          <option value="starter">Starter</option>
          <option value="job_seeker">Job Seeker</option>
          <option value="interview_cracker">Interview Cracker</option>
        </select>
        <select value={paidFilter} onChange={(event) => { setPaidFilter(event.target.value); setPage(1); }} className="rounded-lg px-3 py-2 bg-[#16283d] text-sm text-[#d4e4fa] outline-none">
          <option value="">Free/Paid</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-lg px-3 py-2 bg-[#16283d] text-sm text-[#d4e4fa] outline-none">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && (
        <div className="rounded-xl overflow-hidden" style={panelStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left mono-label uppercase tracking-widest text-[10px] text-[#8da8c0]">
                <tr className="border-b border-[#273647]/60">
                  <th className="p-4">User</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Activity</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Open</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => (
                  <tr key={user.id} className="border-b border-[#273647]/30 last:border-0">
                    <td className="p-4">
                      <p className="font-semibold text-[#d4e4fa]">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-[#8da8c0]">{user.email}</p>
                    </td>
                    <td className="p-4 text-[#cbc3d7]">{user.plan_tier}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'text-[#4edea3] bg-[#4edea3]/10' : 'text-[#ffb4ab] bg-[#ffb4ab]/10'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-[#8da8c0]">{user.resume_count} resumes / {user.event_count} events</td>
                    <td className="p-4 text-[#8da8c0]">{formatDate(user.created_at)}</td>
                    <td className="p-4">
                      <Link to={`/admin/users/${user.id}`} className="inline-flex items-center gap-1 text-[#d0bcff] font-bold">
                        Detail <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex items-center justify-between border-t border-[#273647]/40">
            <p className="text-xs text-[#8da8c0]">Page {data.page} of {data.pages || 1} - {data.total} users</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 bg-[#273647]/70 text-[#d4e4fa]">Previous</button>
              <button disabled={page >= data.pages} onClick={() => setPage((value) => value + 1)} className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 bg-[#273647]/70 text-[#d4e4fa]">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => apiClient.get(`/admin/users/${id}`).then((response) => response.data),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) => apiClient.patch(`/admin/users/${id}/status`, { is_active: isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-user-detail', id] }),
  });

  const user = data?.user;

  return (
    <div className={pageClass}>
      <PageHeader title="User Detail" subtitle="Profile basics, plan state, recent actions, and session journey summary." />
      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {user && (
        <div className="space-y-6">
          <section className="rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" style={panelStyle}>
            <div>
              <h3 className="text-2xl font-bold text-[#d4e4fa]">{user.first_name} {user.last_name}</h3>
              <p className="text-sm text-[#8da8c0]">{user.email} - @{user.username}</p>
              <p className="text-sm text-[#8da8c0] mt-2">Plan: {user.plan_tier} - {user.subscription_status}</p>
            </div>
            {!user.is_admin && (
              <button
                onClick={() => statusMutation.mutate(!user.is_active)}
                disabled={statusMutation.isPending}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${user.is_active ? 'text-[#ffb4ab] bg-[#ffb4ab]/10' : 'text-[#4edea3] bg-[#4edea3]/10'}`}
              >
                {user.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            )}
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <MetricCard label="Resumes" value={data.counts.resumes} icon={FileText} />
            <MetricCard label="Optimizations" value={data.counts.optimizations} icon={TrendingUp} />
            <MetricCard label="Sessions" value={data.counts.sessions} icon={Clock} />
            <MetricCard label="Events" value={data.counts.events} icon={Activity} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div>
              <h3 className="text-lg font-bold text-[#d4e4fa] mb-3">Recent Actions</h3>
              <EventList events={data.recent_events || []} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#d4e4fa] mb-3">Session Journey</h3>
              <div className="rounded-xl overflow-hidden" style={panelStyle}>
                {(data.sessions || []).length === 0 ? (
                  <div className="p-6 text-sm text-[#8da8c0]">No sessions recorded yet.</div>
                ) : (
                  data.sessions.map((session: any, index: number) => (
                    <div key={session.session_id} className={`p-4 ${index < data.sessions.length - 1 ? 'border-b border-[#273647]/40' : ''}`}>
                      <p className="text-sm font-semibold text-[#d4e4fa]">{session.last_page_path || 'Unknown page'}</p>
                      <p className="text-xs text-[#8da8c0]">Started {formatDate(session.started_at)} - Last seen {formatDate(session.last_seen_at)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export const AdminAnalyticsPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [funnel, exits, events] = await Promise.all([
        apiClient.get('/admin/analytics/funnel'),
        apiClient.get('/admin/analytics/top-exit-pages'),
        apiClient.get('/admin/events', { params: { limit: 40 } }),
      ]);
      return { funnel: funnel.data.funnel as FunnelItem[], exits: exits.data.top_exit_pages as any[], events: events.data.events as EventItem[] };
    },
  });

  return (
    <div className={pageClass}>
      <PageHeader title="Analytics" subtitle="Funnel counts, practical exit-page approximation, and live product events." />
      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-xl p-5" style={panelStyle}>
            <h3 className="text-lg font-bold text-[#d4e4fa] mb-4">Funnel</h3>
            <div className="space-y-3">
              {data.funnel.map((item) => (
                <div key={item.event_name} className="flex items-center justify-between text-sm">
                  <span className="text-[#cbc3d7]">{item.event_name}</span>
                  <span className="font-bold text-[#d4e4fa]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-5" style={panelStyle}>
            <h3 className="text-lg font-bold text-[#d4e4fa] mb-4">Top Exit Pages</h3>
            <div className="space-y-3">
              {data.exits.length === 0 && <p className="text-sm text-[#8da8c0]">No session exits recorded yet.</p>}
              {data.exits.map((item) => (
                <div key={item.page_path} className="flex items-center justify-between text-sm">
                  <span className="text-[#cbc3d7]">{item.page_path}</span>
                  <span className="font-bold text-[#d4e4fa]">{item.sessions}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="xl:col-span-2">
            <h3 className="text-lg font-bold text-[#d4e4fa] mb-3">Recent Events</h3>
            <EventList events={data.events} />
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminSubscriptionsPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => apiClient.get('/admin/subscriptions').then((response) => response.data),
  });

  return (
    <div className={pageClass}>
      <PageHeader title="Subscriptions" subtitle="Plan distribution and derived paid conversion until billing is integrated." />
      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && (
        <div className="space-y-5">
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <MetricCard label="Total Users" value={data.total_users} icon={Users} />
            <MetricCard label="Free Users" value={data.free_users} icon={FileText} />
            <MetricCard label="Paid Users" value={data.paid_users} icon={CreditCard} />
            <MetricCard label="Paid Conversion" value={`${data.paid_conversion_rate}%`} icon={TrendingUp} />
          </section>
          <div className="rounded-xl p-5" style={panelStyle}>
            <h3 className="text-lg font-bold text-[#d4e4fa] mb-4">Plan Counts</h3>
            <div className="space-y-3">
              {Object.entries(data.plan_counts || {}).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-[#cbc3d7]">{plan}</span>
                  <span className="font-bold text-[#d4e4fa]">{String(count)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#8da8c0] mt-4">{data.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminErrorsPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-errors'],
    queryFn: () => apiClient.get('/admin/errors').then((response) => response.data),
  });

  return (
    <div className={pageClass}>
      <PageHeader title="Errors" subtitle="Current failed product events and AI error counts; centralized error aggregation is scaffolded." />
      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MetricCard label="AI Errors" value={data.ai_error_count} icon={AlertTriangle} />
          <div className="rounded-xl p-5" style={panelStyle}>
            <h3 className="text-lg font-bold text-[#d4e4fa] mb-4">Failed Event Counts</h3>
            {Object.keys(data.failed_event_counts || {}).length === 0 ? (
              <p className="text-sm text-[#8da8c0]">No failed events recorded.</p>
            ) : (
              Object.entries(data.failed_event_counts).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between text-sm mb-3">
                  <span className="text-[#cbc3d7]">{name}</span>
                  <span className="font-bold text-[#d4e4fa]">{String(count)}</span>
                </div>
              ))
            )}
            <p className="text-xs text-[#8da8c0] mt-4">{data.todo}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminSettingsPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => apiClient.get('/admin/settings').then((response) => response.data),
  });

  return (
    <div className={pageClass}>
      <PageHeader title="Settings" subtitle="Read-only operational settings for the current admin session." />
      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && (
        <div className="rounded-xl p-5 space-y-4" style={panelStyle}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
            <div>
              <p className="font-semibold text-[#d4e4fa]">Environment: {data.app_env}</p>
              <p className="text-sm text-[#8da8c0]">Bootstrap token configured: {data.admin_bootstrap_configured ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <div className="border-t border-[#273647]/50 pt-4">
            <p className="mono-label text-xs uppercase tracking-widest text-[#8da8c0] mb-1">Current Admin</p>
            <p className="text-sm text-[#d4e4fa]">{data.current_admin.email}</p>
          </div>
        </div>
      )}
    </div>
  );
};

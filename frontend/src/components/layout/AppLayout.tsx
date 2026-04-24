import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, User, Settings,
  HelpCircle, LogOut, Search, Menu, X,
} from 'lucide-react';
import { authStore } from '@/store/authStore';
import { resolveThemeMode, useThemeStore } from '@/store/themeStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume', icon: Sparkles, label: 'Resume Optimizer' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
];

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = authStore();
  const themeMode = useThemeStore((state) => state.themeMode);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/login', { replace: true });
  };

  const initials =
    `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    '?';
  const displayName =
    `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username || '';
  const resolvedTheme = resolveThemeMode(themeMode);
  const logoSrc =
    resolvedTheme === 'light' ? '/brand/logo-lockup-light.svg' : '/brand/logo-lockup-dark.svg';

  return (
    <div className="theme-shell min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-50 flex flex-col py-6
          border-r transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--app-panel-strong)', borderColor: 'var(--app-border)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
        <div className="px-6 mb-10 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 no-underline cursor-pointer">
            <div>
              <img
                src={logoSrc}
                alt="RoleGenie"
                className="brand-lockup-md"
              />
              <p className="mono-label text-[10px] uppercase tracking-widest text-[#4edea3]/70">
                AI Intelligence
              </p>
            </div>
          </Link>
          <button
            className="theme-text-subtle lg:hidden transition-colors hover:text-[var(--app-text)]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium tracking-tight
                ${isActive
                  ? 'theme-text-primary'
                  : 'theme-text-subtle hover:text-[var(--app-text)]'}`
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--app-panel)' : 'transparent',
              })}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Upgrade CTA */}
        <div className="px-4 mt-6">
          <div
            className="p-4 rounded-xl mb-4"
            style={{
              background: 'var(--app-panel)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--app-border)',
            }}
          >
            <p className="mono-label theme-text-primary text-xs font-bold tracking-widest uppercase mb-1">
              Limit Reached
            </p>
            <p className="theme-text-muted text-sm mb-3">
              Unlock 100+ AI optimizations per month.
            </p>
            <button
              onClick={() => { navigate('/subscription'); setSidebarOpen(false); }}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                color: '#340080',
              }}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </aside>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 pr-6 lg:pl-72 lg:pr-8">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3">
          <button
            className="theme-text-subtle lg:hidden p-1 hover:text-[var(--app-text)]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div
            className="hidden md:flex items-center gap-2 rounded-full px-4 py-1.5 w-72 lg:w-96"
            style={{
              background: 'var(--app-panel-soft)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--app-border)',
            }}
          >
            <Search className="theme-text-subtle w-4 h-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search resumes, skills, or optimizations..."
              className="theme-text w-full border-none bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: user info + avatar */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="theme-text text-xs font-bold leading-tight">{displayName}</p>
              <p className="mono-label theme-text-primary text-[10px] uppercase">
                {user.email?.split('@')[0]}
              </p>
            </div>
            <div className="relative group">
              <button
                className="w-9 h-9 rounded-full border-2 border-[#273647] flex items-center justify-center cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
              >
                <span className="text-xs font-bold text-[#340080]">{initials}</span>
              </button>
              {/* Dropdown */}
              <div
                className="absolute right-0 top-11 w-48 rounded-xl py-1 shadow-2xl z-10
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150"
                style={{
                  background: 'var(--app-panel-strong)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--app-border)',
                }}
              >
                <button
                  onClick={() => navigate('/settings')}
                  className="theme-text-muted flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:text-[var(--app-text)]"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-panel)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="theme-text-muted flex w-full items-center gap-3 border-t px-4 py-2 text-sm transition-colors hover:text-[var(--app-text)]"
                  style={{ background: 'transparent', borderColor: 'var(--app-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-panel)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="theme-shell pt-16 min-h-screen lg:ml-64">
        <Outlet />
      </main>

      {/* Background ambient glows */}
      <div
        className="fixed top-0 right-0 w-1/2 h-1/2 rounded-full pointer-events-none -z-10"
        style={{ background: 'var(--app-glow-primary)', filter: 'blur(120px)' }}
      />
      <div
        className="fixed bottom-0 left-64 w-2/5 h-2/5 rounded-full pointer-events-none -z-10"
        style={{ background: 'var(--app-glow-secondary)', filter: 'blur(100px)' }}
      />
    </div>
  );
};

export default AppLayout;

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { authStore } from '@/store/authStore';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/admin/errors', icon: AlertOctagon, label: 'Errors' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = authStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#051424]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-50 flex flex-col py-6 border-r border-[#273647]/30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'rgba(8,19,34,0.96)', backdropFilter: 'blur(20px)' }}
      >
        <div className="px-6 mb-9 flex items-center justify-between">
          <NavLink to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center genie-gradient">
              <ShieldCheck className="w-5 h-5 text-[#340080]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#d4e4fa] tracking-tight">Admin</h1>
              <p className="mono-label text-[10px] uppercase tracking-widest text-[#4edea3]/70">RoleGenie</p>
            </div>
          </NavLink>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive
                    ? 'text-[#d0bcff] bg-[#273647]/70'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#273647]/40'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 mt-6">
          <div className="rounded-xl p-4" style={{ background: 'rgba(39,54,71,0.45)', border: '1px solid rgba(73,68,84,0.25)' }}>
            <p className="text-sm font-semibold text-[#d4e4fa] truncate">{user?.email}</p>
            <p className="text-xs text-[#8da8c0] mb-3">Admin access</p>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-bold text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 lg:pl-72 lg:pr-8" style={{ background: 'rgba(5,20,36,0.72)', backdropFilter: 'blur(16px)' }}>
        <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden lg:block">
          <p className="mono-label text-xs uppercase tracking-widest text-[#8da8c0]">Operations</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[#d4e4fa]">{user?.first_name || user?.username || 'Admin'}</p>
          <p className="mono-label text-[10px] uppercase tracking-widest text-[#d0bcff]">Least privilege</p>
        </div>
      </header>

      <main className="pt-16 min-h-screen lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

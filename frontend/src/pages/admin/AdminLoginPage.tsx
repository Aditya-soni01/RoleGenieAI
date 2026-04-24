import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { authStore, isAdminAuthenticated } from '@/store/authStore';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin, isLoading, error, clearError } = authStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch {
      // Store owns the visible error.
    }
  };

  return (
    <div className="min-h-screen bg-[#051424] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl" style={{ background: 'rgba(13,28,45,0.98)', border: '1px solid rgba(208,188,255,0.18)' }}>
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center genie-gradient">
            <ShieldCheck className="w-5 h-5 text-[#340080]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#d4e4fa] tracking-tight">RoleGenie Admin</h1>
            <p className="text-xs mono-label uppercase tracking-widest text-[#8da8c0]">Operations console</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl px-4 py-3 text-sm flex items-start gap-2" style={{ background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab' }}>
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-xs mono-label uppercase tracking-widest text-[#958ea0] ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full bg-transparent border-b border-[#494454]/40 focus:border-[#d0bcff] px-1 py-3 outline-none text-[#d4e4fa] placeholder:text-[#494454]"
              placeholder="admin@company.com"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs mono-label uppercase tracking-widest text-[#958ea0] ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="w-full bg-transparent border-b border-[#494454]/40 focus:border-[#d0bcff] px-1 py-3 outline-none text-[#d4e4fa] placeholder:text-[#494454]"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)', color: '#340080' }}
          >
            {isLoading ? 'Checking access...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github } from 'lucide-react';
import { authStore } from '@/store/authStore';

type Mode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = authStore();
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      if (mode === 'register') {
        await register(form.email, form.password, form.username, form.first_name, form.last_name);
      } else {
        await login(form.email, form.password);
      }
      navigate('/dashboard');
    } catch {
      // error already in store
    }
  };

  const switchMode = (next: Mode) => {
    clearError();
    setMode(next);
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen bg-[#051424] flex">
      {/* ── LEFT: Branding ─────────────────────────────────────────── */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0d1c2d] flex-col justify-between p-16">
        {/* Background glows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#d0bcff]/10 blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#4edea3]/5 blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
            >
              <svg className="w-5 h-5 text-[#340080]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tighter text-[#d4e4fa]">RoleGenie</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 mt-auto">
          <h1 className="text-6xl font-bold tracking-tight mb-6 leading-tight text-[#d4e4fa]">
            Architect Your{' '}
            <br />
            <span className="genie-gradient-text">Next Major Career</span>
            <br />
            Move.
          </h1>
          <p className="text-[#cbc3d7] text-xl max-w-md font-light leading-relaxed">
            Your AI-powered career assistant. Intelligent optimization for the modern professional.
          </p>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {['AS', 'MK', 'JR'].map((init) => (
                <div
                  key={init}
                  className="w-10 h-10 rounded-full border-2 border-[#0d1c2d] flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)', color: '#340080' }}
                >
                  {init}
                </div>
              ))}
            </div>
            <p className="mono-label text-sm text-[#958ea0] uppercase tracking-widest">
              Joined by 10k+ Specialists
            </p>
          </div>
        </div>

        {/* Bottom badges */}
        <div className="relative z-10 flex gap-4 mt-12">
          {['Enterprise Ready', 'Privacy Focused'].map((badge) => (
            <div
              key={badge}
              className="px-4 py-2 rounded-lg text-xs mono-label uppercase tracking-widest text-[#cbc3d7]"
              style={{
                background: 'rgba(39,54,71,0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </section>

      {/* ── RIGHT: Form ─────────────────────────────────────────────── */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#051424] relative">
        {/* Mobile glows */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#d0bcff]/10 blur-[80px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#4edea3]/5 blur-[80px]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
            >
              <svg className="w-4 h-4 text-[#340080]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="text-xl font-bold genie-gradient-text">RoleGenie</span>
          </div>

          {/* Glass card */}
          <div
            className="p-8 sm:p-10 rounded-3xl shadow-2xl"
            style={{
              background: 'rgba(39,54,71,0.3)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(73,68,84,0.2)',
            }}
          >
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-[#d4e4fa] mb-2 tracking-tight">
                {mode === 'register' ? 'Create account' : 'Welcome back'}
              </h2>
              <p className="text-[#cbc3d7] font-light">
                {mode === 'register'
                  ? 'Start your AI-powered career journey today.'
                  : 'Continue your journey with RoleGenie.'}
              </p>
            </header>

            {/* Error */}
            {error && (
              <div
                className="mb-6 rounded-xl px-4 py-3 text-sm flex items-start gap-2"
                style={{ background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab' }}
              >
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs mono-label uppercase tracking-widest text-[#958ea0] ml-1">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="adityasoni"
                      value={form.username}
                      onChange={(e) => field('username', e.target.value)}
                      required
                      minLength={3}
                      className="w-full bg-transparent border-b border-[#494454]/40 focus:border-[#d0bcff] px-1 py-3 transition-colors duration-300 outline-none text-[#d4e4fa] placeholder:text-[#494454]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs mono-label uppercase tracking-widest text-[#958ea0] ml-1">
                        First name
                      </label>
                      <input
                        type="text"
                        placeholder="Aditya"
                        value={form.first_name}
                        onChange={(e) => field('first_name', e.target.value)}
                        required
                        className="w-full bg-transparent border-b border-[#494454]/40 focus:border-[#d0bcff] px-1 py-3 transition-colors duration-300 outline-none text-[#d4e4fa] placeholder:text-[#494454]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs mono-label uppercase tracking-widest text-[#958ea0] ml-1">
                        Last name
                      </label>
                      <input
                        type="text"
                        placeholder="Soni"
                        value={form.last_name}
                        onChange={(e) => field('last_name', e.target.value)}
                        required
                        className="w-full bg-transparent border-b border-[#494454]/40 focus:border-[#d0bcff] px-1 py-3 transition-colors duration-300 outline-none text-[#d4e4fa] placeholder:text-[#494454]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-xs mono-label uppercase tracking-widest text-[#958ea0] ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => field('email', e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-[#494454]/40 focus:border-[#d0bcff] px-1 py-3 transition-colors duration-300 outline-none text-[#d4e4fa] placeholder:text-[#494454]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs mono-label uppercase tracking-widest text-[#958ea0] ml-1">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button type="button" className="text-xs mono-label text-[#d0bcff] hover:text-[#4edea3] transition-colors uppercase tracking-widest">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => field('password', e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-transparent border-b border-[#494454]/40 focus:border-[#d0bcff] px-1 py-3 pr-8 transition-colors duration-300 outline-none text-[#d4e4fa] placeholder:text-[#494454]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[#494454] hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold tracking-tight transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{
                  background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                  color: '#340080',
                  boxShadow: '0 10px 30px -10px rgba(208,188,255,0.4)',
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {mode === 'register' ? 'Creating account...' : 'Signing in...'}
                  </span>
                ) : (
                  mode === 'register' ? 'Create Account' : 'Sign In to Dashboard'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#494454]/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className="px-4 mono-label text-[#958ea0] tracking-[0.2em]"
                  style={{ background: 'rgba(39,54,71,0.3)' }}
                >
                  OR
                </span>
              </div>
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href="http://localhost:8001/api/auth/oauth/google"
                className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-colors duration-300 group"
                style={{
                  background: 'rgba(39,54,71,0.8)',
                  border: '1px solid rgba(73,68,84,0.2)',
                }}
              >
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium text-[#d4e4fa] group-hover:text-white">Google</span>
              </a>
              <a
                href="http://localhost:8001/api/auth/oauth/github"
                className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-colors duration-300 group"
                style={{
                  background: 'rgba(39,54,71,0.8)',
                  border: '1px solid rgba(73,68,84,0.2)',
                }}
              >
                <Github className="h-4 w-4 text-[#d4e4fa]" />
                <span className="text-sm font-medium text-[#d4e4fa] group-hover:text-white">GitHub</span>
              </a>
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center">
              <p className="text-[#cbc3d7] text-sm font-light">
                {mode === 'register' ? "Already have an account?" : "Don't have an account?"}{' '}
                <button
                  onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
                  className="font-bold text-[#4edea3] ml-1 hover:underline underline-offset-4 decoration-2"
                >
                  {mode === 'register' ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </footer>
          </div>

          {/* Technical callout */}
          <div className="mt-8 flex justify-center items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="mono-label text-[10px] text-[#958ea0] uppercase tracking-widest">
              Secure auth protocol v2.4.0 active
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;

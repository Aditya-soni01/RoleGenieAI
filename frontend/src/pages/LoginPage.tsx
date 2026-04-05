import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, ArrowRight, Github, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-primary-950 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">AI Job Assistant</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Land your dream job<br />
            <span className="text-primary-400">faster with AI</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            AI-powered resume optimization, cover letter generation, and intelligent job matching.
          </p>

          <div className="space-y-4">
            {[
              { title: 'Smart Job Matching', desc: 'Get personalized job recommendations based on your skills' },
              { title: 'AI Resume Optimizer', desc: 'Tailor your resume to pass ATS filters automatically' },
              { title: 'Cover Letter Generator', desc: 'Generate compelling cover letters in seconds' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2025 AI Job Assistant. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">AI Job Assistant</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            {mode === 'register'
              ? 'Start your AI-powered job search today'
              : 'Sign in to continue to your dashboard'}
          </p>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a
              href="http://localhost:8001/api/auth/oauth/google"
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </a>
            <a
              href="http://localhost:8001/api/auth/oauth/github"
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-500">or continue with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-950/50 border border-red-800 px-4 py-3 text-sm text-red-300 flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
                  <input
                    type="text"
                    placeholder="adityasoni"
                    value={form.username}
                    onChange={(e) => field('username', e.target.value)}
                    required
                    minLength={3}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">First name</label>
                    <input
                      type="text"
                      placeholder="Aditya"
                      value={form.first_name}
                      onChange={(e) => field('first_name', e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Last name</label>
                    <input
                      type="text"
                      placeholder="Soni"
                      value={form.last_name}
                      onChange={(e) => field('last_name', e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => field('email', e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-400">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-primary-400 hover:text-primary-300">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                  value={form.password}
                  onChange={(e) => field('password', e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 pr-10 text-white placeholder-slate-500 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {mode === 'register' ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                <>
                  {mode === 'register' ? 'Create account' : 'Sign in'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              {mode === 'register' ? 'Sign in' : 'Create account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

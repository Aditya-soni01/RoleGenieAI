import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  LogOut,
  Monitor,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import apiClient from '@/lib/api';
import { authStore } from '@/store/authStore';
import { ThemeMode, useThemeStore } from '@/store/themeStore';

type Tab = 'account' | 'theme';

const panelStyle = {
  border: '1px solid var(--app-border)',
};

const fieldStyle = {
  background: 'var(--app-panel-soft)',
  border: '1px solid var(--app-border-strong)',
};

const secondaryButtonStyle = {
  background: 'var(--app-panel-soft)',
  border: '1px solid var(--app-border-strong)',
};

const ThemeOptionCard: React.FC<{
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  label: string;
  mode: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
}> = ({ description, icon, isSelected, label, mode, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(mode)}
    className="w-full rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5"
    style={{
      background: isSelected
        ? 'linear-gradient(135deg, rgba(208,188,255,0.18) 0%, rgba(78,222,163,0.12) 100%)'
        : 'var(--app-panel-soft)',
      border: isSelected
        ? '1px solid rgba(208,188,255,0.45)'
        : '1px solid var(--app-border-strong)',
      boxShadow: isSelected ? '0 12px 30px -22px rgba(208, 188, 255, 0.85)' : 'none',
    }}
  >
    <div className="mb-3 flex items-center justify-between gap-4">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{
          background: isSelected
            ? 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)'
            : 'var(--app-panel)',
          color: isSelected ? '#340080' : 'var(--app-text)',
        }}
      >
        {icon}
      </div>
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{
          border: isSelected ? 'none' : '1px solid var(--app-border-strong)',
          background: isSelected
            ? 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)'
            : 'transparent',
        }}
      >
        {isSelected ? <CheckCircle className="h-4 w-4 text-[#340080]" /> : null}
      </div>
    </div>
    <p className="theme-text mb-1 text-sm font-semibold">{label}</p>
    <p className="theme-text-muted text-xs leading-relaxed">{description}</p>
  </button>
);

const SettingsPage: React.FC = () => {
  const { user, logout } = authStore();
  const navigate = useNavigate();
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const [activeTab, setActiveTab] = useState<Tab>('account');

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [themeStatus, setThemeStatus] = useState<'idle' | 'saved'>('idle');

  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const saveMutation = useMutation({
    mutationFn: () =>
      apiClient.put('/auth/me', {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
      }),
    onSuccess: (res) => {
      authStore.getState().setUser(res.data);
      setSaveStatus('saved');
      window.setTimeout(() => setSaveStatus('idle'), 2500);
    },
    onError: () => {
      setSaveStatus('error');
      window.setTimeout(() => setSaveStatus('idle'), 2500);
    },
  });

  const pwMutation = useMutation({
    mutationFn: () =>
      apiClient.put('/auth/change-password', {
        current_password: pwForm.current,
        new_password: pwForm.next,
      }),
    onSuccess: () => {
      setPwModal(false);
      setPwForm({ current: '', next: '', confirm: '' });
      setPwError('');
    },
    onError: (err: any) => {
      setPwError(err.response?.data?.detail || 'Password change failed.');
    },
  });

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pwForm.next !== pwForm.confirm) {
      setPwError("Passwords don't match.");
      return;
    }

    if (pwForm.next.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }

    pwMutation.mutate();
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setThemeStatus('saved');
    window.setTimeout(() => setThemeStatus('idle'), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'account', label: 'Account' },
    { key: 'theme', label: 'Theme' },
  ];

  return (
    <div className="theme-shell mx-auto min-h-screen max-w-3xl p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="theme-text mb-1 text-4xl font-bold tracking-tight">Settings</h2>
        <p className="mono-label theme-text-muted text-sm uppercase tracking-widest">
          Account - Appearance
        </p>
      </div>

      <div
        className="theme-panel-soft mb-8 flex w-fit gap-1 rounded-xl border p-1"
        style={{ borderColor: 'var(--app-border)' }}
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className="rounded-lg px-5 py-2 text-sm font-semibold transition-all"
            style={{
              background: activeTab === key ? 'var(--app-panel)' : 'transparent',
              color: activeTab === key ? 'var(--app-primary-text)' : 'var(--app-text-subtle)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="glass-card space-y-5 rounded-2xl p-6" style={panelStyle}>
            <div>
              <h3 className="theme-text font-bold">Profile</h3>
              <p className="theme-text-muted mt-1 text-sm">
                Update the core account details tied to your RoleGenie profile.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(['first_name', 'last_name'] as const).map((field) => (
                <div key={field}>
                  <label className="theme-text-subtle mono-label mb-1.5 block text-xs uppercase tracking-widest">
                    {field === 'first_name' ? 'First Name' : 'Last Name'}
                  </label>
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="theme-text w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40"
                    style={fieldStyle}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="theme-text-subtle mono-label mb-1.5 block text-xs uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="theme-text-muted w-full cursor-not-allowed rounded-xl px-4 py-2.5 text-sm"
                style={fieldStyle}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="rounded-xl px-6 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                  color: '#340080',
                }}
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 text-sm text-[#4edea3]">
                  <CheckCircle className="h-4 w-4" />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-sm text-[#ffb4ab]">
                  <AlertCircle className="h-4 w-4" />
                  Failed
                </span>
              )}
            </div>
          </div>

          <div className="glass-card space-y-4 rounded-2xl p-6" style={panelStyle}>
            <div>
              <h3 className="theme-text font-bold">Security</h3>
              <p className="theme-text-muted mt-1 text-sm">
                Change your password without leaving the settings flow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPwModal(true);
                setPwError('');
                setPwForm({ current: '', next: '', confirm: '' });
              }}
              className="theme-text-primary text-sm font-semibold hover:underline"
            >
              Change Password
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6" style={panelStyle}>
            <h3 className="theme-text mb-4 font-bold">Session</h3>
            <button
              type="button"
              onClick={handleLogout}
              className="theme-text-danger flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6" style={panelStyle}>
            <div className="mb-6">
              <p className="mono-label theme-text-primary mb-2 text-xs uppercase tracking-[0.3em]">
                Theme Settings
              </p>
              <h3 className="theme-text text-xl font-bold">Choose how RoleGenie looks</h3>
              <p className="theme-text-muted mt-2 max-w-xl text-sm leading-relaxed">
                Theme preference now lives at the system level instead of inside resume-specific
                settings. Your choice is saved instantly and applied across the app shell.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ThemeOptionCard
                mode="light"
                label="Light"
                description="Bright surfaces and sharper contrast for daytime use."
                icon={<Sun className="h-5 w-5" />}
                isSelected={themeMode === 'light'}
                onSelect={handleThemeSelect}
              />
              <ThemeOptionCard
                mode="dark"
                label="Dark"
                description="The default RoleGenie look with the current dark aesthetic."
                icon={<Moon className="h-5 w-5" />}
                isSelected={themeMode === 'dark'}
                onSelect={handleThemeSelect}
              />
              <ThemeOptionCard
                mode="system"
                label="System"
                description="Automatically follow your operating system theme."
                icon={<Monitor className="h-5 w-5" />}
                isSelected={themeMode === 'system'}
                onSelect={handleThemeSelect}
              />
            </div>

            <div
              className="theme-panel-soft mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
              style={{ borderColor: 'var(--app-border)' }}
            >
              <div>
                <p className="theme-text text-sm font-semibold">Current selection: {themeMode}</p>
                <p className="theme-text-muted text-xs">
                  Dark remains the default for new sessions until the user chooses otherwise.
                </p>
              </div>
              {themeStatus === 'saved' ? (
                <span className="flex items-center gap-1.5 text-sm text-[#4edea3]">
                  <CheckCircle className="h-4 w-4" />
                  Applied instantly
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {pwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: 'var(--app-panel-strong)',
              border: '1px solid var(--app-border-strong)',
              boxShadow: 'var(--app-shadow)',
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="theme-text font-bold">Change Password</h3>
              <button
                type="button"
                onClick={() => setPwModal(false)}
                className="theme-text-subtle transition-colors hover:text-[var(--app-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePwSubmit} className="space-y-4">
              {(['current', 'next', 'confirm'] as const).map((field) => (
                <div key={field}>
                  <label className="theme-text-subtle mono-label mb-1.5 block text-xs uppercase tracking-widest">
                    {field === 'current'
                      ? 'Current Password'
                      : field === 'next'
                        ? 'New Password'
                        : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    value={pwForm[field]}
                    onChange={(e) => setPwForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="theme-text w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40"
                    style={fieldStyle}
                    required
                  />
                </div>
              ))}

              {pwError && (
                <p className="flex items-center gap-2 text-sm text-[#ffb4ab]">
                  <AlertCircle className="h-4 w-4" />
                  {pwError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={pwMutation.isPending}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                    color: '#340080',
                  }}
                >
                  {pwMutation.isPending ? 'Saving...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setPwModal(false)}
                  className="theme-text-muted flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors hover:text-[var(--app-text)]"
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

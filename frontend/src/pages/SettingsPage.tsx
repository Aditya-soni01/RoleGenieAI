import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authStore } from '@/store/authStore';
import apiClient from '@/lib/api';

type SettingsTab = 'account' | 'preferences' | 'ai' | 'security';

const SettingsPage: React.FC = () => {
  const { user, logout } = authStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [outputTone, setOutputTone] = useState<'formal' | 'concise' | 'detailed'>('formal');
  const [optimizationLogic, setOptimizationLogic] = useState<'ats' | 'recruiter'>('ats');

  // Controlled account form state
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // Password modal state
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const tabs: Array<{ key: SettingsTab; label: string }> = [
    { key: 'account', label: 'Account' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'ai', label: 'AI Settings' },
    { key: 'security', label: 'Security' },
  ];

  const saveMutation = useMutation({
    mutationFn: () =>
      apiClient.put('/auth/me', {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
      }),
    onSuccess: (res) => {
      authStore.getState().setUser(res.data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    },
    onError: () => {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    },
  });

  const handleReset = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    });
    setSaveStatus('idle');
  };

  const changePwMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      apiClient.put('/auth/change-password', data),
    onSuccess: () => {
      setPwModal(false);
      setPwForm({ current: '', next: '', confirm: '' });
      setPwError('');
    },
    onError: (err: any) => {
      setPwError(err.response?.data?.detail || 'Failed to change password');
    },
  });

  const handlePasswordSubmit = () => {
    setPwError('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters');
      return;
    }
    changePwMutation.mutate({ current_password: pwForm.current, new_password: pwForm.next });
  };

  return (
    <div className="min-h-screen bg-[#051424] px-8 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-5xl font-extrabold tracking-tighter text-[#d4e4fa] mb-3">Settings</h2>
        <p className="text-[#cbc3d7] max-w-2xl text-lg leading-relaxed">
          Configure your AI architect and manage your digital identity.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Tab nav */}
        <div className="col-span-12 md:col-span-3">
          <div className="sticky top-24 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${activeTab === tab.key
                    ? 'text-[#d0bcff] border-l-2 border-[#d0bcff]'
                    : 'text-[#cbc3d7] hover:text-[#d4e4fa]'}`}
                style={{
                  background: activeTab === tab.key ? 'rgba(39,54,71,0.6)' : 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-12 md:col-span-9 space-y-8">

          {/* Account */}
          {activeTab === 'account' && (
            <section
              className="glass-card p-8 rounded-xl"
              style={{ border: '1px solid rgba(73,68,84,0.2)' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[#d0bcff]">⚙</span>
                <h3 className="text-xl font-bold tracking-tight text-[#d4e4fa]">Account Identity</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3]">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData((f) => ({ ...f, first_name: e.target.value }))}
                    className="w-full bg-transparent border-b border-[#494454]/30 focus:border-[#d0bcff] border-t-0 border-x-0 px-0 py-2 text-[#d4e4fa] outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3]">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full bg-transparent border-b border-[#494454]/30 focus:border-[#d0bcff] border-t-0 border-x-0 px-0 py-2 text-[#d4e4fa] outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3]">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-transparent border-b border-[#494454]/30 border-t-0 border-x-0 px-0 py-2 text-[#d4e4fa]/50 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="col-span-2 space-y-2 pt-2">
                  <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3]">Access Credentials</label>
                  <div className="flex items-center justify-between py-2 border-b border-[#494454]/30">
                    <span className="text-[#cbc3d7] tracking-widest">••••••••••••••••</span>
                    <button
                      onClick={() => setPwModal(true)}
                      className="text-sm font-bold text-[#d0bcff] hover:text-[#4edea3] transition-colors"
                    >
                      Modify Password
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="glass-card p-8 rounded-xl"
                style={{ border: '1px solid rgba(73,68,84,0.2)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#d4e4fa]">Interface</h3>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{ background: darkMode ? 'rgba(0,165,114,0.8)' : 'rgba(73,68,84,0.5)' }}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${darkMode ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>
                <p className="mono-label text-sm text-slate-500">
                  Current mode: {darkMode ? 'OBSIDIAN_NIGHT' : 'LIGHT_MODE'}
                </p>
              </div>
              <div
                className="glass-card p-8 rounded-xl"
                style={{ border: '1px solid rgba(73,68,84,0.2)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#d4e4fa]">Sync Alerts</h3>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{ background: notifications ? 'rgba(0,165,114,0.8)' : 'rgba(73,68,84,0.5)' }}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>
                <p className="mono-label text-sm text-slate-500">
                  PUSH_PROTOCOLS: {notifications ? 'ACTIVE' : 'INACTIVE'}
                </p>
              </div>
            </section>
          )}

          {/* AI Settings */}
          {activeTab === 'ai' && (
            <section
              className="glass-card p-8 rounded-xl relative overflow-hidden"
              style={{ border: '1px solid rgba(73,68,84,0.2)' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d0bcff]/5 blur-3xl rounded-full pointer-events-none" />
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[#4edea3]">⚡</span>
                <h3 className="text-xl font-bold tracking-tight text-[#d4e4fa]">Neural Configuration</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3] mb-4">
                    Resume Output Tone
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(['formal', 'concise', 'detailed'] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setOutputTone(tone)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all capitalize ${
                          outputTone === tone ? 'text-[#d0bcff]' : 'text-[#cbc3d7] hover:text-[#d4e4fa]'
                        }`}
                        style={{
                          border: outputTone === tone ? '1px solid #d0bcff' : '1px solid rgba(73,68,84,0.3)',
                          background: outputTone === tone ? 'rgba(208,188,255,0.05)' : 'transparent',
                        }}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3] mb-4">
                    Optimization Logic
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'ats' as const, title: 'ATS Optimized', desc: 'Prioritize keyword density and algorithmic readability.' },
                      { key: 'recruiter' as const, title: 'Recruiter Focus', desc: 'Focus on narrative flow and impact-driven visual hierarchy.' },
                    ].map(({ key, title, desc }) => (
                      <button
                        key={key}
                        onClick={() => setOptimizationLogic(key)}
                        className="p-4 rounded-xl text-left relative transition-all"
                        style={{
                          background: optimizationLogic === key ? 'rgba(39,54,71,0.5)' : 'rgba(39,54,71,0.2)',
                          border: optimizationLogic === key ? '1px solid rgba(78,222,163,0.3)' : '1px solid rgba(73,68,84,0.2)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">⚙</span>
                          <h4 className="font-bold text-sm text-[#d4e4fa]">{title}</h4>
                        </div>
                        <p className="text-xs text-[#cbc3d7]">{desc}</p>
                        {optimizationLogic === key && (
                          <div
                            className="absolute top-2 right-2 w-2 h-2 rounded-full"
                            style={{ background: '#4edea3', boxShadow: '0 0 8px #4edea3' }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <section
              className="glass-card p-8 rounded-xl"
              style={{ border: '1px solid rgba(73,68,84,0.2)' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[#ffb4ab]">🔒</span>
                <h3 className="text-xl font-bold tracking-tight text-[#d4e4fa]">Security Protocol</h3>
              </div>

              <div className="space-y-6">
                <div
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(255,180,171,0.05)', border: '1px solid rgba(255,180,171,0.1)' }}
                >
                  <div>
                    <h4 className="font-bold text-[#d4e4fa]">Two-Factor Authentication</h4>
                    <p className="text-xs text-[#cbc3d7] mt-0.5">
                      Add an extra layer of biometric security to your account.
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-bold text-[#d4e4fa] transition-all"
                    style={{ background: 'rgba(39,54,71,0.8)' }}
                  >
                    Configure
                  </button>
                </div>

                <div className="pt-4" style={{ borderTop: '1px solid rgba(73,68,84,0.2)' }}>
                  <h4 className="mono-label text-xs text-[#ffb4ab] uppercase tracking-widest mb-4">Danger Zone</h4>
                  <div className="flex gap-4">
                    <button
                      onClick={logout}
                      className="px-6 py-2 rounded-xl text-sm font-bold transition-all text-[#ffb4ab] hover:bg-[#ffb4ab]/5"
                      style={{ border: '1px solid rgba(255,180,171,0.3)' }}
                    >
                      Logout All Devices
                    </button>
                    <button className="px-6 py-2 rounded-xl text-sm font-medium text-[#cbc3d7] hover:text-[#ffb4ab] transition-all">
                      Terminate Account
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Action footer */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {saveStatus === 'saved' && (
              <span className="text-sm text-[#4edea3] font-medium">Profile synchronized!</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-[#ffb4ab] font-medium">Failed to save changes.</span>
            )}
            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-xl font-medium text-[#cbc3d7] hover:text-[#d4e4fa] transition-all"
            >
              Reset Changes
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="px-10 py-3 rounded-xl font-extrabold transition-all hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                color: '#340080',
                boxShadow: '0 10px 30px -10px rgba(208,188,255,0.3)',
              }}
            >
              {saveMutation.isPending ? 'Saving...' : 'Synchronize Profiles'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Password Change Modal ── */}
      {pwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
            style={{
              background: 'rgba(13,28,45,0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(73,68,84,0.3)',
            }}
          >
            <h3 className="text-xl font-bold text-[#d4e4fa] mb-6">Change Password</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={pwForm.current}
                  onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                  className="w-full bg-[#0d1c2d] border border-[#494454]/40 rounded-xl px-4 py-3 text-[#d4e4fa] outline-none focus:border-[#d0bcff] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={pwForm.next}
                  onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                  className="w-full bg-[#0d1c2d] border border-[#494454]/40 rounded-xl px-4 py-3 text-[#d4e4fa] outline-none focus:border-[#d0bcff] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs mono-label uppercase tracking-widest text-[#4edea3] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="w-full bg-[#0d1c2d] border border-[#494454]/40 rounded-xl px-4 py-3 text-[#d4e4fa] outline-none focus:border-[#d0bcff] transition-all"
                />
              </div>
            </div>

            {pwError && (
              <p className="mt-4 text-sm text-[#ffb4ab]">{pwError}</p>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setPwModal(false); setPwForm({ current: '', next: '', confirm: '' }); setPwError(''); }}
                className="flex-1 py-3 rounded-xl font-medium text-[#cbc3d7] hover:text-[#d4e4fa] transition-all"
                style={{ border: '1px solid rgba(73,68,84,0.3)' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={changePwMutation.isPending}
                className="flex-1 py-3 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                  color: '#340080',
                }}
              >
                {changePwMutation.isPending ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

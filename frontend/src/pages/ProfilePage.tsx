import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, MapPin, Upload, Edit, TrendingUp, Check, X } from 'lucide-react';
import { authStore } from '@/store/authStore';
import apiClient from '@/lib/api';

const ProfilePage: React.FC = () => {
  const { user } = authStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  const initials =
    `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() ||
    user?.username?.[0]?.toUpperCase() || '?';
  const displayName =
    `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username || 'User';

  const skills = ['React', 'Python', 'TypeScript', 'Node.js', 'FastAPI', 'LLM', 'Tailwind', 'SQL'];

  const updateProfileMutation = useMutation({
    mutationFn: (data: { first_name?: string; last_name?: string }) =>
      apiClient.put('/auth/me', data),
    onSuccess: (res) => {
      authStore.getState().setUser(res.data);
      setIsEditing(false);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onMutate: () => setUploadStatus('uploading'),
    onSuccess: () => {
      setUploadStatus('done');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setTimeout(() => setUploadStatus('idle'), 2500);
    },
    onError: () => {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 2500);
    },
  });

  const handleEditSave = () => {
    updateProfileMutation.mutate({
      first_name: editForm.first_name || undefined,
      last_name: editForm.last_name || undefined,
    });
  };

  const handleEditCancel = () => {
    setEditForm({ first_name: user?.first_name || '', last_name: user?.last_name || '' });
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#051424] p-8 max-w-7xl mx-auto">

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14 items-end">
        <div className="lg:col-span-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div
                className="absolute -inset-1 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"
                style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
              />
              <div
                className="relative w-36 h-36 rounded-full border-4 flex items-center justify-center shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                  borderColor: '#273647',
                }}
              >
                <span className="text-4xl font-extrabold text-[#340080]">{initials}</span>
              </div>
            </div>

            {/* Name + info */}
            <div className="flex-1">
              <span className="mono-label text-xs text-[#4edea3] tracking-widest uppercase mb-2 block">
                Available for Opportunities
              </span>

              {isEditing ? (
                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                    placeholder="First name"
                    className="bg-transparent border-b border-[#d0bcff]/50 focus:border-[#d0bcff] text-3xl font-bold text-[#d4e4fa] outline-none py-1 w-full transition-all"
                  />
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                    placeholder="Last name"
                    className="bg-transparent border-b border-[#d0bcff]/50 focus:border-[#d0bcff] text-3xl font-bold text-[#d4e4fa] outline-none py-1 w-full transition-all"
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleEditSave}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)', color: '#340080' }}
                    >
                      <Check className="w-4 h-4" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-[#cbc3d7] hover:text-white transition-colors"
                      style={{ border: '1px solid rgba(73,68,84,0.4)' }}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-[#d4e4fa] mb-2">
                    {displayName}
                  </h2>
                  <p className="text-xl text-[#d0bcff] font-medium tracking-tight mb-4">
                    Software Engineer
                  </p>
                </>
              )}

              <div className="flex flex-wrap gap-4 items-center">
                <span className="flex items-center text-slate-400 gap-1.5 text-sm">
                  <Mail className="w-4 h-4" />
                  {user?.email || 'Not set'}
                </span>
                <span className="flex items-center text-slate-400 gap-1.5 text-sm">
                  <MapPin className="w-4 h-4" />
                  San Francisco, CA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <button
            onClick={() => { setIsEditing(true); setEditForm({ first_name: user?.first_name || '', last_name: user?.last_name || '' }); }}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
              color: '#340080',
            }}
          >
            <Edit className="w-5 h-5" />
            Edit Profile
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            hidden
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{
              background: 'rgba(39,54,71,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(73,68,84,0.25)',
              color: '#d4e4fa',
            }}
          >
            <Upload className="w-5 h-5" />
            {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'done' ? 'Uploaded!' : uploadStatus === 'error' ? 'Upload Failed' : 'Upload New Resume'}
          </button>
        </div>
      </section>

      {/* ── Content Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left Column ── */}
        <div className="space-y-8">
          {/* Technical Stack */}
          <div
            className="p-8 rounded-xl"
            style={{ border: '1px solid rgba(73,68,84,0.2)', background: 'rgba(13,28,45,0.6)' }}
          >
            <h3 className="mono-label text-sm text-[#4edea3] uppercase tracking-[0.2em] mb-6">Technical Stack</h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-1.5 text-xs font-semibold rounded-full text-[#d0bcff]"
                  style={{
                    background: 'rgba(39,54,71,0.8)',
                    border: '1px solid rgba(73,68,84,0.25)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div
            className="p-8 rounded-xl"
            style={{ border: '1px solid rgba(73,68,84,0.2)', background: 'rgba(13,28,45,0.6)' }}
          >
            <h3 className="mono-label text-sm text-[#4edea3] uppercase tracking-[0.2em] mb-6">Bio</h3>
            <p className="text-[#cbc3d7] leading-relaxed text-sm">
              Passionate engineer focused on bridging the gap between sophisticated AI models and
              intuitive user interfaces. Currently architecting intelligent agent workflows for
              next-generation hiring platforms.
            </p>

            {/* Profile score */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Profile Score</span>
                <span className="mono-label text-xs text-[#4edea3]">78%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#273647] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '78%',
                    background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Complete your profile to improve match quality
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Column (span 2) ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Experience */}
          <div
            className="p-8 rounded-xl"
            style={{ border: '1px solid rgba(73,68,84,0.2)', background: 'rgba(13,28,45,0.6)' }}
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold tracking-tight text-[#d4e4fa]">Experience</h3>
              <button
                onClick={() => navigate('/resume')}
                className="text-[#d0bcff] text-xs font-semibold hover:underline"
              >
                Manage All
              </button>
            </div>

            <div className="relative space-y-10">
              {/* Timeline line */}
              <div
                className="absolute left-[11px] top-2 bottom-2 w-px"
                style={{ background: 'rgba(73,68,84,0.3)' }}
              />

              {/* Item 1 */}
              <div className="relative pl-10">
                <div
                  className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10"
                  style={{ background: 'rgba(13,28,45,1)', borderColor: '#d0bcff' }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
                  />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-[#d4e4fa]">Senior Software Engineer</h4>
                  <span
                    className="mono-label text-xs text-slate-500 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(39,54,71,0.6)' }}
                  >
                    2022 – Present
                  </span>
                </div>
                <p className="text-[#d0bcff] text-sm font-medium mb-3">AI Dynamics Corp</p>
                <ul className="space-y-1.5 text-sm text-[#cbc3d7]">
                  <li className="flex gap-2"><span className="text-[#4edea3] flex-shrink-0">•</span>Architected the core orchestration engine for multi-agent LLM systems.</li>
                  <li className="flex gap-2"><span className="text-[#4edea3] flex-shrink-0">•</span>Improved system latency by 45% through aggressive caching and edge deployments.</li>
                </ul>
              </div>

              {/* Item 2 */}
              <div className="relative pl-10">
                <div
                  className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10"
                  style={{ background: 'rgba(13,28,45,1)', borderColor: 'rgba(73,68,84,0.5)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#494454]" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-[#d4e4fa]">Full Stack Developer</h4>
                  <span
                    className="mono-label text-xs text-slate-500 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(39,54,71,0.6)' }}
                  >
                    2020 – 2022
                  </span>
                </div>
                <p className="text-[#d0bcff] text-sm font-medium mb-3">Nebula Systems</p>
                <p className="text-sm text-[#cbc3d7] leading-relaxed">
                  Developed high-performance dashboard components and real-time visualization tools
                  for cybersecurity monitoring platforms.
                </p>
              </div>
            </div>
          </div>

          {/* Resume Portfolio */}
          <div
            className="p-8 rounded-xl"
            style={{ border: '1px solid rgba(73,68,84,0.2)', background: 'rgba(13,28,45,0.6)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight text-[#d4e4fa]">Resume Portfolio</h3>
            </div>

            <div className="space-y-3">
              <div
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-[#273647]/40"
                style={{ border: '1px solid rgba(73,68,84,0.2)' }}
                onClick={() => navigate('/resume')}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(39,54,71,0.8)' }}
                >
                  <TrendingUp className="w-6 h-6 text-[#4edea3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-[#d4e4fa] truncate">Manage Your Resumes</h5>
                  <p className="mono-label text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                    Upload, optimize & download
                  </p>
                </div>
                <span
                  className="mono-label text-[10px] px-2 py-1 rounded text-[#4edea3]"
                  style={{ background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.2)' }}
                >
                  Go →
                </span>
              </div>

              {/* Upload drop zone */}
              <div
                className="flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer group transition-colors"
                style={{ border: '2px dashed rgba(73,68,84,0.3)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ background: 'rgba(39,54,71,0.8)' }}
                >
                  <Upload className="w-5 h-5 text-[#d0bcff]" />
                </div>
                <span className="text-sm font-semibold text-[#d4e4fa]">
                  {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'done' ? 'Upload successful!' : 'Upload new version'}
                </span>
                <p className="text-xs text-slate-500 mt-1">PDF or DOCX up to 10MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

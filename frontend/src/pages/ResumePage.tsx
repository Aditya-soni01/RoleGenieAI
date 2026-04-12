import React, { useRef, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Upload, FileText, Trash2, Zap, X,
  CheckCircle, AlertCircle, TrendingUp, Tag, FileDown,
  ChevronRight, Eye, Download, BarChart2, Sparkles,
} from 'lucide-react';
import apiClient from '@/lib/api';
import { authStore } from '@/store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Resume {
  id: number;
  file_name: string;
  original_content: string;
  optimized_content?: string;
  created_at: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
}

interface OptimizationAnalysis {
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_location: string;
  linkedin_url: string;
  portfolio_url: string;
  matched_hard_skills: string[];
  matched_soft_skills: string[];
  missing_critical_skills: string[];
  missing_nice_to_have_skills: string[];
  transferable_skills: string[];
  experience_entries: Array<{
    original_title: string;
    company: string;
    duration: string;
    relevance_score: number;
    relevant_keywords_found: string[];
    suggested_reorder_priority: number;
  }>;
  education_entries: Array<{ degree: string; institution: string; year: string; relevant_coursework: string[] }>;
  certifications: string[];
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  ats_score_before: number;
  gap_analysis: string;
  reorder_strategy: string;
}

interface OptimizedResume {
  full_name: string;
  contact: { email: string; phone: string; location: string; linkedin: string; portfolio: string };
  professional_summary: string;
  technical_skills: string[];
  professional_skills: string[];
  experience: Array<{ title: string; company: string; location: string; duration: string; bullets: string[] }>;
  education: Array<{ degree: string; institution: string; year: string; details: string }>;
  certifications: string[];
  projects: Array<{ name: string; technologies: string; bullets: string[] }>;
  ats_score_after: number;
  keywords_added: string[];
  key_improvements: string[];
}

interface OptimizationResult {
  analysis: OptimizationAnalysis;
  optimized: OptimizedResume;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tryParseOptimizationResult(content?: string): OptimizationResult | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed?.analysis && parsed?.optimized) return parsed as OptimizationResult;
    // Backward compat: old flat StructuredResume format
    if (parsed && (parsed.summary || parsed.professional_summary || parsed.full_name)) {
      return {
        analysis: {
          candidate_name: parsed.full_name || '',
          candidate_email: '', candidate_phone: '', candidate_location: '',
          linkedin_url: '', portfolio_url: '',
          matched_hard_skills: [], matched_soft_skills: [],
          missing_critical_skills: [], missing_nice_to_have_skills: [],
          transferable_skills: [], experience_entries: [], education_entries: [],
          certifications: parsed.certifications || [],
          projects: parsed.projects || [],
          ats_score_before: parsed.ats_score_before || 0,
          gap_analysis: '', reorder_strategy: '',
        },
        optimized: {
          full_name: parsed.full_name || '',
          contact: typeof parsed.contact === 'string'
            ? { email: parsed.contact, phone: '', location: '', linkedin: '', portfolio: '' }
            : (parsed.contact || { email: '', phone: '', location: '', linkedin: '', portfolio: '' }),
          professional_summary: parsed.summary || parsed.professional_summary || '',
          technical_skills: parsed.skills || parsed.technical_skills || [],
          professional_skills: parsed.professional_skills || [],
          experience: (parsed.experience || []).map((e: any) => ({
            title: e.title || '', company: e.company || '',
            location: '', duration: e.duration || '',
            bullets: e.achievements || e.bullets || [],
          })),
          education: (parsed.education || []).map((e: any) => ({
            degree: e.degree || '', institution: e.institution || '',
            year: e.year || '', details: e.details || '',
          })),
          certifications: parsed.certifications || [],
          projects: (parsed.projects || []).map((p: any) => ({
            name: p.name || '',
            technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
            bullets: p.bullets || [p.description || ''],
          })),
          ats_score_after: parsed.ats_score_after || 0,
          keywords_added: parsed.keywords_added || [],
          key_improvements: [],
        },
      };
    }
  } catch {}
  return null;
}

async function downloadBlob(url: string, filename: string) {
  const res = await apiClient.get(url, { responseType: 'blob' });
  const href = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const LOADING_STEPS = [
  'Analyzing resume against job description…',
  'Matching skills and identifying gaps…',
  'Rewriting with AI optimization…',
  'Formatting for ATS compatibility…',
];

const LoadingProgress: React.FC<{ step: number }> = ({ step }) => (
  <div
    className="rounded-3xl p-10"
    style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.2)' }}
  >
    <div className="flex items-center justify-center mb-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#273647]" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#d0bcff] border-r-[#4edea3] border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#d0bcff]" />
        </div>
      </div>
    </div>

    <div className="space-y-5 max-w-sm mx-auto">
      {LOADING_STEPS.map((text, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
              i < step
                ? 'bg-[#4edea3]'
                : i === step
                ? 'bg-[#d0bcff] animate-pulse'
                : 'bg-[#273647]'
            }`}
          >
            {i < step ? (
              <CheckCircle className="w-4 h-4 text-[#051424]" />
            ) : (
              <div className={`w-2 h-2 rounded-full ${i === step ? 'bg-[#340080]' : 'bg-[#494454]'}`} />
            )}
          </div>
          <p
            className={`text-sm transition-all duration-500 ${
              i < step ? 'text-[#4edea3]' : i === step ? 'text-[#d4e4fa] font-semibold' : 'text-slate-600'
            }`}
          >
            {text}
          </p>
        </div>
      ))}
    </div>
    <p className="text-center text-xs text-slate-500 mt-10 mono-label">
      Running two-stage AI pipeline — ~20–40 seconds
    </p>
  </div>
);

const ATSScoreBar: React.FC<{
  before: number;
  after: number;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
}> = ({ before, after, onDownloadPdf, onDownloadDocx }) => {
  const delta = after - before;
  return (
    <div
      className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
      style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.2)' }}
    >
      {/* Score ring area */}
      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-center">
          <p className="mono-label text-[10px] text-slate-500 uppercase tracking-widest mb-1">Before</p>
          <p className="text-3xl font-extrabold text-[#ffb4ab]">{before}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TrendingUp className="h-5 w-5 text-[#4edea3]" />
          <span className="mono-label text-xs font-bold text-[#4edea3]">+{delta} pts</span>
        </div>
        <div className="text-center">
          <p className="mono-label text-[10px] text-slate-500 uppercase tracking-widest mb-1">After</p>
          <p className="text-3xl font-extrabold text-[#4edea3]">{after}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-1 w-full">
        <div className="flex justify-between mb-1">
          <p className="mono-label text-[10px] text-slate-400 uppercase tracking-widest">ATS Score</p>
          <p className="mono-label text-[10px] text-[#4edea3]">{after}/100</p>
        </div>
        <div className="h-2 w-full rounded-full bg-[#273647] mb-1">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${after}%`, background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
          />
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={onDownloadPdf}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)', color: '#340080' }}
        >
          <FileDown className="w-4 h-4" />
          PDF
        </button>
        <button
          onClick={onDownloadDocx}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: 'rgba(39,54,71,0.8)', border: '1px solid rgba(73,68,84,0.3)', color: '#d4e4fa' }}
        >
          <FileText className="w-4 h-4" />
          DOCX
        </button>
      </div>
    </div>
  );
};

const ResumePreviewNew: React.FC<{ data: OptimizedResume }> = ({ data }) => {
  const contactLine = [data.contact?.email, data.contact?.phone, data.contact?.location]
    .filter(Boolean).join(' | ');
  const linkLine = [data.contact?.linkedin, data.contact?.portfolio].filter(Boolean).join(' · ');

  return (
    <div className="rounded-2xl bg-white text-slate-900 p-10 shadow-2xl font-sans text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{data.full_name}</h1>
        {contactLine && <p className="text-slate-500 text-xs">{contactLine}</p>}
        {linkLine && <p className="text-slate-400 text-xs mt-0.5">{linkLine}</p>}
      </div>

      {/* Summary */}
      {data.professional_summary && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#a078ff]">Professional Summary</h2>
          <p className="text-slate-700 leading-relaxed">{data.professional_summary}</p>
        </section>
      )}

      {/* Technical Skills */}
      {data.technical_skills?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#a078ff]">Technical Skills</h2>
          <p className="text-slate-700 text-xs leading-relaxed">{data.technical_skills.join(' • ')}</p>
        </section>
      )}

      {/* Professional Skills */}
      {data.professional_skills?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#a078ff]">Professional Skills</h2>
          <p className="text-slate-700 text-xs leading-relaxed">{data.professional_skills.join(' • ')}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-[#a078ff]">Professional Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 relative pl-5 border-l-2 border-[#4edea3]/30">
              <div className="flex items-baseline justify-between mb-0.5">
                <p className="font-bold text-slate-900">{exp.title} · {exp.company}</p>
                <p className="text-xs text-slate-400 font-mono ml-4 flex-shrink-0">{exp.duration}</p>
              </div>
              {exp.location && <p className="text-xs text-slate-400 mb-1">{exp.location}</p>}
              <ul className="mt-1 space-y-0.5">
                {exp.bullets?.map((bullet, j) => (
                  <li key={j} className="text-slate-600 text-xs flex gap-2">
                    <span className="text-[#4edea3] flex-shrink-0">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#a078ff]">Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-slate-900 text-sm">{edu.degree}</p>
                <p className="text-xs text-slate-400 ml-4">{edu.institution} | {edu.year}</p>
              </div>
              {edu.details && <p className="text-xs text-slate-500 mt-0.5 italic">{edu.details}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#a078ff]">Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <p className="font-semibold text-slate-900 text-sm">{proj.name}</p>
              {proj.technologies && (
                <p className="text-xs text-slate-400 mt-0.5 italic">Technologies: {proj.technologies}</p>
              )}
              <ul className="mt-1 space-y-0.5">
                {proj.bullets?.map((bullet, j) => (
                  <li key={j} className="text-slate-600 text-xs flex gap-2">
                    <span className="text-[#a078ff] flex-shrink-0">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#a078ff]">Certifications</h2>
          <ul className="space-y-0.5">
            {data.certifications.map((cert, i) => (
              <li key={i} className="text-slate-600 text-xs flex gap-2">
                <span className="text-[#a078ff] flex-shrink-0">•</span>
                {cert}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

const SkillPill: React.FC<{ label: string; variant: 'matched' | 'missing' | 'nice' | 'transfer' | 'keyword' }> = ({ label, variant }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    matched:  { bg: 'rgba(78,222,163,0.1)',  text: '#4edea3', border: 'rgba(78,222,163,0.3)' },
    missing:  { bg: 'rgba(255,180,171,0.1)', text: '#ffb4ab', border: 'rgba(255,180,171,0.3)' },
    nice:     { bg: 'rgba(255,200,120,0.1)', text: '#ffc078', border: 'rgba(255,200,120,0.3)' },
    transfer: { bg: 'rgba(208,188,255,0.1)', text: '#d0bcff', border: 'rgba(208,188,255,0.3)' },
    keyword:  { bg: 'rgba(78,222,163,0.08)', text: '#4edea3', border: 'rgba(78,222,163,0.2)' },
  };
  const s = styles[variant];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs mono-label"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  );
};

const AnalysisPanel: React.FC<{ analysis: OptimizationAnalysis; optimized: OptimizedResume }> = ({ analysis, optimized }) => (
  <div className="space-y-6">
    {/* Skill sections */}
    {analysis.matched_hard_skills?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#4edea3] uppercase tracking-widest mb-3 flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5" /> Matched Hard Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {analysis.matched_hard_skills.map((s, i) => <SkillPill key={i} label={s} variant="matched" />)}
        </div>
      </div>
    )}

    {analysis.matched_soft_skills?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#d0bcff] uppercase tracking-widest mb-3">Matched Soft Skills</p>
        <div className="flex flex-wrap gap-2">
          {analysis.matched_soft_skills.map((s, i) => <SkillPill key={i} label={s} variant="transfer" />)}
        </div>
      </div>
    )}

    {analysis.missing_critical_skills?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#ffb4ab] uppercase tracking-widest mb-3 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" /> Missing Critical Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {analysis.missing_critical_skills.map((s, i) => <SkillPill key={i} label={s} variant="missing" />)}
        </div>
      </div>
    )}

    {analysis.missing_nice_to_have_skills?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#ffc078] uppercase tracking-widest mb-3">Nice-to-Have Gaps</p>
        <div className="flex flex-wrap gap-2">
          {analysis.missing_nice_to_have_skills.map((s, i) => <SkillPill key={i} label={s} variant="nice" />)}
        </div>
      </div>
    )}

    {/* Keywords added */}
    {optimized.keywords_added?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#d0bcff] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" /> Keywords Added
        </p>
        <div className="flex flex-wrap gap-2">
          {optimized.keywords_added.map((k, i) => <SkillPill key={i} label={k} variant="keyword" />)}
        </div>
      </div>
    )}

    {/* Key improvements */}
    {optimized.key_improvements?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#4edea3] uppercase tracking-widest mb-3 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" /> Key Improvements
        </p>
        <ol className="space-y-2">
          {optimized.key_improvements.map((imp, i) => (
            <li key={i} className="flex gap-3 text-sm text-[#cbc3d7] leading-relaxed">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)', color: '#340080' }}
              >
                {i + 1}
              </span>
              {imp}
            </li>
          ))}
        </ol>
      </div>
    )}

    {/* Gap analysis */}
    {analysis.gap_analysis && (
      <div
        className="p-4 rounded-xl"
        style={{ background: 'rgba(39,54,71,0.3)', border: '1px solid rgba(73,68,84,0.2)' }}
      >
        <p className="mono-label text-xs text-slate-500 uppercase tracking-widest mb-2">Gap Analysis</p>
        <p className="text-sm text-[#cbc3d7] leading-relaxed">{analysis.gap_analysis}</p>
      </div>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ResumePage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = authStore();

  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'analysis' | 'download'>('preview');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: resumes = [], isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => apiClient.get<Resume[]>('/resumes').then((r) => r.data),
    enabled: !!user,
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['jobs-all'],
    queryFn: () => apiClient.get<Job[]>('/jobs', { params: { limit: 100 } }).then((r) => r.data),
    enabled: !!user,
  });

  // When selected resume changes, load existing optimization if available
  useEffect(() => {
    if (!selectedResumeId) { setOptimizationResult(null); return; }
    const resume = resumes.find((r) => r.id === selectedResumeId);
    setOptimizationResult(tryParseOptimizationResult(resume?.optimized_content));
  }, [selectedResumeId, resumes]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return apiClient.post<Resume>('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: (resume) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSelectedResumeId(resume.id);
      showToast('Resume uploaded! Text extracted successfully.');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.detail || 'Upload failed.', 'error');
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: ({ resumeId, jobId }: { resumeId: number; jobId: number }) =>
      apiClient
        .post(`/resumes/${resumeId}/optimize`, null, { params: { job_id: jobId } })
        .then((r) => r.data),
    onSuccess: (response: { status: string; data: OptimizationResult }) => {
      setOptimizationResult(response.data);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setActiveTab('preview');
      showToast('AI optimization complete!');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.detail || 'AI optimization failed.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/resumes/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      if (selectedResumeId === id) { setSelectedResumeId(null); setOptimizationResult(null); }
      showToast('Resume deleted.');
    },
  });

  // Advance loading step every 2 seconds while the optimize mutation is pending
  useEffect(() => {
    if (!optimizeMutation.isPending) { setLoadingStep(0); return; }
    let idx = 0;
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, LOADING_STEPS.length - 1);
      setLoadingStep(idx);
    }, 2000);
    return () => clearInterval(interval);
  }, [optimizeMutation.isPending]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  const handleOptimize = () => {
    if (!selectedResumeId) { showToast('Select a resume first.', 'error'); return; }
    if (!selectedJobId) { showToast('Select a Job Description to optimize for.', 'error'); return; }
    optimizeMutation.mutate({ resumeId: selectedResumeId, jobId: Number(selectedJobId) });
  };

  const handleDownload = async (type: 'pdf' | 'docx') => {
    if (!selectedResumeId) return;
    const candidateName = optimizationResult?.optimized?.full_name?.trim().replace(/\s+/g, '_') || 'resume';
    const filename = `${candidateName}_Resume_Optimized.${type}`;
    try {
      await downloadBlob(`/resumes/${selectedResumeId}/download/${type}`, filename);
      showToast(`Downloaded ${filename}`);
    } catch (err: any) {
      let detail = err?.message || 'Unknown error';
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await (err.response.data as Blob).text();
          const json = JSON.parse(text);
          if (json?.detail) detail = json.detail;
        } catch {}
      } else if (err?.response?.data?.detail) {
        detail = err.response.data.detail;
      }
      showToast(`Download failed: ${detail}`, 'error');
    }
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) ?? null;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#051424]">
        <p className="text-slate-400">Please log in to manage your resumes.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051424]">
      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl transition-all"
          style={
            toast.type === 'success'
              ? { background: 'rgba(0,165,114,0.2)', border: '1px solid rgba(78,222,163,0.3)', color: '#4edea3' }
              : { background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.3)', color: '#ffb4ab' }
          }
        >
          {toast.type === 'success'
            ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
            : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="p-8 max-w-[1600px] mx-auto">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-[3rem] font-extrabold tracking-[-0.04em] leading-tight mb-2">
            Resume <span className="genie-gradient-text">Optimization</span>
          </h2>
          <p className="mono-label text-[#cbc3d7] text-sm uppercase tracking-widest">
            Level 04 Intelligence Engine // Two-Stage AI Pipeline
          </p>
        </div>

        {/* ── Split Layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT PANEL ── */}
          <section className="lg:col-span-5 space-y-6">

            {/* Upload zone */}
            <div
              className="rounded-3xl p-8 relative overflow-hidden group"
              style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.2)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#d4e4fa]">
                  <Upload className="w-5 h-5 text-[#d0bcff]" />
                  Source Document
                </h3>

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                    ${uploadMutation.isPending
                      ? 'border-[#d0bcff]/50 bg-[#d0bcff]/5'
                      : 'border-[#273647]/50 hover:border-[#d0bcff]/50 hover:bg-[#d0bcff]/5'}`}
                >
                  <div className="w-14 h-14 rounded-full bg-[#273647] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {uploadMutation.isPending
                      ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d0bcff] border-t-transparent" />
                      : <Upload className="w-6 h-6 text-[#d0bcff]" />}
                  </div>
                  {uploadMutation.isPending ? (
                    <p className="text-sm text-[#d0bcff]">Extracting text from file…</p>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-[#d4e4fa] mb-1">Drop your resume here</p>
                      <p className="text-sm text-[#cbc3d7]">PDF, DOCX up to 5 MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Resume list */}
                <div className="mt-6 space-y-2">
                  {resumesLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d0bcff] border-t-transparent" />
                    </div>
                  ) : resumes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No resumes yet</p>
                    </div>
                  ) : (
                    resumes.map((resume) => {
                      const isSelected = resume.id === selectedResumeId;
                      const isOpt = !!tryParseOptimizationResult(resume.optimized_content);
                      return (
                        <div
                          key={resume.id}
                          onClick={() => setSelectedResumeId(resume.id)}
                          className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all
                            ${isSelected
                              ? 'bg-[#273647]/60 border border-[#d0bcff]/30'
                              : 'hover:bg-[#273647]/30 border border-transparent'}`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-[#d0bcff]/10' : 'bg-[#273647]'
                            }`}
                          >
                            <FileText className={`h-5 w-5 ${isSelected ? 'text-[#d0bcff]' : 'text-slate-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isSelected ? 'text-[#d4e4fa]' : 'text-slate-300'}`}>
                              {resume.file_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(resume.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              {isOpt && <span className="ml-2 text-[#4edea3] font-medium">✓ Optimized</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {isSelected && <ChevronRight className="h-4 w-4 text-[#d0bcff]" />}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete "${resume.file_name}"?`)) deleteMutation.mutate(resume.id);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:text-[#ffb4ab] hover:bg-[#273647] transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* ATS Score summary card (if optimized) */}
            {optimizationResult && (
              <div
                className="rounded-3xl p-6"
                style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.2)' }}
              >
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <p className="mono-label text-xs uppercase tracking-widest text-slate-500 mb-1">ATS Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-[#d4e4fa]">{optimizationResult.optimized.ats_score_after}</span>
                      <span className="text-[#cbc3d7]">/ 100</span>
                    </div>
                  </div>
                  <span className="text-[#4edea3] font-bold flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    +{optimizationResult.optimized.ats_score_after - optimizationResult.analysis.ats_score_before} pts
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#273647] overflow-hidden mb-6">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${optimizationResult.optimized.ats_score_after}%`,
                      background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#273647]/30">
                    <p className="mono-label text-xs text-slate-500 uppercase tracking-widest mb-1">Keywords Added</p>
                    <p className="text-xl font-bold text-[#d4e4fa]">{optimizationResult.optimized.keywords_added?.length ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#273647]/30">
                    <p className="mono-label text-xs text-slate-500 uppercase tracking-widest mb-1">Improvements</p>
                    <p className="text-xl font-bold text-[#4edea3]">{optimizationResult.optimized.key_improvements?.length ?? 0}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── RIGHT PANEL ── */}
          <section className="lg:col-span-7 space-y-6">

            {/* Target Role / Optimization controls */}
            <div
              className="rounded-3xl p-8"
              style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.2)' }}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#d4e4fa]">
                <Zap className="w-5 h-5 text-[#4edea3]" />
                Target Role
                {selectedResume && (
                  <span className="ml-auto text-xs font-normal text-[#d0bcff] mono-label">{selectedResume.file_name}</span>
                )}
              </h3>

              <div className="space-y-5">
                {/* Job selector */}
                <div>
                  <label className="block text-xs mono-label text-slate-500 uppercase tracking-widest mb-2">
                    Select Job Description <span className="text-[#ffb4ab]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-transparent border-0 border-b py-3 text-base font-medium focus:outline-none transition-all appearance-none cursor-pointer pr-6 text-[#d4e4fa]"
                      style={{ borderColor: 'rgba(73,68,84,0.3)' }}
                    >
                      <option value="" className="bg-[#122131]">— Choose a job to tailor the resume —</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id} className="bg-[#122131]">
                          {job.title} @ {job.company}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected job preview */}
                {selectedJobId && (() => {
                  const j = jobs.find((j) => j.id === Number(selectedJobId));
                  if (!j) return null;
                  return (
                    <div
                      className="p-5 rounded-xl"
                      style={{ background: 'rgba(39,54,71,0.3)', border: '1px solid rgba(73,68,84,0.15)' }}
                    >
                      <div className="flex justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-[#d4e4fa]">{j.title}</h4>
                          <p className="text-sm text-[#cbc3d7]">{j.company}</p>
                        </div>
                        <span className="mono-label text-[10px] border border-[#273647] px-2 py-1 rounded h-fit" style={{ color: '#cbc3d7' }}>
                          ID: {j.id}
                        </span>
                      </div>
                      <p className="text-sm text-[#cbc3d7] leading-relaxed line-clamp-3">{j.description}</p>
                    </div>
                  );
                })()}

                {!selectedJobId && (
                  <p className="flex items-center gap-1.5 text-xs text-[#ffb4ab]">
                    <AlertCircle className="h-3.5 w-3.5" /> Select a job description to enable optimization
                  </p>
                )}
                {!selectedResumeId && (
                  <p className="flex items-center gap-1.5 text-xs text-[#ffb3af]">
                    <AlertCircle className="h-3.5 w-3.5" /> Select a resume from the left panel
                  </p>
                )}

                {/* Generate button */}
                <button
                  onClick={handleOptimize}
                  disabled={optimizeMutation.isPending || !selectedJobId || !selectedResumeId}
                  className="w-full py-5 font-extrabold text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                  style={{
                    background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                    color: '#340080',
                    boxShadow: '0 10px 30px -5px rgba(208,188,255,0.3)',
                  }}
                >
                  {optimizeMutation.isPending ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#340080] border-t-transparent" />
                      Optimizing with AI…
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      GENERATE OPTIMIZED RESUME
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Loading Progress ── */}
            {optimizeMutation.isPending && <LoadingProgress step={loadingStep} />}

            {/* ── Results section ── */}
            {!optimizeMutation.isPending && optimizationResult && (
              <>
                {/* ATS score bar + download buttons */}
                <ATSScoreBar
                  before={optimizationResult.analysis.ats_score_before ?? 0}
                  after={optimizationResult.optimized.ats_score_after ?? 0}
                  onDownloadPdf={() => handleDownload('pdf')}
                  onDownloadDocx={() => handleDownload('docx')}
                />

                {/* Tabs */}
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{ border: '1px solid rgba(73,68,84,0.2)' }}
                >
                  {/* Tab bar */}
                  <div
                    className="flex"
                    style={{ borderBottom: '1px solid rgba(73,68,84,0.2)', background: 'rgba(13,28,45,1)' }}
                  >
                    {([
                      { key: 'preview',  icon: Eye,       label: 'Preview' },
                      { key: 'analysis', icon: BarChart2, label: 'Analysis' },
                      { key: 'download', icon: Download,  label: 'Download' },
                    ] as const).map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex-1 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2
                          ${activeTab === key
                            ? 'text-[#d0bcff] border-b-2 border-[#d0bcff]'
                            : 'text-slate-400 hover:text-slate-200'}`}
                        style={{ background: activeTab === key ? 'rgba(39,54,71,0.3)' : 'transparent' }}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Preview tab */}
                  {activeTab === 'preview' && (
                    <div className="p-6 max-h-[75vh] overflow-y-auto" style={{ background: 'rgba(13,28,45,1)' }}>
                      <ResumePreviewNew data={optimizationResult.optimized} />
                    </div>
                  )}

                  {/* Analysis tab */}
                  {activeTab === 'analysis' && (
                    <div className="p-6 max-h-[75vh] overflow-y-auto" style={{ background: 'rgba(13,28,45,1)' }}>
                      <AnalysisPanel
                        analysis={optimizationResult.analysis}
                        optimized={optimizationResult.optimized}
                      />
                    </div>
                  )}

                  {/* Download tab */}
                  {activeTab === 'download' && (
                    <div className="p-8 space-y-5" style={{ background: 'rgba(13,28,45,1)' }}>
                      <div className="flex items-center justify-between">
                        <p className="mono-label text-xs text-slate-500 uppercase tracking-widest">
                          {optimizationResult.optimized.full_name || 'Resume'} — Export
                        </p>
                        <span
                          className="mono-label text-xs px-2 py-0.5 rounded text-[#4edea3]"
                          style={{ background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.2)' }}
                        >
                          ATS Optimized
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleDownload('pdf')}
                          className="flex flex-col items-center gap-3 rounded-2xl p-6 transition-all hover:-translate-y-1"
                          style={{ background: 'rgba(39,54,71,0.6)', border: '1px solid rgba(73,68,84,0.2)' }}
                        >
                          <FileDown className="h-8 w-8 text-[#ffb4ab]" />
                          <span className="text-sm font-bold text-[#d4e4fa]">Download PDF</span>
                          <span className="text-xs text-slate-400">Best for sharing</span>
                        </button>
                        <button
                          onClick={() => handleDownload('docx')}
                          className="flex flex-col items-center gap-3 rounded-2xl p-6 transition-all hover:-translate-y-1"
                          style={{ background: 'rgba(39,54,71,0.6)', border: '1px solid rgba(73,68,84,0.2)' }}
                        >
                          <FileText className="h-8 w-8 text-[#d0bcff]" />
                          <span className="text-sm font-bold text-[#d4e4fa]">Download DOCX</span>
                          <span className="text-xs text-slate-400">Best for editing</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        Both formats are ATS-optimized and professionally formatted
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Empty prompt when nothing is optimized yet */}
            {!optimizeMutation.isPending && !optimizationResult && (
              <div
                className="rounded-3xl p-10 text-center"
                style={{ border: '2px dashed rgba(73,68,84,0.3)', background: 'rgba(13,28,45,0.5)' }}
              >
                <Zap className="h-12 w-12 text-[#273647] mx-auto mb-4" />
                <p className="text-[#cbc3d7] text-sm">
                  Select a job and click <strong className="text-[#d0bcff]">GENERATE OPTIMIZED RESUME</strong> to see the magic
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;

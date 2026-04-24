import React, { useRef, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import {
  Upload, FileText, Trash2, Zap, X,
  CheckCircle, AlertCircle, TrendingUp, Tag, FileDown,
  ChevronRight, Sparkles, Copy, BarChart2, LayoutTemplate,
} from 'lucide-react';
import apiClient from '@/lib/api';
import { authStore } from '@/store/authStore';
import { trackEvent } from '@/lib/analytics';
import ResumeTemplateGallery from '@/components/resume/ResumeTemplateGallery';
import OptimizedResumeRenderer from '@/components/resume/OptimizedResumeRenderer';
import { getResumeTemplate } from '@/data/resumeTemplateRegistry';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Resume {
  id: number;
  file_name: string;
  original_filename?: string;
  original_content: string;
  optimized_content?: string;
  created_at: string;
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
    original_title: string; company: string; duration: string;
    relevance_score: number; relevant_keywords_found: string[];
    suggested_reorder_priority: number;
  }>;
  education_entries: Array<{ degree: string; institution: string; year: string; relevant_coursework: string[] }>;
  certifications: string[];
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  ats_score_before: number;
  job_title?: string;
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

function tryParseOptimizationResult(content?: string | null): OptimizationResult | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed?.analysis && parsed?.optimized) return parsed as OptimizationResult;
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
  a.href = href; a.download = filename;
  document.body.appendChild(a); a.click();
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
  <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--app-panel-strong)', border: '1px solid var(--app-border)' }}>
    <div className="flex items-center justify-center mb-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#273647]" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#d0bcff] border-r-[#4edea3] border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#d0bcff]" />
        </div>
      </div>
    </div>
    <div className="space-y-4 max-w-sm mx-auto">
      {LOADING_STEPS.map((text, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
            i < step ? 'bg-[#4edea3]' : i === step ? 'bg-[#d0bcff] animate-pulse' : 'bg-[#273647]'
          }`}>
            {i < step
              ? <CheckCircle className="w-4 h-4 text-[#051424]" />
              : <div className={`w-2 h-2 rounded-full ${i === step ? 'bg-[#340080]' : 'bg-[#494454]'}`} />}
          </div>
          <p className={`text-sm transition-all duration-500 text-left ${
            i < step ? 'text-[#4edea3]' : i === step ? 'theme-text font-semibold' : 'theme-text-subtle'
          }`}>{text}</p>
        </div>
      ))}
    </div>
    <p className="theme-text-subtle text-center text-xs mt-8 mono-label">Running two-stage AI pipeline — ~20–40 seconds</p>
  </div>
);

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
    <span className="rounded-full px-2.5 py-0.5 text-xs mono-label" style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {label}
    </span>
  );
};

// Look up accent colour from the new template data file
function getTemplateAccent(templateId: string): string {
  return getResumeTemplate(templateId).colors.accent;
}

const ResumePreview: React.FC<{ data: OptimizedResume; accentColor?: string }> = ({
  data,
  accentColor = '#1a56db',
}) => {
  const contactLine = [data.contact?.email, data.contact?.phone, data.contact?.location].filter(Boolean).join(' | ');
  const linkLine = [data.contact?.linkedin, data.contact?.portfolio].filter(Boolean).join(' · ');
  return (
    <div className="rounded-2xl bg-white text-slate-900 p-10 shadow-2xl font-sans text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center mb-6 pb-4" style={{ borderBottom: `2px solid ${accentColor}` }}>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{data.full_name}</h1>
        {contactLine && <p className="text-slate-500 text-xs mt-1">{contactLine}</p>}
        {linkLine && <p className="text-slate-400 text-xs mt-0.5">{linkLine}</p>}
      </div>

      {data.professional_summary && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Professional Summary</h2>
          <div className="w-full h-px mb-3" style={{ background: '#e2e8f0' }} />
          <p className="text-slate-700 leading-relaxed">{data.professional_summary}</p>
        </section>
      )}
      {data.technical_skills?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Technical Skills</h2>
          <div className="w-full h-px mb-3" style={{ background: '#e2e8f0' }} />
          <p className="text-slate-700 text-xs leading-relaxed">{data.technical_skills.join(' • ')}</p>
        </section>
      )}
      {data.professional_skills?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Professional Skills</h2>
          <div className="w-full h-px mb-3" style={{ background: '#e2e8f0' }} />
          <p className="text-slate-700 text-xs leading-relaxed">{data.professional_skills.join(' • ')}</p>
        </section>
      )}
      {data.experience?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Professional Experience</h2>
          <div className="w-full h-px mb-3" style={{ background: '#e2e8f0' }} />
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 pl-4" style={{ borderLeft: `2px solid ${accentColor}33` }}>
              <div className="flex items-baseline justify-between mb-0.5">
                <p className="font-bold text-slate-900">{exp.title} · {exp.company}</p>
                <p className="text-xs text-slate-400 font-mono ml-4 flex-shrink-0">{exp.duration}</p>
              </div>
              {exp.location && <p className="text-xs text-slate-400 mb-1">{exp.location}</p>}
              <ul className="mt-1 space-y-0.5">
                {exp.bullets?.map((bullet, j) => (
                  <li key={j} className="text-slate-600 text-xs flex gap-2">
                    <span className="flex-shrink-0" style={{ color: accentColor }}>•</span>{bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      {data.education?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Education</h2>
          <div className="w-full h-px mb-3" style={{ background: '#e2e8f0' }} />
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
      {data.projects?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Projects</h2>
          <div className="w-full h-px mb-3" style={{ background: '#e2e8f0' }} />
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <p className="font-semibold text-slate-900 text-sm">{proj.name}</p>
              {proj.technologies && <p className="text-xs text-slate-400 mt-0.5 italic">Technologies: {proj.technologies}</p>}
              <ul className="mt-1 space-y-0.5">
                {proj.bullets?.map((bullet, j) => (
                  <li key={j} className="text-slate-600 text-xs flex gap-2">
                    <span className="flex-shrink-0" style={{ color: accentColor }}>•</span>{bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      {data.certifications?.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Certifications</h2>
          <div className="w-full h-px mb-3" style={{ background: '#e2e8f0' }} />
          <ul className="space-y-0.5">
            {data.certifications.map((cert, i) => (
              <li key={i} className="text-slate-600 text-xs flex gap-2">
                <span className="flex-shrink-0" style={{ color: accentColor }}>•</span>{cert}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

const SuggestionsPanel: React.FC<{
  analysis: OptimizationAnalysis;
  optimized: OptimizedResume;
  jobDescription: string;
  onImproveSection: (section: string, currentText: string) => void;
  improvingSection: string | null;
}> = ({ analysis, optimized, jobDescription, onImproveSection, improvingSection }) => (
  <div className="space-y-6">
    {analysis.missing_critical_skills?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#ffb4ab] uppercase tracking-widest mb-3 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" /> Missing Keywords
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
    {optimized.keywords_added?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#4edea3] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" /> Keywords Added
        </p>
        <div className="flex flex-wrap gap-2">
          {optimized.keywords_added.map((k, i) => <SkillPill key={i} label={k} variant="keyword" />)}
        </div>
      </div>
    )}

    {/* Weak sections — improve buttons */}
    <div>
      <p className="mono-label text-xs text-[#d0bcff] uppercase tracking-widest mb-3">Weak Sections</p>
      <div className="space-y-3">
        {optimized.professional_summary && (
          <div className="flex items-start justify-between gap-3 p-4 rounded-xl" style={{ background: 'var(--app-panel-soft)', border: '1px solid var(--app-border)' }}>
            <div>
              <p className="theme-text text-sm font-semibold mb-0.5">Professional Summary</p>
              <p className="theme-text-muted text-xs line-clamp-2">{optimized.professional_summary}</p>
            </div>
            <button
              onClick={() => onImproveSection('professional_summary', optimized.professional_summary)}
              disabled={improvingSection === 'professional_summary'}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-[#4edea3] border border-[#4edea3]/30 hover:bg-[#4edea3]/10 transition-colors disabled:opacity-50"
            >
              {improvingSection === 'professional_summary' ? 'Improving…' : 'Improve →'}
            </button>
          </div>
        )}
        {optimized.experience?.slice(0, 2).map((exp, i) => (
          <div key={i} className="flex items-start justify-between gap-3 p-4 rounded-xl" style={{ background: 'var(--app-panel-soft)', border: '1px solid var(--app-border)' }}>
            <div>
              <p className="theme-text text-sm font-semibold mb-0.5">{exp.title} · {exp.company}</p>
              <p className="theme-text-muted text-xs line-clamp-1">{exp.bullets?.[0] || 'Experience bullets'}</p>
            </div>
            <button
              onClick={() => onImproveSection(`experience_${i}`, exp.bullets?.join('\n') || '')}
              disabled={improvingSection === `experience_${i}`}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-[#4edea3] border border-[#4edea3]/30 hover:bg-[#4edea3]/10 transition-colors disabled:opacity-50"
            >
              {improvingSection === `experience_${i}` ? 'Improving…' : 'Improve →'}
            </button>
          </div>
        ))}
      </div>
    </div>

    {analysis.gap_analysis && (
      <div className="p-4 rounded-xl" style={{ background: 'var(--app-panel-soft)', border: '1px solid var(--app-border)' }}>
        <p className="theme-text-subtle mono-label text-xs uppercase tracking-widest mb-2">Skill Gap Analysis</p>
        <p className="theme-text-muted text-sm leading-relaxed">{analysis.gap_analysis}</p>
      </div>
    )}
  </div>
);

const ComparisonPanel: React.FC<{ original: string; optimized: OptimizedResume }> = ({ original, optimized }) => {
  const optimizedText = [
    optimized.full_name,
    optimized.professional_summary,
    ...(optimized.technical_skills || []),
    ...(optimized.experience || []).flatMap((e) => e.bullets || []),
  ].filter(Boolean).join('\n\n');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="theme-text-subtle mono-label text-xs uppercase tracking-widest mb-3">Original</p>
        <div className="rounded-xl p-5 theme-text-muted text-sm leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto"
          style={{ background: 'var(--app-panel-soft)', border: '1px solid var(--app-border)' }}>
          {original || 'No original content available.'}
        </div>
      </div>
      <div>
        <p className="mono-label text-xs text-[#4edea3] uppercase tracking-widest mb-3">Optimized</p>
        <div className="rounded-xl p-5 theme-text text-sm leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto"
          style={{ background: 'var(--app-panel)', border: '1px solid rgba(78,222,163,0.2)' }}>
          {optimizedText}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TONE_OPTIONS = ['Professional', 'Concise', 'Detailed', 'Creative'];

const ResumePage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = authStore();
  const location = useLocation();

  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(
    (location.state as any)?.resumeId ?? null
  );
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitleOverride, setJobTitleOverride] = useState('');
  const [company, setCompany] = useState('');
  const [tone, setTone] = useState('Professional');
  const [activeTab, setActiveTab] = useState<'preview' | 'suggestions' | 'comparison'>('preview');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [improvingSection, setImprovingSection] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic-professional');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  // When selected resume changes, load existing optimization
  useEffect(() => {
    if (!selectedResumeId) { setOptimizationResult(null); return; }
    const resume = resumes.find((r) => r.id === selectedResumeId);
    const parsed = tryParseOptimizationResult(resume?.optimized_content);
    setOptimizationResult(parsed);
    if (parsed) setActiveTab('preview');
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
      showToast('Resume uploaded — text extracted successfully.');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.detail || 'Upload failed.', 'error');
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: ({ resumeId, jobDescription, templateId, jobTitle, companyName, tone }: {
      resumeId: number; jobDescription: string; templateId: string;
      jobTitle?: string; companyName?: string; tone?: string;
    }) =>
      apiClient
        .post(`/resumes/${resumeId}/optimize`, null, {
          params: {
            job_description: jobDescription,
            template_id: templateId,
            ...(jobTitle ? { job_title: jobTitle } : {}),
            ...(companyName ? { company: companyName } : {}),
            ...(tone ? { tone: tone.toLowerCase() } : {}),
          },
          timeout: 120_000,
        })
        .then((r) => r.data),
    onSuccess: (response: { status: string; data: OptimizationResult }, variables) => {
      const result = response.data ?? response;
      const parsed = tryParseOptimizationResult(
        typeof result === 'string' ? result : JSON.stringify(result)
      ) ?? (result as OptimizationResult);
      setOptimizationResult(parsed);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setActiveTab('preview');
      trackEvent('preview_opened', {
        funnelStep: 'preview_opened',
        metadata: { resume_id: variables.resumeId, template_id: variables.templateId },
      });
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

  const improveSectionMutation = useMutation({
    mutationFn: ({ section, currentText }: { section: string; currentText: string }) =>
      apiClient.post('/ai/improve-section', {
        section,
        current_text: currentText,
        job_description: jobDescription,
      }).then((r) => r.data),
    onSuccess: (data, variables) => {
      if (!optimizationResult) return;
      const improved = data.improved_text || data;
      const updated = { ...optimizationResult };
      if (variables.section === 'professional_summary') {
        updated.optimized = { ...updated.optimized, professional_summary: improved };
      } else if (variables.section.startsWith('experience_')) {
        const idx = parseInt(variables.section.split('_')[1]);
        const newExp = [...updated.optimized.experience];
        newExp[idx] = { ...newExp[idx], bullets: improved.split('\n').filter(Boolean) };
        updated.optimized = { ...updated.optimized, experience: newExp };
      }
      setOptimizationResult(updated);
      setImprovingSection(null);
      showToast('Section improved!');
    },
    onError: (err: any) => {
      setImprovingSection(null);
      showToast(err.response?.data?.detail || 'Section improvement failed.', 'error');
    },
  });

  // Advance loading step every ~7s while optimizing
  useEffect(() => {
    if (!optimizeMutation.isPending) { setLoadingStep(0); return; }
    let idx = 0;
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, LOADING_STEPS.length - 1);
      setLoadingStep(idx);
    }, 7000);
    return () => clearInterval(interval);
  }, [optimizeMutation.isPending]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const handleOptimize = () => {
    if (!selectedResumeId) { showToast('Select a resume first.', 'error'); return; }
    if (!jobDescription.trim()) { showToast('Paste a job description first.', 'error'); return; }
    optimizeMutation.mutate({
      resumeId: selectedResumeId,
      jobDescription: jobDescription.trim(),
      templateId: selectedTemplateId,
      jobTitle: jobTitleOverride.trim() || undefined,
      companyName: company.trim() || undefined,
      tone,
    });
  };

  const handleDownload = async (type: 'pdf' | 'docx') => {
    if (!selectedResumeId) return;
    const name = optimizationResult?.optimized?.full_name?.trim().replace(/\s+/g, '_') || 'resume';
    const jt = jobTitleOverride.trim() || '';
    const suggestedFilename = jt
      ? `${name}_${jt.replace(/\s+/g, '_')}.${type}`
      : `${name}_Tailored_Resume.${type}`;
    try {
      const params: Record<string, string> = { template_id: selectedTemplateId };
      if (jt) params.job_title = jt;
      await downloadBlob(
        `/resumes/${selectedResumeId}/download/${type}?` + new URLSearchParams(params).toString(),
        suggestedFilename,
      );
      showToast(`Downloaded ${suggestedFilename}`);
    } catch (err: any) {
      let detail = err?.message || 'Unknown error';
      if (err?.response?.data instanceof Blob) {
        try { const t = await (err.response.data as Blob).text(); detail = JSON.parse(t)?.detail ?? detail; } catch {}
      } else if (err?.response?.data?.detail) { detail = err.response.data.detail; }
      showToast(`Download failed: ${detail}`, 'error');
    }
  };

  const handleCopyText = () => {
    if (!optimizationResult) return;
    const text = [
      optimizationResult.optimized.full_name,
      optimizationResult.optimized.professional_summary,
      'Skills: ' + optimizationResult.optimized.technical_skills?.join(', '),
      ...optimizationResult.optimized.experience.map((e) =>
        `${e.title} · ${e.company}\n${e.bullets.map((b) => `• ${b}`).join('\n')}`
      ),
    ].join('\n\n');
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const handleImproveSection = (section: string, currentText: string) => {
    if (!jobDescription.trim()) { showToast('Paste a job description to improve sections.', 'error'); return; }
    setImprovingSection(section);
    improveSectionMutation.mutate({ section, currentText });
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) ?? null;

  if (!user) {
    return (
      <div className="theme-shell flex items-center justify-center min-h-screen">
        <p className="theme-text-subtle">Please log in to manage your resumes.</p>
      </div>
    );
  }

  return (
    <div className="theme-shell min-h-screen">
      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl"
          style={
            toast.type === 'success'
              ? { background: 'rgba(0,165,114,0.2)', border: '1px solid rgba(78,222,163,0.3)', color: '#4edea3' }
              : { background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.3)', color: '#ffb4ab' }
          }
        >
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="theme-text text-4xl font-extrabold tracking-tight mb-1">
            Resume <span className="genie-gradient-text">Optimizer</span>
          </h2>
          <p className="theme-text-muted mono-label text-sm uppercase tracking-widest">
            Upload resume · Paste JD · AI Optimize · Download
          </p>
        </div>

        {/* ── Split Screen ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5">

          {/* LEFT — Source Document */}
          <div className="glass-card rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--app-border)' }}>
            <h3 className="theme-text-subtle text-sm font-bold uppercase tracking-widest mono-label">Source Document</h3>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                uploadMutation.isPending
                  ? 'border-[#d0bcff]/50 bg-[#d0bcff]/5'
                  : 'border-[#273647]/60 hover:border-[#d0bcff]/50 hover:bg-[#d0bcff]/5'
              }`}
            >
              <div className="theme-panel w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                {uploadMutation.isPending
                  ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d0bcff] border-t-transparent" />
                  : <Upload className="w-5 h-5 text-[#d0bcff]" />}
              </div>
              {uploadMutation.isPending
                ? <p className="text-sm text-[#d0bcff]">Extracting text…</p>
                : <>
                    <p className="theme-text font-bold mb-1">Drop resume here</p>
                    <p className="theme-text-subtle text-xs">PDF, DOCX - up to 10 MB</p>
                  </>}
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Resume list */}
            <div className="space-y-1.5">
              {resumesLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d0bcff] border-t-transparent" />
                </div>
              ) : resumes.length === 0 ? (
                <div className="theme-text-subtle text-center py-6">
                  <FileText className="h-7 w-7 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No resumes yet — upload one above</p>
                </div>
              ) : (
                resumes.map((resume) => {
                  const isSelected = resume.id === selectedResumeId;
                  const isOpt = !!tryParseOptimizationResult(resume.optimized_content);
                  return (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border border-[#d0bcff]/30'
                          : 'border border-transparent hover:border-[color:var(--app-border)]'
                      }`}
                      style={{ background: isSelected ? 'color-mix(in srgb, var(--app-panel) 78%, #d0bcff 22%)' : 'transparent' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: isSelected ? 'rgba(208,188,255,0.12)' : 'var(--app-panel-soft)' }}
                      >
                        <FileText className={`h-4 w-4 ${isSelected ? 'text-[#d0bcff]' : 'theme-text-subtle'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'theme-text' : 'theme-text-muted'}`}>
                          {resume.file_name || resume.original_filename}
                        </p>
                        <p className="theme-text-subtle text-xs">
                          {new Date(resume.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {isOpt && <span className="ml-2 text-[#4edea3]">✓ Optimized</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && <ChevronRight className="h-4 w-4 text-[#d0bcff]" />}
                        <button
                          onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${resume.file_name}"?`)) deleteMutation.mutate(resume.id); }}
                          className="theme-text-subtle rounded-lg p-1.5 hover:text-[#ffb4ab] transition-colors"
                          style={{ background: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-panel-soft)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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

          {/* RIGHT — Target Role */}
          <div className="glass-card rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--app-border)' }}>
            <h3 className="theme-text-subtle text-sm font-bold uppercase tracking-widest mono-label">Target Role</h3>

            <div>
              <label className="theme-text-subtle block text-xs mono-label uppercase tracking-widest mb-2">
                Job Description <span className="text-[#ffb4ab]">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onBlur={() => {
                  if (jobDescription.trim().length > 0) {
                    trackEvent('jd_pasted', {
                      funnelStep: 'jd_pasted',
                      metadata: { length: jobDescription.trim().length },
                    });
                  }
                }}
                rows={7}
                placeholder="Paste the full job description here…&#10;&#10;Include the title, responsibilities, and requirements for best results."
                className="theme-input w-full rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40 transition-all"
                style={{ background: 'var(--app-panel-soft)' }}
              />
            </div>

            {/* Job title + Company */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="theme-text-subtle block text-xs mono-label uppercase tracking-widest mb-2">
                  Job Title <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitleOverride}
                  onChange={(e) => setJobTitleOverride(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="theme-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40 transition-all"
                  style={{ background: 'var(--app-panel-soft)' }}
                />
              </div>
              <div>
                <label className="theme-text-subtle block text-xs mono-label uppercase tracking-widest mb-2">
                  Company <span className="theme-text-subtle">(optional)</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="theme-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40 transition-all"
                  style={{ background: 'var(--app-panel-soft)' }}
                />
              </div>
            </div>
            <p className="theme-text-subtle text-[10px] -mt-3 mono-label">
              Export file: {optimizationResult?.optimized?.full_name?.replace(/\s+/g, '_') || 'Name'}_{jobTitleOverride.trim().replace(/\s+/g, '_') || 'Tailored_Resume'}.pdf/docx
            </p>

            <div>
              <label className="theme-text-subtle block text-xs mono-label uppercase tracking-widest mb-2">
                Resume Tone <span className="theme-text-subtle">(optional)</span>
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="theme-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none cursor-pointer"
                style={{ background: 'var(--app-panel-soft)' }}
              >
                {TONE_OPTIONS.map((t) => <option key={t} value={t} className="bg-[#122131]">{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Template Selector ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'var(--app-panel-strong)', border: '1px solid var(--app-border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <LayoutTemplate className="w-4 h-4 text-[#d0bcff]" />
            <h3 className="theme-text-subtle text-sm font-bold uppercase tracking-widest mono-label">
              Resume Template
            </h3>
          </div>
          <ResumeTemplateGallery
            selectedId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
            onUpgradeCta={() => setShowUpgradeModal(true)}
          />
        </div>

        {/* ── Upgrade Modal ─────────────────────────────────────────────── */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
              className="w-full max-w-md rounded-2xl p-8 text-center space-y-5 relative"
              style={{
                background: 'var(--app-panel-strong)',
                border: '1px solid var(--app-border)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              }}
            >
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="theme-text-subtle absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:text-[color:var(--app-text)]"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-panel-soft)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <X className="w-4 h-4" />
              </button>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                  boxShadow: '0 8px 24px rgba(208,188,255,0.3)',
                }}
              >
                <Zap className="w-7 h-7 text-[#340080]" />
              </div>
              <div>
                <h3 className="theme-text text-xl font-bold mb-1.5">Unlock More Templates</h3>
                <p className="theme-text-muted text-sm">
                  Upgrade your plan to access additional ATS-optimized templates.
                  Job Seeker unlocks 2 templates; Interview Cracker unlocks all 10.
                </p>
              </div>
              <a
                href="/subscription"
                className="block w-full py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity text-center"
                style={{
                  background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                  color: '#340080',
                }}
              >
                View Plans →
              </a>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="theme-text-subtle block mx-auto text-xs transition-colors hover:text-[#d0bcff]"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* ── Optimize Button ───────────────────────────────────────────── */}
        <button
          onClick={handleOptimize}
          disabled={optimizeMutation.isPending || !selectedResumeId || !jobDescription.trim()}
          className="w-full py-5 font-extrabold text-lg rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 group mb-10"
          style={{
            background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
            color: '#340080',
            boxShadow: '0 10px 40px -8px rgba(208,188,255,0.35)',
          }}
        >
          {optimizeMutation.isPending ? (
            <><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#340080] border-t-transparent" />Optimizing with AI…</>
          ) : (
            <><Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />✨ OPTIMIZE RESUME</>
          )}
        </button>

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {optimizeMutation.isPending && (
          <div className="mb-10">
            <LoadingProgress step={loadingStep} />
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────── */}
        {optimizationResult && !optimizeMutation.isPending && (
          <div className="space-y-6">
            {/* Result header bar */}
            <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              style={{ background: 'var(--app-panel-strong)', border: '1px solid var(--app-border)' }}>
              {/* ATS scores */}
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="text-center">
                  <p className="theme-text-subtle mono-label text-[10px] uppercase tracking-widest mb-0.5">Before</p>
                  <p className="text-3xl font-extrabold text-[#ffb4ab]">{optimizationResult.analysis.ats_score_before}</p>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-4 w-4 text-[#4edea3]" />
                  <span className="mono-label text-xs font-bold text-[#4edea3]">
                    +{optimizationResult.optimized.ats_score_after - optimizationResult.analysis.ats_score_before}
                  </span>
                </div>
                <div className="text-center">
                  <p className="theme-text-subtle mono-label text-[10px] uppercase tracking-widest mb-0.5">After</p>
                  <p className="text-3xl font-extrabold text-[#4edea3]">{optimizationResult.optimized.ats_score_after}</p>
                </div>
              </div>

              {/* ATS bar */}
              <div className="flex-1 w-full">
                <div className="flex justify-between mb-1">
                  <p className="theme-text-subtle mono-label text-[10px] uppercase tracking-widest">ATS Score</p>
                  <p className="mono-label text-[10px] text-[#4edea3]">{optimizationResult.optimized.ats_score_after}/100</p>
                </div>
                <div className="h-2 w-full rounded-full" style={{ background: 'var(--app-panel-soft)' }}>
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${optimizationResult.optimized.ats_score_after}%`, background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }} />
                </div>
              </div>

              {/* Keywords badge */}
              <div className="hidden sm:block text-center flex-shrink-0">
                <p className="theme-text-subtle mono-label text-[10px] uppercase tracking-widest mb-0.5">Keywords</p>
                <p className="text-2xl font-extrabold text-[#d0bcff]">+{optimizationResult.optimized.keywords_added?.length ?? 0}</p>
              </div>

              {/* Download / copy */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {/* Active template badge */}
                <div className="flex items-center gap-1.5 mb-1">
                  <LayoutTemplate className="theme-text-subtle w-3 h-3" />
                  <span className="theme-text-subtle text-[10px] mono-label uppercase tracking-wider truncate max-w-[110px]">
                    {getResumeTemplate(selectedTemplateId).name}
                  </span>
                </div>
                <button onClick={() => handleDownload('pdf')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)', color: '#340080' }}>
                  <FileDown className="w-4 h-4" />PDF
                </button>
                <button onClick={() => handleDownload('docx')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'var(--app-panel)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}>
                  <FileText className="w-4 h-4" />DOCX
                </button>
                <button onClick={handleCopyText}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'var(--app-panel-soft)', border: '1px solid var(--app-border)', color: 'var(--app-text-muted)' }}>
                  <Copy className="w-4 h-4" />Copy
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--app-panel-soft)' }}>
              {([
                { id: 'preview', label: 'Optimized Resume', icon: FileText },
                { id: 'suggestions', label: 'AI Suggestions', icon: Sparkles },
                { id: 'comparison', label: 'Comparison', icon: BarChart2 },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === id
                      ? 'text-[#d0bcff]'
                      : 'theme-text-subtle hover:text-[color:var(--app-text)]'
                  }`}
                  style={activeTab === id ? { background: 'var(--app-panel)' } : undefined}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--app-panel-strong)', border: '1px solid var(--app-border)' }}>
              {activeTab === 'preview' && (
                <OptimizedResumeRenderer
                  data={optimizationResult.optimized}
                  templateId={selectedTemplateId}
                />
              )}
              {activeTab === 'suggestions' && (
                <SuggestionsPanel
                  analysis={optimizationResult.analysis}
                  optimized={optimizationResult.optimized}
                  jobDescription={jobDescription}
                  onImproveSection={handleImproveSection}
                  improvingSection={improvingSection}
                />
              )}
              {activeTab === 'comparison' && (
                <ComparisonPanel
                  original={selectedResume?.original_content || ''}
                  optimized={optimizationResult.optimized}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePage;

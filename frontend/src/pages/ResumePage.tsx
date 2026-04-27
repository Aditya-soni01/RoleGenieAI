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
import OptimizedResumePreview from '@/components/resume/OptimizedResumePreview';
import { getResumeTemplate } from '@/data/resumeTemplateRegistry';
import type { ResumePreviewData } from '@/types/resumePreview';

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

interface OptimizationResult {
  analysis: OptimizationAnalysis;
  previewData: ResumePreviewData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function splitDescriptionToBullets(value: unknown): string[] {
  const text = toText(value);
  if (!text) return [];
  const byLines = text
    .split(/\r?\n|•|●|▪|◦/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (byLines.length > 1) return byLines;
  const bySentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (bySentences.length > 1) return bySentences;
  return [text];
}

function extractBullets(source: any): string[] {
  const direct = [
    ...toStringArray(source?.bullets),
    ...toStringArray(source?.responsibilities),
    ...toStringArray(source?.achievements),
  ].filter(Boolean);
  return direct.length > 0 ? direct : splitDescriptionToBullets(source?.description);
}

function normalizePreviewData(input: any, fallbackTemplateId = 'classic-professional'): ResumePreviewData {
  const top = (input && typeof input === 'object' && input.data && typeof input.data === 'object')
    ? input.data
    : input;
  const payload = (top && typeof top === 'object' && top.optimized && typeof top.optimized === 'object')
    ? { ...top.optimized, __root: top }
    : { ...(top || {}), __root: top || {} };
  const personalInfo = payload.personalInfo || payload.personal_info || {};
  const contact = payload.contact || {};
  const rawSkills = Array.isArray(payload.skills)
    ? toStringArray(payload.skills)
    : (payload.skills && typeof payload.skills === 'object')
      ? [
          ...toStringArray(payload.skills.technical),
          ...toStringArray(payload.skills.professional),
          ...toStringArray(payload.skills.core),
          ...toStringArray(payload.skills.all),
        ]
      : toStringArray(payload.skills);
  const mergedSkills = [
    ...rawSkills,
    ...toStringArray(payload.technicalSkills),
    ...toStringArray(payload.professional_skills),
    ...toStringArray(payload.professionalSkills),
    ...toStringArray(payload.technical_skills),
  ]
    .map((item) => item.trim())
    .filter(Boolean);
  const uniqueSkills = Array.from(new Set(mergedSkills));

  const experience = Array.isArray(payload.experience)
    ? payload.experience.map((exp: any) => ({
        title: toText(exp?.title || exp?.role || exp?.position),
        company: toText(exp?.company || exp?.organization),
        location: toText(exp?.location),
        dateRange: toText(exp?.dateRange || exp?.duration || exp?.date || exp?.timeline),
        bullets: extractBullets(exp),
      }))
      .filter((entry) => entry.title || entry.company || entry.dateRange || entry.bullets.length > 0)
    : [];

  const projects = Array.isArray(payload.projects)
    ? payload.projects.map((project: any) => ({
        name: toText(project?.name || project?.title),
        technologies: toStringArray(project?.technologies),
        bullets: extractBullets(project),
      }))
      .filter((entry) => entry.name || entry.bullets.length > 0)
    : [];

  const education = Array.isArray(payload.education)
    ? payload.education.map((edu: any) => ({
        degree: toText(edu?.degree),
        institution: toText(edu?.institution || edu?.school),
        year: toText(edu?.year || edu?.date || edu?.graduationYear),
        details: toText(edu?.details || edu?.description),
      }))
      .filter((entry) => entry.degree || entry.institution || entry.year || entry.details)
    : [];

  const root = payload.__root || {};
  return {
    personalInfo: {
      fullName: toText(personalInfo.fullName || personalInfo.full_name || payload.full_name || payload.fullName || payload.name),
      email: toText(personalInfo.email || contact.email || payload.email),
      phone: toText(personalInfo.phone || contact.phone || payload.phone),
      location: toText(personalInfo.location || contact.location || payload.location),
      linkedin: toText(personalInfo.linkedin || contact.linkedin || payload.linkedin || payload.linkedin_url),
      portfolio: toText(personalInfo.portfolio || contact.portfolio || payload.portfolio || payload.portfolio_url),
    },
    professionalSummary: toText(payload.professionalSummary || payload.professional_summary || payload.summary),
    skills: uniqueSkills,
    experience,
    projects,
    education,
    certifications: toStringArray(payload.certifications),
    templateId: toText(root.templateId || root.template_id || payload.templateId || payload.template_id) || fallbackTemplateId,
    atsScore: Number(payload.atsScore || payload.ats_score_after || root.atsScore || root.ats_score_after || 0) || undefined,
    matchScore: Number(payload.matchScore || payload.match_score || root.matchScore || root.match_score || 0) || undefined,
    keywordsAdded: toStringArray(payload.keywords_added || payload.keywordsAdded),
  };
}

function normalizeAnalysis(input: any): OptimizationAnalysis {
  const top = (input && typeof input === 'object' && input.data && typeof input.data === 'object')
    ? input.data
    : input;
  const analysis = (top && typeof top === 'object' && top.analysis && typeof top.analysis === 'object')
    ? top.analysis
    : {};
  return {
    candidate_name: toText(analysis.candidate_name),
    candidate_email: toText(analysis.candidate_email),
    candidate_phone: toText(analysis.candidate_phone),
    candidate_location: toText(analysis.candidate_location),
    linkedin_url: toText(analysis.linkedin_url),
    portfolio_url: toText(analysis.portfolio_url),
    matched_hard_skills: toStringArray(analysis.matched_hard_skills),
    matched_soft_skills: toStringArray(analysis.matched_soft_skills),
    missing_critical_skills: toStringArray(analysis.missing_critical_skills),
    missing_nice_to_have_skills: toStringArray(analysis.missing_nice_to_have_skills),
    transferable_skills: toStringArray(analysis.transferable_skills),
    experience_entries: Array.isArray(analysis.experience_entries) ? analysis.experience_entries : [],
    education_entries: Array.isArray(analysis.education_entries) ? analysis.education_entries : [],
    certifications: toStringArray(analysis.certifications),
    projects: Array.isArray(analysis.projects) ? analysis.projects : [],
    ats_score_before: Number(analysis.ats_score_before || top?.atsScoreBefore || top?.ats_score_before || 0),
    job_title: toText(analysis.job_title),
    gap_analysis: toText(analysis.gap_analysis),
    reorder_strategy: toText(analysis.reorder_strategy),
  };
}

function normalizeOptimizationResult(input: unknown, fallbackTemplateId = 'classic-professional'): OptimizationResult | null {
  if (!input) return null;
  let parsed: any = input;
  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const previewData = normalizePreviewData(parsed, fallbackTemplateId);
  const hasRenderableData =
    !!previewData.personalInfo.fullName ||
    !!previewData.professionalSummary ||
    previewData.skills.length > 0 ||
    previewData.experience.length > 0 ||
    previewData.projects.length > 0 ||
    previewData.education.length > 0;
  if (!hasRenderableData) return null;
  try {
    return {
      analysis: normalizeAnalysis(parsed),
      previewData,
    };
  } catch {
    return null;
  }
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

const SuggestionsPanel: React.FC<{
  analysis: OptimizationAnalysis;
  optimized: ResumePreviewData;
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
    {optimized.keywordsAdded?.length > 0 && (
      <div>
        <p className="mono-label text-xs text-[#4edea3] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" /> Keywords Added
        </p>
        <div className="flex flex-wrap gap-2">
          {optimized.keywordsAdded.map((k, i) => <SkillPill key={i} label={k} variant="keyword" />)}
        </div>
      </div>
    )}

    {/* Weak sections — improve buttons */}
    <div>
      <p className="mono-label text-xs text-[#d0bcff] uppercase tracking-widest mb-3">Weak Sections</p>
      <div className="space-y-3">
        {optimized.professionalSummary && (
          <div className="flex items-start justify-between gap-3 p-4 rounded-xl" style={{ background: 'var(--app-panel-soft)', border: '1px solid var(--app-border)' }}>
            <div>
              <p className="theme-text text-sm font-semibold mb-0.5">Professional Summary</p>
              <p className="theme-text-muted text-xs line-clamp-2">{optimized.professionalSummary}</p>
            </div>
            <button
              onClick={() => onImproveSection('professional_summary', optimized.professionalSummary)}
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

const ComparisonPanel: React.FC<{ original: string; optimized: ResumePreviewData }> = ({ original, optimized }) => {
  const optimizedText = [
    optimized.personalInfo.fullName,
    optimized.professionalSummary,
    ...(optimized.skills || []),
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
    const parsed = normalizeOptimizationResult(resume?.optimized_content, selectedTemplateId);
    setOptimizationResult(parsed);
    if (parsed) {
      setSelectedTemplateId(parsed.previewData.templateId);
      setActiveTab('preview');
    }
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
    onSuccess: (response: any, variables) => {
      if (import.meta.env.DEV) {
        const raw = response?.data ?? response;
        console.debug('[resume-optimize] response shape', {
          rootKeys: raw && typeof raw === 'object' ? Object.keys(raw) : [],
          optimizedKeys: raw?.optimized && typeof raw.optimized === 'object' ? Object.keys(raw.optimized) : [],
          hasPersonalInfo: !!(raw?.personalInfo || raw?.optimized?.personalInfo),
          hasExperience: Array.isArray(raw?.experience) || Array.isArray(raw?.optimized?.experience),
        });
      }
      const result = response.data ?? response;
      const parsed = normalizeOptimizationResult(result, variables.templateId);
      if (!parsed) {
        showToast('Optimization succeeded but preview data was invalid.', 'error');
        return;
      }
      setOptimizationResult(parsed);
      setSelectedTemplateId(parsed.previewData.templateId);
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
        updated.previewData = { ...updated.previewData, professionalSummary: improved };
      } else if (variables.section.startsWith('experience_')) {
        const idx = parseInt(variables.section.split('_')[1]);
        const newExp = [...updated.previewData.experience];
        newExp[idx] = { ...newExp[idx], bullets: improved.split('\n').filter(Boolean) };
        updated.previewData = { ...updated.previewData, experience: newExp };
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
    const activeTemplateId = optimizationResult?.previewData.templateId || selectedTemplateId;
    const name = optimizationResult?.previewData?.personalInfo.fullName?.trim().replace(/\s+/g, '_') || 'resume';
    const jt = jobTitleOverride.trim() || '';
    const suggestedFilename = jt
      ? `${name}_${jt.replace(/\s+/g, '_')}.${type}`
      : `${name}_Tailored_Resume.${type}`;
    try {
      const params: Record<string, string> = { template_id: activeTemplateId };
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
      optimizationResult.previewData.personalInfo.fullName,
      optimizationResult.previewData.professionalSummary,
      'Skills: ' + optimizationResult.previewData.skills?.join(', '),
      ...optimizationResult.previewData.experience.map((e) =>
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
                  const isOpt = !!normalizeOptimizationResult(resume.optimized_content, selectedTemplateId);
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
              Export file: {optimizationResult?.previewData?.personalInfo.fullName?.replace(/\s+/g, '_') || 'Name'}_{jobTitleOverride.trim().replace(/\s+/g, '_') || 'Tailored_Resume'}.pdf/docx
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
                    +{(optimizationResult.previewData.atsScore ?? 0) - optimizationResult.analysis.ats_score_before}
                  </span>
                </div>
                <div className="text-center">
                  <p className="theme-text-subtle mono-label text-[10px] uppercase tracking-widest mb-0.5">After</p>
                  <p className="text-3xl font-extrabold text-[#4edea3]">{optimizationResult.previewData.atsScore ?? 0}</p>
                </div>
              </div>

              {/* ATS bar */}
              <div className="flex-1 w-full">
                <div className="flex justify-between mb-1">
                  <p className="theme-text-subtle mono-label text-[10px] uppercase tracking-widest">ATS Score</p>
                  <p className="mono-label text-[10px] text-[#4edea3]">{optimizationResult.previewData.atsScore ?? 0}/100</p>
                </div>
                <div className="h-2 w-full rounded-full" style={{ background: 'var(--app-panel-soft)' }}>
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(0, Math.min(100, optimizationResult.previewData.atsScore ?? 0))}%`, background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }} />
                </div>
              </div>

              {/* Keywords badge */}
              <div className="hidden sm:block text-center flex-shrink-0">
                <p className="theme-text-subtle mono-label text-[10px] uppercase tracking-widest mb-0.5">Keywords</p>
                <p className="text-2xl font-extrabold text-[#d0bcff]">+{optimizationResult.previewData.keywordsAdded?.length ?? 0}</p>
              </div>

              {/* Download / copy */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {/* Active template badge */}
                <div className="flex items-center gap-1.5 mb-1">
                  <LayoutTemplate className="theme-text-subtle w-3 h-3" />
                  <span className="theme-text-subtle text-[10px] mono-label uppercase tracking-wider truncate max-w-[110px]">
                    {getResumeTemplate(optimizationResult.previewData.templateId || selectedTemplateId).name}
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
                <OptimizedResumePreview
                  data={optimizationResult.previewData}
                  templateId={optimizationResult.previewData.templateId || selectedTemplateId}
                />
              )}
              {activeTab === 'suggestions' && (
                <SuggestionsPanel
                  analysis={optimizationResult.analysis}
                  optimized={optimizationResult.previewData}
                  jobDescription={jobDescription}
                  onImproveSection={handleImproveSection}
                  improvingSection={improvingSection}
                />
              )}
              {activeTab === 'comparison' && (
                <ComparisonPanel
                  original={selectedResume?.original_content || ''}
                  optimized={optimizationResult.previewData}
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

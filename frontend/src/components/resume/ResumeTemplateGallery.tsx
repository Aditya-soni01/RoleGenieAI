import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import apiClient from '@/lib/api';
import { authStore } from '@/store/authStore';
import {
  getResumeTemplate,
  RESUME_TEMPLATE_DEFINITIONS,
} from '@/data/resumeTemplateRegistry';
import ResumeTemplateCard from '@/components/resume/ResumeTemplateCard';

interface ApiTemplate {
  id: string;
  sort_order: number;
  locked: boolean;
}

interface ApiResponse {
  plan: string;
  templates: ApiTemplate[];
}

interface ResumeTemplateGalleryProps {
  selectedId: string;
  onSelect: (templateId: string) => void;
  onUpgradeCta?: () => void;
}

const PLAN_DISPLAY: Record<string, string> = {
  starter: 'Starter',
  job_seeker: 'Job Seeker',
  interview_cracker: 'Interview Cracker',
};

const ResumeTemplateGallery: React.FC<ResumeTemplateGalleryProps> = ({
  selectedId,
  onSelect,
  onUpgradeCta,
}) => {
  const { user } = authStore();
  const [showAll, setShowAll] = useState(false);
  const selectedTemplate = getResumeTemplate(selectedId);

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ['templates'],
    queryFn: () => apiClient.get('/templates').then((r) => r.data),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const apiByLegacyId = new Map((data?.templates ?? []).map((template) => [template.id, template]));
  const apiByIndex = data?.templates
    ? [...data.templates].sort((a, b) => a.sort_order - b.sort_order)
    : null;

  const templatesWithLock = RESUME_TEMPLATE_DEFINITIONS.map((template, index) => {
    const apiTemplate = apiByLegacyId.get(template.legacyId) ?? apiByIndex?.[index];
    return {
      ...template,
      locked: apiTemplate ? apiTemplate.locked : template.tier === 'pro',
    };
  });

  const unlockedCount = templatesWithLock.filter((template) => !template.locked).length;
  const visibleTemplates = showAll ? templatesWithLock : templatesWithLock.slice(0, 6);

  if (isLoading) {
    return (
      <div className="theme-text-subtle flex items-center gap-2 py-6 text-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#6ea8ff] border-t-transparent" />
        Loading templates...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="theme-text text-sm font-semibold">{selectedTemplate.name}</p>
          <p className="theme-text-subtle mt-1 text-xs leading-relaxed">
            Each template changes the actual resume structure, not only accent styling.
          </p>
          <p className="theme-text-subtle mt-1 text-[11px]">
            {unlockedCount} unlocked / {templatesWithLock.length - unlockedCount} locked
          </p>
        </div>
        {templatesWithLock.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="w-fit text-xs font-semibold text-[#9ec5ff] transition-colors hover:text-[var(--app-text)]"
          >
            {showAll ? 'Show less' : `See all ${templatesWithLock.length}`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {visibleTemplates.map((template) => (
          <ResumeTemplateCard
            key={template.id}
            template={template}
            selected={selectedTemplate.id === template.id}
            locked={template.locked}
            onClick={() => {
              if (template.locked) {
                onUpgradeCta?.();
                return;
              }
              onSelect(template.id);
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="theme-text-subtle mono-label text-[10px] uppercase tracking-widest">
          Plan: {PLAN_DISPLAY[data?.plan ?? ''] ?? data?.plan ?? 'Free'}
        </p>
        {data?.plan !== 'interview_cracker' && (
          <button
            type="button"
            onClick={onUpgradeCta}
            className="mono-label flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[#9ec5ff] transition-colors hover:text-white"
          >
            <Zap className="h-2.5 w-2.5" />
            Upgrade for more layouts
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeTemplateGallery;

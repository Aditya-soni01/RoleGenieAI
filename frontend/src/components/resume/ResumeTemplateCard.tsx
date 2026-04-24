import React from 'react';
import { Check, LockKeyhole } from 'lucide-react';
import type { ResumeTemplateDefinition } from '@/data/resumeTemplateRegistry';
import ResumeThumbnailRenderer from '@/components/resume/ResumeThumbnailRenderer';

interface ResumeTemplateCardProps {
  template: ResumeTemplateDefinition;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
}

const ResumeTemplateCard: React.FC<ResumeTemplateCardProps> = ({
  template,
  selected = false,
  locked = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'group relative flex h-full flex-col overflow-hidden rounded-xl text-left transition-all duration-200',
      'border',
      selected
        ? 'border-[#6ea8ff] shadow-[0_0_0_1px_rgba(110,168,255,0.45),0_16px_44px_rgba(29,78,216,0.18)]'
        : 'border-[#273647] hover:border-[#6ea8ff]/60 hover:-translate-y-0.5',
    ].join(' ')}
    aria-pressed={selected}
    style={{ background: 'var(--app-panel-strong)' }}
  >
    <div className="relative aspect-[0.76] w-full overflow-hidden p-3" style={{ background: 'var(--app-bg)' }}>
      <div
        className={[
          'h-full w-full overflow-hidden bg-white shadow-xl transition-transform duration-200',
          locked ? 'scale-[0.965]' : 'group-hover:scale-[0.985]',
        ].join(' ')}
      >
        <ResumeThumbnailRenderer template={template} />
      </div>

      {locked && (
        <div className="absolute inset-3 flex items-center justify-center backdrop-blur-[1.2px]" style={{ background: 'color-mix(in srgb, var(--app-bg) 28%, transparent)' }}>
          <div className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-lg" style={{ borderColor: 'rgba(110,168,255,0.45)', background: 'color-mix(in srgb, var(--app-panel-strong) 85%, transparent)', color: 'var(--app-text)' }}>
            <LockKeyhole className="h-3 w-3 text-[#6ea8ff]" />
            Pro
          </div>
        </div>
      )}

      {selected && (
        <div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-[#1d4ed8] text-white shadow-lg">
          <Check className="h-4 w-4" />
        </div>
      )}
    </div>

    <div className="flex flex-1 flex-col gap-2 p-3">
      <div>
        <p className="theme-text text-sm font-bold leading-tight">{template.name}</p>
        <p className="theme-text-subtle mt-1 line-clamp-2 text-[11px] leading-relaxed">
          {template.description}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded border border-[#1d4ed8]/30 bg-[#1d4ed8]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9ec5ff]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </button>
);

export default ResumeTemplateCard;

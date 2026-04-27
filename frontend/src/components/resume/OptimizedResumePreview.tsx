import React from 'react';
import OptimizedResumeRenderer from '@/components/resume/OptimizedResumeRenderer';
import type { ResumePreviewData } from '@/types/resumePreview';

interface OptimizedResumePreviewProps {
  data: ResumePreviewData;
  templateId: string;
}

const OptimizedResumePreview: React.FC<OptimizedResumePreviewProps> = ({ data, templateId }) => (
  <div className="max-h-[78vh] overflow-auto rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-panel-soft)] p-3">
    <div className="mx-auto w-full max-w-[920px]">
      <OptimizedResumeRenderer data={data} templateId={templateId} />
    </div>
  </div>
);

export default OptimizedResumePreview;

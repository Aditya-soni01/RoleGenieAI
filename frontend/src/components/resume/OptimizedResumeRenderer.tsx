import React from 'react';
import {
  getResumeTemplate,
  type ResumeOutputLayout,
} from '@/data/resumeTemplateRegistry';

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

interface OptimizedResumeRendererProps {
  data: OptimizedResume;
  templateId: string;
}

const contactItems = (data: OptimizedResume) => [
  data.contact?.email,
  data.contact?.phone,
  data.contact?.location,
  data.contact?.linkedin,
  data.contact?.portfolio,
].filter(Boolean);

const ResumeSection: React.FC<{
  title: string;
  children: React.ReactNode;
  variant?: ResumeOutputLayout;
}> = ({ title, children, variant = 'classic-centered' }) => {
  const isMinimal = variant === 'minimal-airy';
  const isExecutive = variant === 'executive-clean' || variant === 'leadership-rule';
  const isModern = variant === 'modern-block' || variant === 'skills-first' || variant === 'project-led';

  return (
    <section className={isMinimal ? 'mb-8' : variant === 'compact-ats' || variant === 'corporate-compact' ? 'mb-3' : 'mb-5'}>
      <div className={isModern ? 'mb-2 flex items-center gap-3' : 'mb-2'}>
        <h2
          className={[
            'font-bold text-[#111827]',
            isMinimal ? 'text-xs normal-case tracking-normal' : 'text-[10px] uppercase tracking-[0.18em]',
            isExecutive ? 'font-extrabold' : '',
          ].join(' ')}
        >
          {title}
        </h2>
        {isModern && <div className="h-px flex-1 bg-[#1d4ed8]" />}
      </div>
      {!isMinimal && !isModern && (
        <div className={isExecutive ? 'mb-3 h-[1.5px] bg-[#111827]' : 'mb-3 h-px bg-[#1d4ed8]'} />
      )}
      {children}
    </section>
  );
};

const BulletList: React.FC<{ items?: string[]; dense?: boolean }> = ({ items = [], dense = false }) => (
  <ul className={dense ? 'mt-1 space-y-0.5' : 'mt-2 space-y-1'}>
    {items.map((item, index) => (
      <li key={index} className="flex gap-2 text-[#374151]">
        <span className="mt-[1px] text-[#1d4ed8]">-</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Header: React.FC<{
  data: OptimizedResume;
  variant: ResumeOutputLayout;
}> = ({ data, variant }) => {
  const contacts = contactItems(data);
  const centered = variant === 'classic-centered' || variant === 'minimal-airy' || variant === 'project-led';
  const executive = variant === 'executive-clean';
  const compact = variant === 'compact-ats' || variant === 'corporate-compact';

  if (executive) {
    return (
      <header className="-mx-10 -mt-10 mb-7 bg-[#111827] px-10 py-7 text-center text-white">
        <h1 className="font-serif text-3xl font-bold leading-tight">{data.full_name}</h1>
        {contacts.length > 0 && (
          <p className="mt-2 text-[11px] leading-relaxed text-[#dbeafe]">{contacts.join(' | ')}</p>
        )}
      </header>
    );
  }

  if (variant === 'modern-block') {
    return (
      <header className="-mx-10 -mt-10 mb-7 border-b-4 border-[#1d4ed8] bg-[#dbeafe] px-10 py-7">
        <h1 className="text-3xl font-extrabold leading-tight text-[#111827]">{data.full_name}</h1>
        {contacts.length > 0 && (
          <p className="mt-2 text-xs leading-relaxed text-[#374151]">{contacts.join(' | ')}</p>
        )}
      </header>
    );
  }

  return (
    <header
      className={[
        compact ? 'mb-4 pb-3' : 'mb-7 pb-5',
        centered ? 'text-center' : 'text-left',
        variant === 'minimal-airy' ? '' : 'border-b-2 border-[#1d4ed8]',
      ].join(' ')}
    >
      <h1
        className={[
          variant === 'minimal-airy' ? 'font-serif text-3xl font-medium' : compact ? 'text-2xl font-extrabold' : 'text-3xl font-extrabold',
          'leading-tight text-[#111827]',
        ].join(' ')}
      >
        {data.full_name}
      </h1>
      {contacts.length > 0 && (
        <p className={compact ? 'mt-1 text-[11px] text-[#4b5563]' : 'mt-2 text-xs leading-relaxed text-[#4b5563]'}>
          {contacts.join(' | ')}
        </p>
      )}
    </header>
  );
};

const SkillsBlock: React.FC<{
  data: OptimizedResume;
  variant: ResumeOutputLayout;
  sidebar?: boolean;
}> = ({ data, variant, sidebar = false }) => {
  const technical = data.technical_skills ?? [];
  const professional = data.professional_skills ?? [];
  const dense = variant === 'compact-ats' || variant === 'corporate-compact';

  if (!technical.length && !professional.length) return null;

  if (sidebar) {
    return (
      <div className="space-y-4 text-xs">
        {technical.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#111827]">Technical</p>
            <p className="leading-relaxed text-[#374151]">{technical.join(' | ')}</p>
          </div>
        )}
        {professional.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#111827]">Professional</p>
            <p className="leading-relaxed text-[#374151]">{professional.join(' | ')}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <ResumeSection title="Skills" variant={variant}>
      <div className={dense ? 'space-y-1 text-[11px]' : 'space-y-2 text-xs'}>
        {technical.length > 0 && (
          <p className="leading-relaxed text-[#374151]">
            <span className="font-bold text-[#111827]">Technical: </span>
            {technical.join(' | ')}
          </p>
        )}
        {professional.length > 0 && (
          <p className="leading-relaxed text-[#374151]">
            <span className="font-bold text-[#111827]">Professional: </span>
            {professional.join(' | ')}
          </p>
        )}
      </div>
    </ResumeSection>
  );
};

const SummaryBlock: React.FC<{ data: OptimizedResume; variant: ResumeOutputLayout }> = ({ data, variant }) => {
  if (!data.professional_summary) return null;
  return (
    <ResumeSection title={variant === 'minimal-airy' ? 'Profile' : variant === 'executive-clean' ? 'Executive Profile' : 'Professional Summary'} variant={variant}>
      <p className={variant === 'compact-ats' ? 'text-xs leading-relaxed text-[#374151]' : 'text-sm leading-relaxed text-[#374151]'}>
        {data.professional_summary}
      </p>
    </ResumeSection>
  );
};

const ExperienceBlock: React.FC<{ data: OptimizedResume; variant: ResumeOutputLayout }> = ({ data, variant }) => {
  if (!data.experience?.length) return null;
  const dense = variant === 'compact-ats' || variant === 'corporate-compact';

  return (
    <ResumeSection title={variant === 'executive-clean' ? 'Leadership Experience' : 'Professional Experience'} variant={variant}>
      <div className={dense ? 'space-y-3' : 'space-y-5'}>
        {data.experience.map((exp, index) => (
          <article
            key={`${exp.title}-${index}`}
            className={variant === 'modern-block' ? 'border-l-2 border-[#1d4ed8] pl-4' : ''}
          >
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <p className={dense ? 'text-xs font-bold text-[#111827]' : 'text-sm font-bold text-[#111827]'}>
                {exp.title}{exp.company ? `, ${exp.company}` : ''}
              </p>
              {exp.duration && (
                <p className="text-[11px] font-medium text-[#4b5563]">{exp.duration}</p>
              )}
            </div>
            {exp.location && <p className="text-[11px] text-[#4b5563]">{exp.location}</p>}
            <BulletList items={exp.bullets} dense={dense} />
          </article>
        ))}
      </div>
    </ResumeSection>
  );
};

const ProjectsBlock: React.FC<{ data: OptimizedResume; variant: ResumeOutputLayout }> = ({ data, variant }) => {
  if (!data.projects?.length) return null;
  return (
    <ResumeSection title="Projects" variant={variant}>
      <div className="space-y-4">
        {data.projects.map((project, index) => (
          <article
            key={`${project.name}-${index}`}
            className={variant === 'project-led' ? 'rounded-md bg-[#dbeafe] p-4' : ''}
          >
            <p className="text-sm font-bold text-[#111827]">{project.name}</p>
            {project.technologies && (
              <p className="mt-0.5 text-[11px] italic text-[#4b5563]">Technologies: {project.technologies}</p>
            )}
            <BulletList items={project.bullets} dense={variant === 'compact-ats'} />
          </article>
        ))}
      </div>
    </ResumeSection>
  );
};

const EducationBlock: React.FC<{ data: OptimizedResume; variant: ResumeOutputLayout }> = ({ data, variant }) => {
  if (!data.education?.length) return null;
  return (
    <ResumeSection title="Education" variant={variant}>
      <div className="space-y-2">
        {data.education.map((education, index) => (
          <div key={`${education.degree}-${index}`} className="text-xs text-[#374151]">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="font-bold text-[#111827]">{education.degree}</p>
              <p>{[education.institution, education.year].filter(Boolean).join(' | ')}</p>
            </div>
            {education.details && <p className="mt-0.5 italic text-[#4b5563]">{education.details}</p>}
          </div>
        ))}
      </div>
    </ResumeSection>
  );
};

const CertificationsBlock: React.FC<{ data: OptimizedResume; variant: ResumeOutputLayout; sidebar?: boolean }> = ({
  data,
  variant,
  sidebar = false,
}) => {
  if (!data.certifications?.length) return null;

  if (sidebar) {
    return (
      <div className="text-xs">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#111827]">Certifications</p>
        <BulletList items={data.certifications} dense />
      </div>
    );
  }

  return (
    <ResumeSection title="Certifications" variant={variant}>
      <BulletList items={data.certifications} dense={variant === 'compact-ats'} />
    </ResumeSection>
  );
};

const SidebarLayout: React.FC<{ data: OptimizedResume; variant: ResumeOutputLayout }> = ({ data, variant }) => {
  const contacts = contactItems(data);

  return (
    <div className="overflow-hidden rounded-2xl bg-white text-[#111827] shadow-2xl">
      <div className="grid min-h-[880px] grid-cols-[210px_minmax(0,1fr)]">
        <aside className="bg-[#dbeafe] p-7">
          <h1 className="text-2xl font-extrabold leading-tight text-[#111827]">{data.full_name}</h1>
          <div className="mt-6 space-y-6">
            {contacts.length > 0 && (
              <div className="text-xs">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#111827]">Contact</p>
                <div className="space-y-1.5 break-words text-[#374151]">
                  {contacts.map((item) => <p key={item}>{item}</p>)}
                </div>
              </div>
            )}
            <SkillsBlock data={data} variant={variant} sidebar />
            <CertificationsBlock data={data} variant={variant} sidebar />
          </div>
        </aside>
        <main className="p-9">
          <SummaryBlock data={data} variant={variant} />
          <ExperienceBlock data={data} variant={variant} />
          <ProjectsBlock data={data} variant={variant} />
          <EducationBlock data={data} variant={variant} />
        </main>
      </div>
    </div>
  );
};

const OptimizedResumeRenderer: React.FC<OptimizedResumeRendererProps> = ({ data, templateId }) => {
  const template = getResumeTemplate(templateId);
  const variant = template.outputLayout;
  const compact = variant === 'compact-ats' || variant === 'corporate-compact';
  const minimal = variant === 'minimal-airy';

  if (variant === 'sidebar-professional') {
    return <SidebarLayout data={data} variant={variant} />;
  }

  const blocks = {
    summary: <SummaryBlock key="summary" data={data} variant={variant} />,
    skills: <SkillsBlock key="skills" data={data} variant={variant} />,
    experience: <ExperienceBlock key="experience" data={data} variant={variant} />,
    projects: <ProjectsBlock key="projects" data={data} variant={variant} />,
    education: <EducationBlock key="education" data={data} variant={variant} />,
    certifications: <CertificationsBlock key="certifications" data={data} variant={variant} />,
  };

  const orderByLayout: Record<ResumeOutputLayout, Array<keyof typeof blocks>> = {
    'classic-centered': ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'],
    'compact-ats': ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    'modern-block': ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    'minimal-airy': ['summary', 'experience', 'education', 'projects', 'skills', 'certifications'],
    'executive-clean': ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'],
    'sidebar-professional': ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    'skills-first': ['skills', 'summary', 'experience', 'projects', 'education', 'certifications'],
    'project-led': ['summary', 'projects', 'skills', 'experience', 'education', 'certifications'],
    'leadership-rule': ['summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
    'corporate-compact': ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'],
  };

  return (
    <div
      className={[
        'bg-white text-[#111827] shadow-2xl',
        minimal ? 'rounded-2xl p-12 font-serif' : compact ? 'rounded-xl p-8 font-sans text-xs leading-normal' : 'rounded-2xl p-10 font-sans text-sm leading-relaxed',
      ].join(' ')}
    >
      <Header data={data} variant={variant} />
      {orderByLayout[variant].map((key) => blocks[key])}
    </div>
  );
};

export default OptimizedResumeRenderer;

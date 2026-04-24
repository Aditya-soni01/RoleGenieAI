export type TemplateTier = 'free' | 'pro';

export type ResumeThumbnailLayout =
  | 'classic-centered'
  | 'compact-ats'
  | 'modern-block'
  | 'minimal-airy'
  | 'executive-clean'
  | 'sidebar-professional'
  | 'skills-first'
  | 'project-led'
  | 'leadership-rule'
  | 'corporate-compact';

export type ResumeOutputLayout = ResumeThumbnailLayout;

export interface ResumeTemplateDefinition {
  id: string;
  legacyId: string;
  name: string;
  description: string;
  tags: string[];
  tier: TemplateTier;
  thumbnailLayout: ResumeThumbnailLayout;
  outputLayout: ResumeOutputLayout;
  colors: {
    ink: string;
    muted: string;
    faint: string;
    rule: string;
    accent: string;
    accentSoft: string;
    paper: string;
  };
}

const BLUE = '#1d4ed8';
const BLUE_DARK = '#1e3a8a';
const INK = '#111827';
const MUTED = '#4b5563';
const FAINT = '#e5e7eb';
const SOFT_BLUE = '#dbeafe';

export const RESUME_TEMPLATE_DEFINITIONS: ResumeTemplateDefinition[] = [
  {
    id: 'classic-professional',
    legacyId: 'template_1',
    name: 'Classic Professional',
    description: 'Centered name, crisp rules, and a traditional single-column flow.',
    tags: ['ATS', 'CLASSIC', 'CORPORATE'],
    tier: 'free',
    thumbnailLayout: 'classic-centered',
    outputLayout: 'classic-centered',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: BLUE, accent: BLUE, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
  {
    id: 'compact-ats',
    legacyId: 'template_2',
    name: 'Compact ATS',
    description: 'Dense left-aligned format built to keep more relevant detail on one page.',
    tags: ['ATS', 'COMPACT', 'ONE-PAGE'],
    tier: 'free',
    thumbnailLayout: 'compact-ats',
    outputLayout: 'compact-ats',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: INK, accent: BLUE_DARK, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
  {
    id: 'modern-ats-professional',
    legacyId: 'template_3',
    name: 'Modern ATS Professional',
    description: 'Modern section blocks with stronger hierarchy while staying parser-safe.',
    tags: ['ATS', 'MODERN', 'TECH'],
    tier: 'free',
    thumbnailLayout: 'modern-block',
    outputLayout: 'modern-block',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: BLUE, accent: BLUE, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
  {
    id: 'minimal-one-column',
    legacyId: 'template_4',
    name: 'Minimal One-Column',
    description: 'Airy single-column layout with subtle headings and generous whitespace.',
    tags: ['MINIMAL', 'CLEAN', 'ATS'],
    tier: 'pro',
    thumbnailLayout: 'minimal-airy',
    outputLayout: 'minimal-airy',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: FAINT, accent: INK, accentSoft: '#f3f4f6', paper: '#ffffff' },
  },
  {
    id: 'executive-clean',
    legacyId: 'template_5',
    name: 'Executive Clean',
    description: 'Refined executive structure with strong divisions and leadership emphasis.',
    tags: ['EXECUTIVE', 'LEADERSHIP', 'PRO'],
    tier: 'pro',
    thumbnailLayout: 'executive-clean',
    outputLayout: 'executive-clean',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: INK, accent: BLUE_DARK, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
  {
    id: 'sidebar-professional',
    legacyId: 'template_6',
    name: 'Sidebar Professional',
    description: 'Premium two-column layout with contact and skills in a structured sidebar.',
    tags: ['SIDEBAR', 'PREMIUM', 'MODERN'],
    tier: 'pro',
    thumbnailLayout: 'sidebar-professional',
    outputLayout: 'sidebar-professional',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: BLUE, accent: BLUE, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
  {
    id: 'technical-skills-first',
    legacyId: 'template_7',
    name: 'Technical Skills First',
    description: 'Skills-led structure for engineering roles and keyword-heavy applications.',
    tags: ['TECHNICAL', 'SKILLS', 'ATS'],
    tier: 'pro',
    thumbnailLayout: 'skills-first',
    outputLayout: 'skills-first',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: BLUE, accent: BLUE, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
  {
    id: 'project-portfolio',
    legacyId: 'template_8',
    name: 'Project Portfolio',
    description: 'Projects appear before experience for builders with strong portfolio proof.',
    tags: ['PROJECTS', 'DEVELOPER', 'ATS'],
    tier: 'pro',
    thumbnailLayout: 'project-led',
    outputLayout: 'project-led',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: BLUE_DARK, accent: BLUE_DARK, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
  {
    id: 'senior-leadership',
    legacyId: 'template_9',
    name: 'Senior Leadership',
    description: 'Boardroom-style layout with a compact leadership profile and firm rules.',
    tags: ['SENIOR', 'STRATEGY', 'PRO'],
    tier: 'pro',
    thumbnailLayout: 'leadership-rule',
    outputLayout: 'leadership-rule',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: INK, accent: BLUE_DARK, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
  {
    id: 'corporate-compact',
    legacyId: 'template_10',
    name: 'Corporate Compact',
    description: 'Balanced corporate resume with compact sections and restrained blue accents.',
    tags: ['CORPORATE', 'COMPACT', 'ATS'],
    tier: 'pro',
    thumbnailLayout: 'corporate-compact',
    outputLayout: 'corporate-compact',
    colors: { ink: INK, muted: MUTED, faint: FAINT, rule: BLUE, accent: BLUE, accentSoft: SOFT_BLUE, paper: '#ffffff' },
  },
];

export const FREE_TEMPLATE_IDS = RESUME_TEMPLATE_DEFINITIONS
  .filter((template) => template.tier === 'free')
  .map((template) => template.id);

export const SLUG_TO_LEGACY: Record<string, string> = RESUME_TEMPLATE_DEFINITIONS.reduce(
  (acc, template) => ({ ...acc, [template.id]: template.legacyId }),
  {} as Record<string, string>,
);

export const LEGACY_TO_SLUG: Record<string, string> = RESUME_TEMPLATE_DEFINITIONS.reduce(
  (acc, template) => ({ ...acc, [template.legacyId]: template.id }),
  {} as Record<string, string>,
);

export function getResumeTemplate(templateId: string): ResumeTemplateDefinition {
  const slug = LEGACY_TO_SLUG[templateId] ?? templateId;
  return RESUME_TEMPLATE_DEFINITIONS.find((template) => template.id === slug) ?? RESUME_TEMPLATE_DEFINITIONS[0];
}

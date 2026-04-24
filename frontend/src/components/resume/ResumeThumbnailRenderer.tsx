import React from 'react';
import type { ResumeTemplateDefinition } from '@/data/resumeTemplateRegistry';

interface ResumeThumbnailRendererProps {
  template: ResumeTemplateDefinition;
}

const PEOPLE: Record<string, { name: string; title: string; contact: string }> = {
  'classic-centered': {
    name: 'Alex Morgan',
    title: 'Senior Product Manager',
    contact: 'alex@example.com | New York, NY | linkedin.com/in/alex',
  },
  'compact-ats': {
    name: 'Jordan Lee',
    title: 'Data Analyst',
    contact: 'jordan@example.com | Chicago, IL | 555-0104',
  },
  'modern-block': {
    name: 'Taylor Brooks',
    title: 'Software Engineer',
    contact: 'taylor@example.com | Seattle, WA | github.com/taylor',
  },
  'minimal-airy': {
    name: 'Casey Rivera',
    title: 'Operations Lead',
    contact: 'casey@example.com | Austin, TX',
  },
  'executive-clean': {
    name: 'Morgan Patel',
    title: 'Director of Strategy',
    contact: 'morgan@example.com | Boston, MA | linkedin.com/in/morgan',
  },
  'sidebar-professional': {
    name: 'Riley Chen',
    title: 'UX Research Manager',
    contact: 'riley@example.com | Denver, CO',
  },
  'skills-first': {
    name: 'Sam Carter',
    title: 'Backend Engineer',
    contact: 'sam@example.com | Remote | github.com/sam',
  },
  'project-led': {
    name: 'Jamie Quinn',
    title: 'Frontend Developer',
    contact: 'jamie@example.com | Portland, OR',
  },
  'leadership-rule': {
    name: 'Avery Stone',
    title: 'VP, Customer Success',
    contact: 'avery@example.com | San Francisco, CA',
  },
  'corporate-compact': {
    name: 'Drew Ellis',
    title: 'Finance Manager',
    contact: 'drew@example.com | Charlotte, NC',
  },
};

const W = 250;
const H = 330;
const P = 18;

const Text = ({
  x,
  y,
  children,
  size = 6.6,
  weight = 400,
  color = '#111827',
  anchor = 'start',
  family = 'Arial, Helvetica, sans-serif',
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  family?: string;
}) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontSize={size}
    fontWeight={weight}
    fontFamily={family}
    textAnchor={anchor}
  >
    {children}
  </text>
);

const Rule = ({ x = P, y, width = W - P * 2, color = '#1d4ed8', thickness = 1 }: {
  x?: number;
  y: number;
  width?: number;
  color?: string;
  thickness?: number;
}) => <line x1={x} y1={y} x2={x + width} y2={y} stroke={color} strokeWidth={thickness} />;

const SectionTitle = ({
  x = P,
  y,
  label,
  color,
  boxed = false,
  centered = false,
}: {
  x?: number;
  y: number;
  label: string;
  color: string;
  boxed?: boolean;
  centered?: boolean;
}) => (
  <g>
    {boxed && <rect x={x - 3} y={y - 8} width={74} height={11} fill="#dbeafe" rx={1} />}
    <Text x={centered ? W / 2 : x} y={y} size={6.2} weight={700} color={color} anchor={centered ? 'middle' : 'start'}>
      {label}
    </Text>
  </g>
);

const Bullet = ({ x, y, width = 154, color = '#111827' }: {
  x: number;
  y: number;
  width?: number;
  color?: string;
}) => (
  <g>
    <Text x={x} y={y} size={5.6} color={color}>-</Text>
    <rect x={x + 8} y={y - 4.2} width={width} height={2.1} fill={color} opacity={0.72} rx={1} />
  </g>
);

const SkillText = ({ x, y, children, color = '#111827' }: { x: number; y: number; children: React.ReactNode; color?: string }) => (
  <Text x={x} y={y} size={5.7} weight={600} color={color}>{children}</Text>
);

const ExperienceBlock = ({ x, y, width, compact = false, color = '#111827' }: {
  x: number;
  y: number;
  width: number;
  compact?: boolean;
  color?: string;
}) => (
  <g>
    <Text x={x} y={y} size={compact ? 5.7 : 6.4} weight={700} color={color}>Product Lead, Northstar Labs</Text>
    <Text x={x + width} y={y} size={compact ? 4.9 : 5.4} color="#4b5563" anchor="end">2021 - Present</Text>
    <Bullet x={x} y={y + (compact ? 9 : 12)} width={width * 0.78} color={color} />
    <Bullet x={x} y={y + (compact ? 17 : 22)} width={width * 0.66} color={color} />
    {!compact && <Bullet x={x} y={y + 32} width={width * 0.72} color={color} />}
  </g>
);

const ClassicCentered = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <Text x={W / 2} y={28} size={13} weight={700} color={template.colors.ink} anchor="middle" family="Georgia, serif">{p.name}</Text>
      <Text x={W / 2} y={41} size={6.2} color={template.colors.accent} anchor="middle">{p.title}</Text>
      <Text x={W / 2} y={52} size={5.2} color={template.colors.muted} anchor="middle">{p.contact}</Text>
      <Rule y={63} color={template.colors.rule} thickness={1.4} />

      <SectionTitle y={80} label="PROFESSIONAL SUMMARY" color={template.colors.accent} centered />
      <Rule y={86} color={template.colors.faint} />
      <Text x={P} y={100} size={5.8} color={template.colors.ink}>Product leader with 8 years building customer-focused SaaS teams.</Text>
      <Text x={P} y={110} size={5.8} color={template.colors.ink}>Known for roadmap strategy, discovery, and measurable launches.</Text>

      <SectionTitle y={132} label="CORE SKILLS" color={template.colors.accent} centered />
      <Rule y={138} color={template.colors.faint} />
      <SkillText x={P} y={151}>Roadmapping | Analytics | Stakeholder Management | Launch Planning</SkillText>

      <SectionTitle y={176} label="EXPERIENCE" color={template.colors.accent} centered />
      <Rule y={182} color={template.colors.faint} />
      <ExperienceBlock x={P} y={197} width={W - P * 2} color={template.colors.ink} />
      <ExperienceBlock x={P} y={251} width={W - P * 2} compact color={template.colors.ink} />

      <SectionTitle y={304} label="EDUCATION" color={template.colors.accent} centered />
      <Rule y={310} color={template.colors.faint} />
    </g>
  );
};

const CompactAts = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <Text x={P} y={25} size={12} weight={800} color={template.colors.ink}>{p.name}</Text>
      <Text x={P} y={37} size={5.8} weight={700} color={template.colors.accent}>{p.title}</Text>
      <Text x={P} y={47} size={5} color={template.colors.muted}>{p.contact}</Text>
      <Rule y={56} color={template.colors.ink} thickness={1} />

      <SectionTitle y={70} label="SUMMARY" color={template.colors.ink} />
      <Text x={P + 58} y={70} size={5.3} color={template.colors.ink}>Analyst with SQL, dashboarding, and lifecycle reporting experience.</Text>

      <SectionTitle y={91} label="SKILLS" color={template.colors.ink} />
      <Text x={P + 58} y={91} size={5.2} color={template.colors.ink}>SQL, Python, Excel, Tableau, Forecasting, A/B Testing</Text>

      <Rule y={108} color={template.colors.faint} />
      <SectionTitle y={122} label="EXPERIENCE" color={template.colors.ink} />
      <ExperienceBlock x={P} y={138} width={W - P * 2} compact color={template.colors.ink} />
      <ExperienceBlock x={P} y={180} width={W - P * 2} compact color={template.colors.ink} />
      <ExperienceBlock x={P} y={222} width={W - P * 2} compact color={template.colors.ink} />

      <Rule y={269} color={template.colors.faint} />
      <SectionTitle y={283} label="EDUCATION" color={template.colors.ink} />
      <Text x={P} y={298} size={5.8} weight={700} color={template.colors.ink}>B.S. Business Analytics, State University</Text>
      <Text x={P} y={309} size={5.3} color={template.colors.muted}>Coursework: statistics, data systems, finance</Text>
    </g>
  );
};

const ModernBlock = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <rect x={0} y={0} width={W} height={54} fill={template.colors.accentSoft} />
      <rect x={0} y={54} width={W} height={3} fill={template.colors.accent} />
      <Text x={P} y={25} size={13} weight={800} color={template.colors.ink}>{p.name}</Text>
      <Text x={P} y={39} size={6.2} weight={700} color={template.colors.accent}>{p.title}</Text>
      <Text x={P + 110} y={39} size={5.2} color={template.colors.muted}>{p.contact}</Text>

      <SectionTitle y={78} label="SUMMARY" color={template.colors.accent} boxed />
      <Text x={P} y={96} size={5.8} color={template.colors.ink}>Engineer focused on reliable platforms, API design, and clean delivery.</Text>
      <Text x={P} y={106} size={5.8} color={template.colors.ink}>Partners across product and infrastructure to ship measurable results.</Text>

      <SectionTitle y={130} label="TECHNICAL SKILLS" color={template.colors.accent} boxed />
      <g>
        {['TypeScript', 'React', 'Node', 'Postgres', 'AWS'].map((skill, i) => (
          <rect key={skill} x={P + i * 41} y={140} width={34} height={12} fill={i % 2 === 0 ? '#dbeafe' : '#ffffff'} stroke="#1d4ed8" strokeWidth={0.4} rx={2} />
        ))}
        {['TypeScript', 'React', 'Node', 'Postgres', 'AWS'].map((skill, i) => (
          <Text key={skill} x={P + i * 41 + 17} y={148} size={4.7} weight={700} color={template.colors.ink} anchor="middle">{skill}</Text>
        ))}
      </g>

      <SectionTitle y={178} label="EXPERIENCE" color={template.colors.accent} boxed />
      <ExperienceBlock x={P} y={196} width={W - P * 2} color={template.colors.ink} />
      <SectionTitle y={256} label="PROJECTS" color={template.colors.accent} boxed />
      <Text x={P} y={274} size={6.1} weight={700} color={template.colors.ink}>Customer Analytics Platform</Text>
      <Bullet x={P} y={286} width={150} color={template.colors.ink} />
    </g>
  );
};

const MinimalAiry = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <Text x={W / 2} y={35} size={15} weight={500} color={template.colors.ink} anchor="middle" family="Georgia, serif">{p.name}</Text>
      <Text x={W / 2} y={50} size={5.6} color={template.colors.muted} anchor="middle">{p.title} | {p.contact}</Text>

      <Text x={P} y={88} size={6} weight={700} color={template.colors.ink}>Profile</Text>
      <Text x={P} y={107} size={5.8} color={template.colors.ink}>Operations lead improving systems, service quality, and team rituals.</Text>
      <Text x={P} y={117} size={5.8} color={template.colors.ink}>Calm, metrics-aware, and comfortable inside ambiguous work.</Text>

      <Text x={P} y={153} size={6} weight={700} color={template.colors.ink}>Experience</Text>
      <Text x={P} y={172} size={6.2} weight={700} color={template.colors.ink}>Operations Lead, Bluefield Studio</Text>
      <Text x={P} y={183} size={5.2} color={template.colors.muted}>2020 - Present</Text>
      <Bullet x={P} y={199} width={166} color={template.colors.ink} />
      <Bullet x={P} y={211} width={132} color={template.colors.ink} />

      <Text x={P} y={250} size={6} weight={700} color={template.colors.ink}>Skills</Text>
      <Text x={P} y={269} size={5.6} color={template.colors.ink}>Process Design | Vendor Management | Team Enablement | Reporting</Text>
    </g>
  );
};

const ExecutiveClean = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <rect x={0} y={0} width={W} height={62} fill="#111827" />
      <Text x={W / 2} y={27} size={13} weight={800} color="#ffffff" anchor="middle" family="Georgia, serif">{p.name}</Text>
      <Text x={W / 2} y={42} size={6} weight={700} color="#dbeafe" anchor="middle">{p.title}</Text>
      <Text x={W / 2} y={54} size={5} color="#ffffff" anchor="middle">{p.contact}</Text>

      <SectionTitle y={84} label="EXECUTIVE PROFILE" color={template.colors.ink} />
      <Rule y={91} color={template.colors.ink} thickness={1.4} />
      <Text x={P} y={106} size={5.8} color={template.colors.ink}>Strategy leader aligning growth plans, operating cadence, and teams.</Text>
      <Text x={P} y={116} size={5.8} color={template.colors.ink}>Trusted partner for executive planning and transformation programs.</Text>

      <SectionTitle y={143} label="LEADERSHIP EXPERIENCE" color={template.colors.ink} />
      <Rule y={150} color={template.colors.ink} thickness={1.4} />
      <ExperienceBlock x={P} y={166} width={W - P * 2} color={template.colors.ink} />

      <SectionTitle y={226} label="SELECTED IMPACT" color={template.colors.ink} />
      <Rule y={233} color={template.colors.ink} thickness={1.4} />
      <Bullet x={P} y={250} width={160} color={template.colors.ink} />
      <Bullet x={P} y={263} width={146} color={template.colors.ink} />
      <Bullet x={P} y={276} width={170} color={template.colors.ink} />
    </g>
  );
};

const SidebarProfessional = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <rect x={0} y={0} width={78} height={H} fill={template.colors.accentSoft} />
      <rect x={76} y={0} width={2} height={H} fill={template.colors.accent} />
      <Text x={96} y={28} size={13} weight={800} color={template.colors.ink}>{p.name}</Text>
      <Text x={96} y={42} size={6} weight={700} color={template.colors.accent}>{p.title}</Text>

      <Text x={12} y={34} size={6.2} weight={800} color={template.colors.ink}>CONTACT</Text>
      <Text x={12} y={50} size={4.9} color={template.colors.ink}>riley@example.com</Text>
      <Text x={12} y={61} size={4.9} color={template.colors.ink}>Denver, CO</Text>
      <Text x={12} y={86} size={6.2} weight={800} color={template.colors.ink}>SKILLS</Text>
      <SkillText x={12} y={103}>Research Ops</SkillText>
      <SkillText x={12} y={117}>Journey Maps</SkillText>
      <SkillText x={12} y={131}>Workshops</SkillText>
      <Text x={12} y={164} size={6.2} weight={800} color={template.colors.ink}>TOOLS</Text>
      <SkillText x={12} y={181}>Figma</SkillText>
      <SkillText x={12} y={195}>Dovetail</SkillText>

      <SectionTitle x={96} y={70} label="SUMMARY" color={template.colors.accent} />
      <Text x={96} y={88} size={5.7} color={template.colors.ink}>Research manager translating customer insight into product direction.</Text>
      <Text x={96} y={98} size={5.7} color={template.colors.ink}>Experienced with discovery systems and cross-functional rituals.</Text>

      <SectionTitle x={96} y={127} label="EXPERIENCE" color={template.colors.accent} />
      <ExperienceBlock x={96} y={146} width={136} compact color={template.colors.ink} />
      <ExperienceBlock x={96} y={192} width={136} compact color={template.colors.ink} />

      <SectionTitle x={96} y={250} label="EDUCATION" color={template.colors.accent} />
      <Text x={96} y={269} size={5.8} weight={700} color={template.colors.ink}>M.A. Human Factors</Text>
      <Text x={96} y={280} size={5.2} color={template.colors.muted}>North Coast University</Text>
    </g>
  );
};

const SkillsFirst = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <Text x={P} y={28} size={12.8} weight={800} color={template.colors.ink}>{p.name}</Text>
      <Text x={P} y={42} size={5.8} color={template.colors.muted}>{p.title} | {p.contact}</Text>
      <Rule y={54} color={template.colors.accent} thickness={2} />
      <SectionTitle y={74} label="TECHNICAL SKILLS" color={template.colors.accent} boxed />
      <Text x={P} y={94} size={5.6} color={template.colors.ink}>Languages: TypeScript, Python, SQL, Go</Text>
      <Text x={P} y={106} size={5.6} color={template.colors.ink}>Systems: APIs, Queues, Postgres, Observability, AWS</Text>
      <SectionTitle y={136} label="SUMMARY" color={template.colors.accent} />
      <Text x={P} y={154} size={5.7} color={template.colors.ink}>Backend engineer focused on reliable services and operational clarity.</Text>
      <SectionTitle y={185} label="EXPERIENCE" color={template.colors.accent} />
      <ExperienceBlock x={P} y={204} width={W - P * 2} color={template.colors.ink} />
      <SectionTitle y={268} label="PROJECTS" color={template.colors.accent} />
      <Bullet x={P} y={286} width={162} color={template.colors.ink} />
    </g>
  );
};

const ProjectLed = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <Text x={W / 2} y={28} size={12.5} weight={800} color={template.colors.ink} anchor="middle">{p.name}</Text>
      <Text x={W / 2} y={42} size={5.6} color={template.colors.muted} anchor="middle">{p.title} | {p.contact}</Text>
      <Rule y={54} color={template.colors.accent} />
      <SectionTitle y={74} label="PROJECTS" color={template.colors.accent} />
      <rect x={P} y={84} width={W - P * 2} height={42} fill="#dbeafe" rx={2} />
      <Text x={P + 8} y={100} size={6.4} weight={800} color={template.colors.ink}>Design System Migration</Text>
      <Bullet x={P + 8} y={113} width={152} color={template.colors.ink} />
      <SectionTitle y={148} label="EXPERIENCE" color={template.colors.accent} />
      <ExperienceBlock x={P} y={166} width={W - P * 2} color={template.colors.ink} />
      <SectionTitle y={230} label="SKILLS" color={template.colors.accent} />
      <Text x={P} y={248} size={5.6} color={template.colors.ink}>React | Accessibility | Testing | Performance | API Integration</Text>
    </g>
  );
};

const LeadershipRule = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <Text x={P} y={27} size={13} weight={800} color={template.colors.ink} family="Georgia, serif">{p.name}</Text>
      <Rule x={P} y={37} width={W - P * 2} color={template.colors.ink} thickness={2} />
      <Text x={P} y={51} size={5.7} weight={700} color={template.colors.accent}>{p.title}</Text>
      <Text x={P + 120} y={51} size={5} color={template.colors.muted}>{p.contact}</Text>
      <Text x={P} y={78} size={7} weight={800} color={template.colors.ink}>Leadership Profile</Text>
      <Text x={P} y={96} size={5.8} color={template.colors.ink}>Customer leader scaling retention motions, enablement, and team health.</Text>
      <Text x={P} y={107} size={5.8} color={template.colors.ink}>Balances operating rhythm with practical coaching and clear metrics.</Text>
      <Rule y={128} color={template.colors.ink} />
      <SectionTitle y={145} label="CAREER EXPERIENCE" color={template.colors.ink} />
      <ExperienceBlock x={P} y={164} width={W - P * 2} color={template.colors.ink} />
      <Rule y={222} color={template.colors.ink} />
      <SectionTitle y={239} label="BOARD-LEVEL IMPACT" color={template.colors.ink} />
      <Bullet x={P} y={257} width={170} color={template.colors.ink} />
      <Bullet x={P} y={271} width={146} color={template.colors.ink} />
    </g>
  );
};

const CorporateCompact = ({ template }: ResumeThumbnailRendererProps) => {
  const p = PEOPLE[template.thumbnailLayout];
  return (
    <g>
      <Text x={P} y={26} size={12} weight={800} color={template.colors.ink}>{p.name}</Text>
      <Text x={P} y={39} size={5.5} color={template.colors.muted}>{p.title} | {p.contact}</Text>
      <rect x={P} y={51} width={W - P * 2} height={22} fill="#dbeafe" rx={2} />
      <Text x={P + 8} y={65} size={5.7} color={template.colors.ink}>Finance manager with budgeting, forecasting, and reporting depth.</Text>
      <SectionTitle y={96} label="EXPERIENCE" color={template.colors.accent} />
      <Rule y={103} color={template.colors.accent} />
      <ExperienceBlock x={P} y={120} width={W - P * 2} compact color={template.colors.ink} />
      <ExperienceBlock x={P} y={163} width={W - P * 2} compact color={template.colors.ink} />
      <SectionTitle y={222} label="SKILLS" color={template.colors.accent} />
      <Rule y={229} color={template.colors.faint} />
      <Text x={P} y={246} size={5.5} color={template.colors.ink}>FP&A | Month-End Close | Forecasting | Revenue Analysis | Excel</Text>
      <SectionTitle y={278} label="EDUCATION" color={template.colors.accent} />
      <Text x={P} y={296} size={5.7} weight={700} color={template.colors.ink}>B.B.A. Finance, Central College</Text>
    </g>
  );
};

const LAYOUT_RENDERERS: Record<string, React.FC<ResumeThumbnailRendererProps>> = {
  'classic-centered': ClassicCentered,
  'compact-ats': CompactAts,
  'modern-block': ModernBlock,
  'minimal-airy': MinimalAiry,
  'executive-clean': ExecutiveClean,
  'sidebar-professional': SidebarProfessional,
  'skills-first': SkillsFirst,
  'project-led': ProjectLed,
  'leadership-rule': LeadershipRule,
  'corporate-compact': CorporateCompact,
};

const ResumeThumbnailRenderer: React.FC<ResumeThumbnailRendererProps> = ({ template }) => {
  const Layout = LAYOUT_RENDERERS[template.thumbnailLayout] ?? ClassicCentered;

  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${template.name} resume thumbnail`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id={`paper-shadow-${template.id}`} x="-12%" y="-10%" width="124%" height="124%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.18" />
        </filter>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={template.colors.paper} filter={`url(#paper-shadow-${template.id})`} />
      <Layout template={template} />
    </svg>
  );
};

export default ResumeThumbnailRenderer;

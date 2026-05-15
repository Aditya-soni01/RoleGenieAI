import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface StaticPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const legalLinks = [
  { to: '/about-us', label: 'About Us' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-and-conditions', label: 'Terms & Conditions' },
  { to: '/refund-cancellation', label: 'Refund & Cancellation' },
  { to: '/contact-us', label: 'Contact Us' },
];

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-[#051424]">
      <div className="max-w-4xl mx-auto px-4 py-10 lg:py-14">
        <Link to="/" className="inline-flex items-center gap-2.5 no-underline mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
          >
            <Sparkles className="w-4 h-4 text-[#340080]" />
          </div>
          <span className="text-xl font-bold tracking-tighter genie-gradient-text">RoleGenie</span>
        </Link>

        <div
          className="rounded-2xl p-6 lg:p-10 mb-8"
          style={{ background: 'rgba(13,28,45,0.9)', border: '1px solid rgba(73,68,84,0.25)' }}
        >
          <p className="mono-label text-[11px] font-bold tracking-[0.14em] uppercase text-[#d0bcff] mb-3">
            Company Information
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#d4e4fa] tracking-tight mb-3">{title}</h1>
          <p className="text-sm text-[#9cb3cc]">{subtitle}</p>

          <div className="mt-8 prose prose-invert max-w-none prose-p:text-[#cbc3d7] prose-li:text-[#cbc3d7] prose-strong:text-[#d4e4fa]">
            {children}
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 flex flex-wrap gap-3"
          style={{ background: 'rgba(13,28,45,0.65)', border: '1px solid rgba(73,68,84,0.22)' }}
        >
          {legalLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-xs text-[#8da8c0] hover:text-[#d4e4fa] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaticPageLayout;

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Send, FileText, BookOpen, MessageCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'How does the AI resume optimization work?',
    a: 'RoleGenie uses advanced LLMs to analyze your resume against specific job descriptions. It identifies keyword gaps, suggests phrasing improvements, and restructures your content to rank higher in Applicant Tracking Systems (ATS).',
  },
  {
    q: 'Is my personal data encrypted?',
    a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your resume content and personal information are never shared with third parties.',
  },
  {
    q: 'Can I use RoleGenie for multiple job industries?',
    a: 'Absolutely! RoleGenie is industry-agnostic. The AI adapts its optimization strategy based on the specific job description you provide, whether in tech, finance, healthcare, or any other field.',
  },
  {
    q: 'How do I cancel my Pro subscription?',
    a: 'You can cancel your subscription at any time from the Settings > Account page. Your Pro access will remain active until the end of the current billing cycle.',
  },
];

const SupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#051424] px-8 py-10 max-w-7xl mx-auto">

      {/* ── Hero Search ──────────────────────────────────────────────── */}
      <section className="mb-16">
        <div
          className="relative overflow-hidden rounded-3xl p-12 flex flex-col justify-center min-h-[320px]"
          style={{ background: 'rgba(13,28,45,0.8)', border: '1px solid rgba(73,68,84,0.15)' }}
        >
          {/* Ambient */}
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#d0bcff]/8 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#4edea3]/5 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-5xl font-extrabold tracking-tight mb-4 text-[#d4e4fa]">
              How can we <span className="genie-gradient-text">help you?</span>
            </h2>
            <p className="text-[#cbc3d7] text-lg mb-8 leading-relaxed">
              Search our knowledge base or browse frequently asked questions to get back to optimizing your career.
            </p>

            {/* Search bar */}
            <div
              className="relative group flex items-center rounded-2xl p-2 pr-4"
              style={{ background: 'rgba(39,54,71,0.8)', border: '1px solid rgba(73,68,84,0.2)' }}
            >
              <input
                type="text"
                placeholder="Describe your issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-4 text-[#d4e4fa] focus:outline-none placeholder:text-slate-500 font-medium"
              />
              <button
                className="p-3 rounded-xl flex items-center justify-center text-[#340080] flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ + Contact ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* FAQ Accordion */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold tracking-tight text-[#d4e4fa]">Frequently Asked Questions</h3>
            <span
              className="mono-label text-xs text-[#d0bcff] uppercase tracking-tighter px-3 py-1 rounded-full"
              style={{ background: 'rgba(208,188,255,0.1)' }}
            >
              Support Library
            </span>
          </div>

          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:border-[#273647]/30"
              style={{
                background: 'rgba(39,54,71,0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(73,68,84,0.15)',
              }}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <h4 className="font-semibold text-[#d4e4fa] pr-4">{faq.q}</h4>
                {openFaq === idx
                  ? <ChevronDown className="w-5 h-5 text-[#4edea3] flex-shrink-0" />
                  : <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                }
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-5">
          <div
            className="rounded-3xl p-8 relative overflow-hidden h-full"
            style={{ background: 'rgba(28,43,60,1)', border: '1px solid rgba(73,68,84,0.15)' }}
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d0bcff]/8 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-[#d4e4fa] mb-2">Direct Contact</h3>
              <p className="text-[#cbc3d7] text-sm mb-8">
                Can't find what you're looking for? We'll reply within 24 hours.
              </p>

              {formSent ? (
                <div
                  className="text-center py-10 rounded-xl"
                  style={{ background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(78,222,163,0.2)' }}>
                    <span className="text-[#4edea3] text-xl">✓</span>
                  </div>
                  <p className="font-bold text-[#4edea3]">Message sent!</p>
                  <p className="text-xs text-slate-400 mt-1">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-5">
                  <div>
                    <label className="block text-xs mono-label uppercase tracking-widest text-slate-500 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-transparent border-b border-[#494454]/30 focus:border-[#d0bcff] py-2 text-[#d4e4fa] placeholder:text-slate-600 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mono-label uppercase tracking-widest text-slate-500 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full bg-transparent border-b border-[#494454]/30 focus:border-[#d0bcff] py-2 text-[#d4e4fa] placeholder:text-slate-600 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mono-label uppercase tracking-widest text-slate-500 mb-2">
                      Message
                    </label>
                    <textarea
                      placeholder="How can we help?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      className="w-full bg-transparent border-b border-[#494454]/30 focus:border-[#d0bcff] py-2 text-[#d4e4fa] placeholder:text-slate-600 outline-none transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
                      color: '#340080',
                    }}
                  >
                    Send Message
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Links ──────────────────────────────────────────────── */}
      <section className="pt-10" style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h5 className="text-sm font-bold tracking-widest text-[#d4e4fa] uppercase">Resource Hub</h5>
            <ul className="space-y-3">
              {[
                { icon: FileText, label: 'Documentation' },
                { icon: BookOpen, label: 'Video Tutorials' },
                { icon: MessageCircle, label: 'Community' },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-[#cbc3d7] hover:text-[#d0bcff] transition-colors text-sm flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-bold tracking-widest text-[#d4e4fa] uppercase">Legal</h5>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#cbc3d7] hover:text-[#d0bcff] transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-bold tracking-widest text-[#d4e4fa] uppercase">Status</h5>
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(39,54,71,0.4)', border: '1px solid rgba(73,68,84,0.15)' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]" />
              </span>
              <span className="mono-label text-xs text-[#d4e4fa]">Systems Operational</span>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.15)' }}
          >
            <p className="mono-label text-[10px] text-slate-500 uppercase tracking-widest mb-2">Intelligence Core</p>
            <p className="text-xs text-[#cbc3d7] leading-relaxed italic">
              "Architecture is the learned game, correct and magnificent, of forms assembled in the light."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;

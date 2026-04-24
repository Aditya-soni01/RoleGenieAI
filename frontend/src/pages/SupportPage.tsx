import React, { useEffect, useState } from 'react';
import { CheckCircle, ChevronDown, Send } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const FAQS = [
  {
    q: 'How does resume optimization work?',
    a: 'RoleGenie uses a two-stage AI pipeline powered by Claude. Stage 1 analyzes your resume against the job description, identifying matched skills, gaps, and ATS compatibility. Stage 2 rewrites your resume with natural keyword integration, STAR-method bullet points, and a quantified summary tailored to the role.',
  },
  {
    q: 'What is an ATS score?',
    a: "ATS stands for Applicant Tracking System, software that recruiters use to filter resumes before a human reads them. The ATS score measures how well your resume matches the job's keywords, formatting, and requirements.",
  },
  {
    q: 'What file formats are supported?',
    a: 'You can upload PDF and DOCX files up to 10 MB. After optimization, you can download the result as PDF or DOCX.',
  },
  {
    q: 'How many optimizations can I do for free?',
    a: 'The Free plan includes 5 optimizations per month. Upgrading gives you more usage along with advanced ATS insights and deeper rewriting support.',
  },
  {
    q: 'Is my resume data secure?',
    a: 'Yes. Resume content is transmitted over HTTPS and stored securely. You can delete your resumes at any time from the Resume Optimizer page.',
  },
];

const SupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackEvent('support_opened', { funnelStep: 'support_opened' });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent('RoleGenie Support Request');
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:support@rolegenie.com?subject=${subject}&body=${body}`);
    setSubmitted(true);
  };

  return (
    <div className="theme-shell mx-auto min-h-screen max-w-3xl p-6 lg:p-8">
      <div className="mb-10">
        <h2 className="theme-text mb-1 text-4xl font-bold tracking-tight">Support</h2>
        <p className="theme-text-muted mono-label text-sm uppercase tracking-widest">
          FAQ - Contact
        </p>
      </div>

      <section className="mb-12">
        <h3 className="theme-text mono-label mb-5 text-base font-bold uppercase tracking-widest">
          Frequently Asked Questions
        </h3>
        <div className="space-y-2">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="glass-card overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--app-border)' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left transition-colors hover:bg-[color:var(--app-panel-soft)]"
              >
                <div className="flex items-center justify-between">
                  <span className="theme-text pr-4 text-sm font-semibold">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-[#d0bcff] transition-transform duration-200 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5">
                  <p className="theme-text-muted text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="theme-text mono-label mb-5 text-base font-bold uppercase tracking-widest">
          Contact Us
        </h3>
        <div className="glass-card rounded-2xl border p-6" style={{ borderColor: 'var(--app-border)' }}>
          {submitted ? (
            <div className="space-y-3 py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-[#4edea3]" />
              <p className="theme-text font-bold">Message sent!</p>
              <p className="theme-text-muted text-sm">We&apos;ll get back to you within 24 hours.</p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', message: '' });
                }}
                className="mt-2 text-xs text-[#d0bcff] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="theme-text-subtle mono-label mb-1.5 block text-xs uppercase tracking-widest">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="theme-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40"
                    style={{ background: 'var(--app-panel-soft)' }}
                  />
                </div>
                <div>
                  <label className="theme-text-subtle mono-label mb-1.5 block text-xs uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className="theme-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40"
                    style={{ background: 'var(--app-panel-soft)' }}
                  />
                </div>
              </div>
              <div>
                <label className="theme-text-subtle mono-label mb-1.5 block text-xs uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  rows={5}
                  required
                  placeholder="Describe your issue or question..."
                  className="theme-input w-full resize-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40"
                  style={{ background: 'var(--app-panel-soft)' }}
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)', color: '#340080' }}
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default SupportPage;

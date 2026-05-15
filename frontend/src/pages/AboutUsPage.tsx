import React from 'react';
import StaticPageLayout from '@/components/common/StaticPageLayout';

const AboutUsPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="About Us"
      subtitle="RoleGenie is an AI-powered career platform focused on smarter job application workflows."
    >
      <p>
        RoleGenie is an AI-powered career platform built to help professionals improve the quality of their job
        applications through smarter resume optimization, ATS alignment, and interview preparation tools.
      </p>
      <p>
        Applying for jobs today is highly competitive. Many qualified candidates get rejected before reaching recruiters
        simply because their resumes are not aligned with modern Applicant Tracking Systems (ATS) or specific job
        descriptions. RoleGenie was created to solve that problem with practical, workflow-focused tools designed for
        real job seekers.
      </p>
      <p>
        Our platform combines resume analysis, AI-assisted resume optimization, keyword targeting, job-description
        matching, and interview preparation into a single experience. Instead of manually rewriting resumes for every
        application, users can quickly generate tailored, ATS-aware versions while maintaining their actual skills and
        experience.
      </p>
      <p><strong>RoleGenie is designed for:</strong></p>
      <ul>
        <li>Software engineers and IT professionals</li>
        <li>Students and fresh graduates</li>
        <li>Mid-level professionals switching roles</li>
        <li>Candidates preparing for international or remote opportunities</li>
      </ul>
      <p><strong>We focus on:</strong></p>
      <ul>
        <li>ATS-friendly resume structure</li>
        <li>Clear and professional formatting</li>
        <li>Job-specific resume tailoring</li>
        <li>Faster application workflows</li>
        <li>Practical interview preparation support</li>
      </ul>
      <p>
        While our AI tools help improve resume quality and relevance, final responsibility for reviewing and validating
        resume content always remains with the user.
      </p>
      <p>
        We continue improving RoleGenie based on user feedback, evolving hiring trends, and recruiter expectations.
      </p>
      <p>
        For support, partnerships, or product inquiries, please contact us through the Contact Us page.
      </p>
    </StaticPageLayout>
  );
};

export default AboutUsPage;

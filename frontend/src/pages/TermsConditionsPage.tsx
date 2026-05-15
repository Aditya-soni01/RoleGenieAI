import React from 'react';
import StaticPageLayout from '@/components/common/StaticPageLayout';

const TermsConditionsPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="Terms & Conditions"
      subtitle="Terms that govern your access to and use of RoleGenie."
    >
      <p>
        By accessing or using RoleGenie, you agree to comply with these Terms & Conditions.
      </p>
      <p><strong>Platform Usage</strong></p>
      <p>
        RoleGenie provides AI-assisted tools for resume optimization, ATS analysis, and interview preparation. Users
        agree to use the platform only for lawful and professional purposes.
      </p>
      <p>You agree not to:</p>
      <ul>
        <li>Upload misleading, fraudulent, or harmful content</li>
        <li>Attempt unauthorized access to the platform</li>
        <li>Abuse automated systems or APIs</li>
        <li>Copy, reverse engineer, or misuse platform functionality</li>
      </ul>
      <p><strong>User Responsibility</strong></p>
      <p>Users are fully responsible for:</p>
      <ul>
        <li>The accuracy of uploaded information</li>
        <li>Reviewing AI-generated suggestions</li>
        <li>Final resume content submitted to employers</li>
        <li>Compliance with applicable employment and privacy laws</li>
      </ul>
      <p>RoleGenie does not guarantee:</p>
      <ul>
        <li>Job offers</li>
        <li>Interview calls</li>
        <li>ATS approval</li>
        <li>Hiring outcomes</li>
      </ul>
      <p><strong>AI-Generated Suggestions</strong></p>
      <p>
        Resume optimizations and recommendations are generated using AI-assisted systems and should be treated as
        supportive guidance, not professional legal or employment advice.
      </p>
      <p><strong>Subscriptions & Billing</strong></p>
      <p>
        Certain features may require a paid subscription or usage-based plan. Pricing, limits, and available features
        may change over time.
      </p>
      <p>Failure to complete payment may result in restricted access to premium features.</p>
      <p><strong>Service Availability</strong></p>
      <p>
        We may update, modify, suspend, or discontinue parts of the platform at any time to improve service quality,
        security, or operational stability.
      </p>
      <p><strong>Limitation of Liability</strong></p>
      <p>
        RoleGenie is provided on an "as-is" and "as-available" basis. We are not liable for indirect losses, hiring
        outcomes, employer decisions, or interruptions caused by technical issues beyond reasonable control.
      </p>
    </StaticPageLayout>
  );
};

export default TermsConditionsPage;

import React from 'react';
import StaticPageLayout from '@/components/common/StaticPageLayout';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      subtitle="How RoleGenie collects, uses, and protects your information."
    >
      <p>
        RoleGenie values your privacy and is committed to protecting the personal information you share while using
        our platform.
      </p>
      <p><strong>Information We Collect</strong></p>
      <p>We may collect information such as:</p>
      <ul>
        <li>Name and email address</li>
        <li>Account and login details</li>
        <li>Uploaded resumes and profile information</li>
        <li>Job descriptions submitted for optimization</li>
        <li>Usage activity and feature interactions</li>
        <li>Subscription and billing-related information</li>
      </ul>
      <p><strong>How We Use Information</strong></p>
      <p>Your information is used to:</p>
      <ul>
        <li>Provide resume optimization and ATS analysis features</li>
        <li>Generate AI-assisted resume suggestions</li>
        <li>Improve platform performance and user experience</li>
        <li>Provide customer support and account-related communication</li>
        <li>Maintain platform security and prevent misuse</li>
      </ul>
      <p><strong>AI-Generated Content</strong></p>
      <p>
        RoleGenie uses AI systems to generate resume suggestions, summaries, keyword recommendations, and
        interview-related content. While we aim for accuracy and relevance, AI-generated output may occasionally
        contain errors, incomplete information, or formatting inconsistencies. Users are responsible for reviewing all
        generated content before using it in real applications.
      </p>
      <p><strong>Data Protection</strong></p>
      <p>
        We implement reasonable technical and organizational safeguards to protect user data against unauthorized
        access, misuse, or disclosure. However, no online service can guarantee absolute security.
      </p>
      <p><strong>Data Sharing</strong></p>
      <p>We do not sell personal information to third parties. Limited third-party services may be used for:</p>
      <ul>
        <li>Authentication</li>
        <li>Payment processing</li>
        <li>Infrastructure hosting</li>
        <li>Analytics and monitoring</li>
      </ul>
      <p>These services only receive information necessary for operational purposes.</p>
      <p><strong>Account Deletion</strong></p>
      <p>Users may request account deletion or data removal by contacting support through the Contact Us page.</p>
      <p><strong>Policy Updates</strong></p>
      <p>
        This Privacy Policy may be updated periodically to reflect platform improvements, legal requirements, or
        operational changes. Continued use of RoleGenie after updates indicates acceptance of the revised policy.
      </p>
    </StaticPageLayout>
  );
};

export default PrivacyPolicyPage;

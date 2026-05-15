import React from 'react';
import StaticPageLayout from '@/components/common/StaticPageLayout';

const ContactUsPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="Contact Us"
      subtitle="Support, billing help, technical assistance, and business inquiries."
    >
      <p>
        If you need help with your account, billing, resume optimization, subscriptions, or technical issues, our
        support team is available to assist you.
      </p>
      <p><strong>Support & General Inquiries</strong></p>
      <p>Email: <a href="mailto:support@rolegenie.com">support@rolegenie.com</a></p>
      <p><strong>What To Include In Your Message</strong></p>
      <p>For faster support, please include:</p>
      <ul>
        <li>Your registered email address</li>
        <li>A short description of the issue</li>
        <li>Relevant screenshots or error details if applicable</li>
      </ul>
      <p><strong>Response Time</strong></p>
      <p>
        We aim to respond to most support and billing inquiries within 1–2 business days.
      </p>
      <p><strong>Business & Partnership Requests</strong></p>
      <p>
        For collaborations, integrations, or partnership opportunities, please mention “Business Inquiry” in the
        subject line of your email.
      </p>
    </StaticPageLayout>
  );
};

export default ContactUsPage;

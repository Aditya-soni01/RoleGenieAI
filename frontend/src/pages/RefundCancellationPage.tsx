import React from 'react';
import StaticPageLayout from '@/components/common/StaticPageLayout';

const RefundCancellationPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="Refund & Cancellation"
      subtitle="Cancellation and refund terms for subscription-based and usage-based services."
    >
      <p>
        RoleGenie offers subscription-based and usage-based services for resume optimization and career support tools.
      </p>
      <p><strong>Cancellation</strong></p>
      <p>
        Users may cancel active subscriptions at any time. Unless otherwise stated, cancellation becomes effective at
        the end of the current billing cycle.
      </p>
      <p>Access to premium features may continue until the active subscription period expires.</p>
      <p><strong>Refund Policy</strong></p>
      <p>Refund requests are evaluated on a case-by-case basis. Approval may depend on:</p>
      <ul>
        <li>Subscription usage</li>
        <li>Feature consumption</li>
        <li>Duplicate transactions</li>
        <li>Technical issues affecting service access</li>
        <li>Applicable payment regulations</li>
      </ul>
      <p>Refunds are generally not provided for:</p>
      <ul>
        <li>Partial subscription usage</li>
        <li>User dissatisfaction with AI-generated suggestions</li>
        <li>Incorrect user input or uploaded content</li>
        <li>Failure to cancel before renewal</li>
      </ul>
      <p><strong>Billing Issues</strong></p>
      <p>
        If you experience billing problems, duplicate charges, or payment-related concerns, contact support with:
      </p>
      <ul>
        <li>Registered email address</li>
        <li>Transaction reference or payment receipt</li>
        <li>Brief issue description</li>
      </ul>
      <p>Our support team will review and respond as quickly as possible.</p>
    </StaticPageLayout>
  );
};

export default RefundCancellationPage;

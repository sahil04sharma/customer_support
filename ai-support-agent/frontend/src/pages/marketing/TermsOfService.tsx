import { Link } from 'react-router-dom';
import LegalLayout, { LegalCallout, LegalSection } from '../../components/marketing/LegalLayout';

const sections = [
  { id: 'agreement', title: 'The agreement' },
  { id: 'service', title: 'What you get' },
  { id: 'accounts', title: 'Your account' },
  { id: 'acceptable-use', title: 'Acceptable use' },
  { id: 'content', title: 'Your content' },
  { id: 'ai-output', title: 'AI-generated replies' },
  { id: 'plans', title: 'Plans & BYOK' },
  { id: 'payment', title: 'Payment' },
  { id: 'warranties', title: 'Warranties' },
  { id: 'liability', title: 'Liability' },
  { id: 'indemnity', title: 'Indemnity' },
  { id: 'termination', title: 'Ending the service' },
  { id: 'law', title: 'Governing law' },
  { id: 'contact', title: 'Contact' },
];

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="The agreement between you and SupportDesk when you create an account or use our platform."
      lastUpdated="July 8, 2026"
      sections={sections}
    >
      <LegalCallout>
        By using SupportDesk, you agree to these Terms and our{' '}
        <Link to="/privacy">Privacy Policy</Link>. If you&apos;re signing up on behalf of a company,
        you confirm you have authority to bind that company.
      </LegalCallout>

      <LegalSection id="agreement" title="The agreement">
        <p>
          These Terms govern your access to SupportDesk. If you don&apos;t agree, please don&apos;t
          use the service.
        </p>
      </LegalSection>

      <LegalSection id="service" title="What you get">
        <p>
          SupportDesk lets you upload knowledge-base content, embed a customer chat widget, receive
          AI-generated replies, and escalate conversations to human agents. Features and limits may
          change over time — we&apos;ll give reasonable notice before material changes.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="Your account">
        <ul>
          <li>Provide accurate registration information and keep it up to date.</li>
          <li>You&apos;re responsible for your credentials and all activity under your account.</li>
          <li>Tell us promptly if you suspect unauthorized access.</li>
          <li>One person or legal entity per business account, unless we agree otherwise in writing.</li>
        </ul>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable use">
        <p>Don&apos;t use SupportDesk to:</p>
        <ul>
          <li>Break the law, harm others, or run deceptive schemes</li>
          <li>Upload malware, illegal content, or material you don&apos;t have rights to use</li>
          <li>Bypass rate limits, security controls, or access other tenants&apos; data</li>
          <li>Reverse engineer or resell the service without our permission</li>
          <li>Spam or harass end users through the widget</li>
        </ul>
        <p>
          We may suspend or terminate accounts that violate these rules or pose a risk to the platform.
        </p>
      </LegalSection>

      <LegalSection id="content" title="Your content">
        <p>
          You keep ownership of documents, widget copy, and conversation content you submit. You
          grant SupportDesk a limited license to host, process, and display that content solely to
          provide the service — including generating embeddings and AI responses.
        </p>
        <p>
          You&apos;re responsible for having a lawful basis to collect and process end-customer data
          through the widget, including providing appropriate notices and obtaining consent where
          required.
        </p>
      </LegalSection>

      <LegalSection id="ai-output" title="AI-generated replies">
        <p>
          AI replies are generated automatically. They can be wrong, incomplete, or outdated. You&apos;re
          responsible for reviewing critical use cases and configuring escalation to humans.
          SupportDesk doesn&apos;t guarantee that AI output is accurate, lawful, or fit for any
          particular purpose.
        </p>
      </LegalSection>

      <LegalSection id="plans" title="Plans & BYOK">
        <ul>
          <li>The free plan has usage limits — monthly AI messages, document caps, and agent seats.</li>
          <li>
            If you supply your own AI provider API keys (BYOK), you&apos;re responsible for charges
            and compliance with that provider&apos;s terms.
          </li>
          <li>Paid plans may be introduced later. Free-tier use remains subject to these Terms.</li>
        </ul>
      </LegalSection>

      <LegalSection id="payment" title="Payment">
        <p>
          The free tier is currently offered at no charge. If we introduce paid features, pricing
          will be shown at checkout. Taxes may apply where required by law.
        </p>
      </LegalSection>

      <LegalSection id="warranties" title="Warranties">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
          ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SUPPORTDESK AND ITS SUPPLIERS WILL NOT BE LIABLE FOR
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
          DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICE IS LIMITED TO
          THE GREATER OF (A) AMOUNTS YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) USD $100.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="Indemnity">
        <p>
          You&apos;ll defend and indemnify SupportDesk against claims arising from your content, your
          use of the service, or your violation of these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Ending the service">
        <p>
          You can stop using SupportDesk at any time. We may suspend or terminate access for breach,
          security risk, or product discontinuation — with reasonable notice where practicable.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Governing law">
        <p>
          These Terms are governed by applicable law in your jurisdiction of operation, unless
          mandatory consumer protections require otherwise. For disputes, reach out first at{' '}
          <a href="mailto:legal@supportdesk.app">legal@supportdesk.app</a>.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about these Terms:{' '}
          <a href="mailto:legal@supportdesk.app">legal@supportdesk.app</a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

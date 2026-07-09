import LegalLayout, { LegalCallout, LegalSection } from '../../components/marketing/LegalLayout';

const sections = [
  { id: 'about', title: 'About SupportDesk' },
  { id: 'roles', title: 'Who handles what' },
  { id: 'collect', title: 'What we collect' },
  { id: 'use', title: 'How we use it' },
  { id: 'subprocessors', title: 'Third parties' },
  { id: 'retention', title: 'How long we keep data' },
  { id: 'security', title: 'Security' },
  { id: 'rights', title: 'Your rights' },
  { id: 'transfers', title: 'International transfers' },
  { id: 'children', title: 'Children' },
  { id: 'changes', title: 'Updates to this policy' },
  { id: 'contact', title: 'Contact us' },
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How we handle personal information when you use SupportDesk — as a business customer, team member, or visitor to a site with our widget."
      lastUpdated="July 8, 2026"
      sections={sections}
    >
      <LegalCallout variant="important">
        We don&apos;t sell personal data. We don&apos;t use your customers&apos; chat content to train
        public AI models.
      </LegalCallout>

      <LegalSection id="about" title="About SupportDesk">
        <p>
          SupportDesk is a customer support platform. Businesses upload documentation, embed a chat
          widget on their site, and use our dashboard to manage AI-assisted conversations and human
          handoffs.
        </p>
        <p>
          This policy covers what happens when you sign up for an account, use the dashboard, or
          chat through a widget on one of our customers&apos; websites.
        </p>
      </LegalSection>

      <LegalSection id="roles" title="Who handles what">
        <p>Data protection law distinguishes between who decides how data is used and who processes it on their behalf:</p>
        <ul>
          <li>
            <strong>Business customers</strong> — the company that signs up for SupportDesk — are
            usually the <strong>data controller</strong> for their end-customers&apos; chat data.
          </li>
          <li>
            SupportDesk acts as a <strong>data processor</strong> when we store widget conversations,
            uploaded documents, and related content on their behalf.
          </li>
          <li>
            For our own operations — accounts, billing, security logs — SupportDesk is the{' '}
            <strong>data controller</strong>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="collect" title="What we collect">
        <h3>Business accounts</h3>
        <ul>
          <li>Company name, work email, and password (stored hashed — never in plain text)</li>
          <li>Dashboard settings, widget configuration, and allowed domains</li>
          <li>Knowledge-base files and the text chunks / embeddings we generate from them</li>
          <li>Support agent names and emails, if you invite team members</li>
          <li>Your AI provider API keys, if you enable BYOK (encrypted at rest)</li>
          <li>Usage metrics like AI message counts and token estimates</li>
        </ul>

        <h3>Widget visitors</h3>
        <ul>
          <li>Chat messages and conversation history</li>
          <li>Name or email, only if provided in the widget or conversation flow</li>
          <li>CSAT ratings and feedback, if submitted</li>
          <li>Technical data: browser origin, session identifiers, and IP-derived rate-limit keys</li>
        </ul>

        <h3>Automatic collection</h3>
        <ul>
          <li>Server logs, timestamps, and error diagnostics</li>
          <li>Authentication tokens in your browser when signed in to the dashboard</li>
          <li>Cookie / local-storage consent preference on this marketing site</li>
        </ul>
      </LegalSection>

      <LegalSection id="use" title="How we use it">
        <p>We process data to:</p>
        <ul>
          <li>Run, secure, and improve the SupportDesk service</li>
          <li>Generate AI replies grounded in your uploaded knowledge base</li>
          <li>Route escalations to human agents and send notification emails when configured</li>
          <li>Enforce plan limits, rate limits, and abuse prevention</li>
          <li>Respond to support requests and meet legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection id="subprocessors" title="Third parties">
        <p>We rely on infrastructure and service providers to deliver SupportDesk:</p>
        <ul>
          <li><strong>Hosting & database</strong> — cloud application and Postgres providers</li>
          <li><strong>AI providers</strong> — Groq, Google (Gemini), or providers you configure via BYOK (OpenAI, Anthropic, etc.)</li>
          <li><strong>File storage</strong> — Cloudinary for uploaded documents and images</li>
          <li><strong>Cache & rate limiting</strong> — Upstash Redis</li>
          <li><strong>Email</strong> — Resend for transactional emails, when configured</li>
        </ul>
        <p>
          If you use <strong>Bring Your Own Key (BYOK)</strong>, AI requests go to your chosen
          provider using your credentials. Their privacy policy applies to that processing.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep data">
        <p>
          We keep account and conversation data while your account is active, plus a reasonable
          period afterward for export, dispute resolution, and legal compliance. You can delete
          documents from the dashboard anytime. To close your account entirely, contact us.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security">
        <p>
          We use TLS in transit, password hashing, tenant isolation, encrypted storage for BYOK
          API keys, and access controls on dashboard routes. No online service can guarantee
          perfect security, but we take reasonable steps to protect your data.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Your rights">
        <p>
          Depending on where you live, you may have rights to access, correct, delete, or restrict
          processing of your personal data. Business customers can manage much of their data directly
          in the dashboard.
        </p>
        <p>
          Widget visitors should contact the business whose site they used — they&apos;re the
          controller for that data. We&apos;ll help our customers respond to data subject requests
          where required.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="International transfers">
        <p>
          Our infrastructure and subprocessors may process data in countries other than yours. Where
          required by law, we rely on appropriate safeguards for cross-border transfers.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          SupportDesk isn&apos;t directed at children under 16. We don&apos;t knowingly collect their
          personal information.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Updates to this policy">
        <p>
          We may update this page from time to time. The date at the top will change when we do.
          For significant changes, we&apos;ll notify account holders by email.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact us">
        <p>
          Privacy questions:{' '}
          <a href="mailto:privacy@supportdesk.app">privacy@supportdesk.app</a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

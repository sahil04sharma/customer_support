import LegalLayout from '../../components/marketing/LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How SupportDesk collects, uses, and protects personal information."
      lastUpdated="July 8, 2026"
    >
      <section>
        <h2>1. Who we are</h2>
        <p>
          SupportDesk (&quot;we&quot;, &quot;us&quot;) provides a software service that helps businesses
          offer AI-assisted customer support through an embeddable chat widget and team dashboard.
        </p>
        <p>
          This policy describes how we handle information when you create a business account, use our
          dashboard, or interact with a chat widget embedded on a customer&apos;s website.
        </p>
      </section>

      <section>
        <h2>2. Roles under GDPR-style frameworks</h2>
        <ul>
          <li>
            <strong>Business customers</strong> (companies that sign up for SupportDesk) are generally
            the <strong>data controller</strong> for their end-customers&apos; chat data.
          </li>
          <li>
            SupportDesk acts as a <strong>data processor</strong> when handling widget conversations,
            uploaded documents, and related content on behalf of those businesses.
          </li>
          <li>
            For our own account, billing, and service operations, SupportDesk is the{' '}
            <strong>data controller</strong>.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Information we collect</h2>
        <h3>Business account holders</h3>
        <ul>
          <li>Company name, work email, and password (stored hashed)</li>
          <li>Dashboard settings, widget configuration, and allowed domains</li>
          <li>Uploaded knowledge-base documents and derived text chunks / embeddings</li>
          <li>Support agent names and emails (if you invite team members)</li>
          <li>Optionally: your own AI provider API keys (encrypted at rest if you enable BYOK)</li>
          <li>Usage metrics (e.g. AI message counts, token estimates)</li>
        </ul>

        <h3>Widget visitors (your customers)</h3>
        <ul>
          <li>Chat messages and conversation history</li>
          <li>Optional name or email if provided in the widget or conversation flow</li>
          <li>CSAT ratings and feedback if submitted</li>
          <li>Technical data: browser origin, session identifiers, and IP-derived rate-limit keys</li>
        </ul>

        <h3>Automatically collected</h3>
        <ul>
          <li>Log data, timestamps, and error diagnostics</li>
          <li>Authentication tokens stored in your browser (local storage) when signed in</li>
          <li>Cookie / local-storage consent preference on the marketing site</li>
        </ul>
      </section>

      <section>
        <h2>4. How we use information</h2>
        <ul>
          <li>Provide, secure, and improve the SupportDesk service</li>
          <li>Generate AI replies grounded in your uploaded knowledge base</li>
          <li>Route escalations to human agents and send optional notification emails</li>
          <li>Enforce plan limits, rate limits, and abuse prevention</li>
          <li>Respond to support requests and legal obligations</li>
        </ul>
        <p>
          We do <strong>not</strong> sell personal information. We do not use end-customer chat
          content to train public foundation models.
        </p>
      </section>

      <section>
        <h2>5. AI and third-party subprocessors</h2>
        <p>To deliver the service we may send data to:</p>
        <ul>
          <li><strong>Hosting & database</strong> — e.g. cloud application and Postgres providers</li>
          <li><strong>AI providers</strong> — e.g. Groq, Google (Gemini), or providers you configure (OpenAI, Anthropic)</li>
          <li><strong>File storage</strong> — e.g. Cloudinary for uploaded documents and images</li>
          <li><strong>Cache / rate limiting</strong> — e.g. Upstash Redis</li>
          <li><strong>Email</strong> — e.g. Resend (transactional emails, when configured)</li>
        </ul>
        <p>
          When you use <strong>Bring Your Own Key (BYOK)</strong>, AI requests are sent to your chosen
          provider using your credentials; their privacy policy also applies.
        </p>
      </section>

      <section>
        <h2>6. Retention</h2>
        <p>
          We retain account and conversation data while your subscription is active and for a reasonable
          period afterward to allow export, dispute resolution, and legal compliance. You may delete
          documents and request account deletion by contacting us.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We use industry-standard measures including TLS in transit, password hashing, tenant
          isolation, encrypted storage for BYOK API keys, and access controls on dashboard routes.
          No method of transmission over the internet is 100% secure.
        </p>
      </section>

      <section>
        <h2>8. Your rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or restrict
          processing of your personal data. Business customers can manage much of their data in the
          dashboard. Widget visitors should contact the business whose site they used; we will assist
          controllers with data subject requests where required.
        </p>
      </section>

      <section>
        <h2>9. International transfers</h2>
        <p>
          Our infrastructure and subprocessors may process data in countries other than yours. We rely
          on appropriate safeguards where required by law.
        </p>
      </section>

      <section>
        <h2>10. Children</h2>
        <p>
          SupportDesk is not directed at children under 16. We do not knowingly collect their personal
          information.
        </p>
      </section>

      <section>
        <h2>11. Changes</h2>
        <p>
          We may update this policy. We will post the new version on this page with an updated date.
          Material changes may be notified by email to account holders.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Privacy questions:{' '}
          <a href="mailto:privacy@supportdesk.app">privacy@supportdesk.app</a>
        </p>
      </section>
    </LegalLayout>
  );
}

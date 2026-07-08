import LegalLayout from '../../components/marketing/LegalLayout';

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Rules for using the SupportDesk platform."
      lastUpdated="July 8, 2026"
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          By creating an account or using SupportDesk, you agree to these Terms and our Privacy
          Policy. If you use the service on behalf of a company, you represent that you have authority
          to bind that company.
        </p>
      </section>

      <section>
        <h2>2. The service</h2>
        <p>
          SupportDesk provides tools to upload knowledge-base content, embed a customer chat widget,
          receive AI-generated replies, and escalate conversations to human agents. Features and
          limits may change; we will try to give reasonable notice of material changes.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <ul>
          <li>You must provide accurate registration information.</li>
          <li>You are responsible for safeguarding credentials and activity under your account.</li>
          <li>You must notify us promptly of unauthorized access.</li>
          <li>One person or legal entity per business account unless we agree otherwise.</li>
        </ul>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for unlawful, harmful, or deceptive purposes</li>
          <li>Upload malware, illegal content, or material you do not have rights to use</li>
          <li>Attempt to bypass rate limits, security controls, or other tenants&apos; data</li>
          <li>Reverse engineer or resell the service without permission</li>
          <li>Use the widget to send spam or harass end users</li>
        </ul>
        <p>
          We may suspend or terminate accounts that violate these rules or pose risk to the platform.
        </p>
      </section>

      <section>
        <h2>5. Your content</h2>
        <p>
          You retain ownership of documents, widget copy, and conversation content you submit. You
          grant SupportDesk a limited license to host, process, and display that content solely to
          provide the service (including generating embeddings and AI responses).
        </p>
        <p>
          You are responsible for having a lawful basis to collect and process end-customer data via
          the widget, including providing appropriate notices and obtaining consent where required.
        </p>
      </section>

      <section>
        <h2>6. AI-generated output</h2>
        <p>
          AI replies are generated automatically and may be inaccurate or incomplete. You are
          responsible for reviewing critical use cases and configuring escalation. SupportDesk does
          not guarantee that AI output is correct, lawful, or fit for a particular purpose.
        </p>
      </section>

      <section>
        <h2>7. Free plan & BYOK</h2>
        <ul>
          <li>The free plan includes usage limits (e.g. monthly AI messages, document and agent caps).</li>
          <li>
            If you supply your own AI provider API keys, you are responsible for charges and compliance
            with that provider&apos;s terms.
          </li>
          <li>Paid plans may be introduced later; continued free-tier use remains subject to these Terms.</li>
        </ul>
      </section>

      <section>
        <h2>8. Fees and payment</h2>
        <p>
          The free tier is currently offered at no charge. Future paid features will be described at
          checkout. Taxes may apply where required by law.
        </p>
      </section>

      <section>
        <h2>9. Disclaimer of warranties</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
          ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
        </p>
      </section>

      <section>
        <h2>10. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SUPPORTDESK AND ITS SUPPLIERS WILL NOT BE LIABLE FOR
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
          DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICE IS LIMITED TO
          THE GREATER OF (A) AMOUNTS YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) USD $100.
        </p>
      </section>

      <section>
        <h2>11. Indemnity</h2>
        <p>
          You will indemnify SupportDesk against claims arising from your content, your use of the
          service, or your violation of these Terms or applicable law.
        </p>
      </section>

      <section>
        <h2>12. Termination</h2>
        <p>
          You may stop using the service at any time. We may suspend or terminate access for breach,
          risk, or discontinuation of the product with reasonable notice where practicable.
        </p>
      </section>

      <section>
        <h2>13. Governing law</h2>
        <p>
          These Terms are governed by the laws applicable in your jurisdiction of operation unless
          mandatory consumer protections require otherwise. Disputes should first be raised with{' '}
          <a href="mailto:legal@supportdesk.app">legal@supportdesk.app</a>.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          Questions about these Terms:{' '}
          <a href="mailto:legal@supportdesk.app">legal@supportdesk.app</a>
        </p>
      </section>
    </LegalLayout>
  );
}

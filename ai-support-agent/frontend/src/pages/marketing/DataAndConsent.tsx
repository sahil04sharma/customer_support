import { Link } from 'react-router-dom';
import LegalLayout from '../../components/marketing/LegalLayout';

export default function DataAndConsent() {
  return (
    <LegalLayout
      title="Data & consent"
      description="What we collect, why we need it, and how consent works for businesses and end-users."
      lastUpdated="July 8, 2026"
    >
      <section>
        <h2>Overview</h2>
        <p>
          This page is a plain-language summary of data practices for SupportDesk. It supplements our{' '}
          <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
        </p>
      </section>

      <section>
        <h2>Who is responsible for what?</h2>
        <div className="not-prose my-4 overflow-hidden rounded-xl border border-ink-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs font-semibold uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Data subject</th>
                <th className="px-4 py-3">Controller</th>
                <th className="px-4 py-3">Processor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              <tr>
                <td className="px-4 py-3 text-ink-700">Business account holder</td>
                <td className="px-4 py-3 text-ink-600">SupportDesk</td>
                <td className="px-4 py-3 text-ink-400">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-ink-700">Widget visitor / end-customer</td>
                <td className="px-4 py-3 text-ink-600">Your business (our customer)</td>
                <td className="px-4 py-3 text-ink-600">SupportDesk</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          If you embed our widget, <strong>you</strong> should tell your visitors that chats may be
          processed by AI and stored for support purposes, and link to your own privacy notice.
        </p>
      </section>

      <section>
        <h2>Data we collect — business accounts</h2>
        <ul>
          <li>
            <strong>Registration:</strong> company name, email, password (hashed, never stored in plain text)
          </li>
          <li>
            <strong>Knowledge base:</strong> files you upload (PDF, TXT), extracted text, vector embeddings
          </li>
          <li>
            <strong>Configuration:</strong> widget appearance, welcome messages, allowed domains, AI persona settings
          </li>
          <li>
            <strong>Team:</strong> agent names and emails if you invite support staff
          </li>
          <li>
            <strong>BYOK (optional):</strong> third-party API keys you provide — encrypted at rest; never shown in full after save
          </li>
          <li>
            <strong>Usage:</strong> message counts, token estimates, document counts (for plan limits)
          </li>
        </ul>
      </section>

      <section>
        <h2>Data we collect — widget visitors</h2>
        <ul>
          <li>
            <strong>Chat content:</strong> messages sent in the conversation thread
          </li>
          <li>
            <strong>Identity (optional):</strong> name or email if the visitor or your flow provides it
          </li>
          <li>
            <strong>Feedback (optional):</strong> star rating and short comment after a chat ends
          </li>
          <li>
            <strong>Technical:</strong> website origin (for domain allowlists), session token, hashed IP for abuse prevention
          </li>
        </ul>
        <p>
          We do not intentionally collect payment cards, government IDs, or health data through the
          widget. Do not encourage visitors to submit sensitive categories of data in chat unless you
          have a lawful basis and appropriate safeguards.
        </p>
      </section>

      <section>
        <h2>Legal bases (examples)</h2>
        <ul>
          <li>
            <strong>Contract:</strong> processing needed to provide the service you signed up for
          </li>
          <li>
            <strong>Legitimate interests:</strong> security, fraud prevention, and service improvement
          </li>
          <li>
            <strong>Consent:</strong> where you or your visitors opt in (e.g. marketing cookies if we add them later)
          </li>
        </ul>
        <p>As a business customer, you must determine the correct basis for processing your visitors&apos; data.</p>
      </section>

      <section>
        <h2>Consent at registration</h2>
        <p>When you create a SupportDesk account, we ask you to confirm that you:</p>
        <ul>
          <li>Agree to our Terms of Service</li>
          <li>Have read and accept our Privacy Policy</li>
          <li>Understand how customer chat data will be processed when you embed the widget</li>
        </ul>
        <p>
          This is recorded as part of account creation (timestamp in our systems). We do not sell your
          registration data to third parties.
        </p>
      </section>

      <section>
        <h2>Consent for your website visitors</h2>
        <p>We recommend your widget or site include a short notice such as:</p>
        <blockquote>
          &quot;Chats are handled by an AI assistant and may be reviewed by our support team. See our
          [Privacy Policy] for how we use chat data.&quot;
        </blockquote>
        <p>
          You can add similar text to your widget welcome message in Dashboard → Widget settings.
        </p>
      </section>

      <section>
        <h2>Cookies & local storage</h2>
        <ul>
          <li>
            <strong>Marketing site:</strong> consent preference stored in local storage after you accept the banner
          </li>
          <li>
            <strong>Dashboard:</strong> authentication tokens and UI preferences in local storage
          </li>
          <li>
            <strong>Widget:</strong> session identifiers to keep conversations connected; no advertising cookies
          </li>
        </ul>
      </section>

      <section>
        <h2>Subprocessors</h2>
        <p>We rely on trusted providers to run the platform, including:</p>
        <ul>
          <li>Cloud hosting and PostgreSQL database</li>
          <li>AI inference (platform keys or your BYOK provider)</li>
          <li>File CDN / storage for uploads</li>
          <li>Redis for caching and rate limits</li>
          <li>Transactional email (when enabled)</li>
        </ul>
        <p>A current list is available on request at <a href="mailto:privacy@supportdesk.app">privacy@supportdesk.app</a>.</p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li><strong>Export:</strong> conversation transcripts from the dashboard</li>
          <li><strong>Delete:</strong> knowledge-base documents from the dashboard</li>
          <li><strong>Account closure:</strong> contact us to request deletion of your business account</li>
          <li><strong>BYOK:</strong> remove your API keys anytime in Dashboard → AI providers</li>
        </ul>
      </section>

      <section>
        <h2>Contact & DPA</h2>
        <p>
          Data protection inquiries:{' '}
          <a href="mailto:privacy@supportdesk.app">privacy@supportdesk.app</a>
        </p>
        <p>
          Business customers requiring a Data Processing Agreement (DPA) may request a standard template
          by email.
        </p>
      </section>
    </LegalLayout>
  );
}

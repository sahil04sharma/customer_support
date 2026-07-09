import { Link } from 'react-router-dom';
import { Building2, MessageCircle, User } from 'lucide-react';
import LegalLayout, { LegalCallout, LegalSection } from '../../components/marketing/LegalLayout';

const sections = [
  { id: 'overview', title: 'Quick overview' },
  { id: 'responsibility', title: 'Who is responsible' },
  { id: 'business-data', title: 'Business account data' },
  { id: 'visitor-data', title: 'Widget visitor data' },
  { id: 'legal-bases', title: 'Legal bases' },
  { id: 'registration', title: 'Consent at signup' },
  { id: 'visitor-consent', title: 'Your visitors' },
  { id: 'cookies', title: 'Cookies & storage' },
  { id: 'subprocessors', title: 'Subprocessors' },
  { id: 'choices', title: 'Your choices' },
  { id: 'contact', title: 'Contact & DPA' },
];

export default function DataAndConsent() {
  return (
    <LegalLayout
      title="Data & consent"
      description="A plain-language guide to what SupportDesk collects, why, and what you need to tell your own customers."
      lastUpdated="July 8, 2026"
      sections={sections}
    >
      <LegalSection id="overview" title="Quick overview">
        <p>
          This page summarizes how data flows through SupportDesk. It&apos;s meant to be readable —
          for the full legal text, see our <Link to="/privacy">Privacy Policy</Link> and{' '}
          <Link to="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>

      <LegalSection id="responsibility" title="Who is responsible">
        <div className="my-4 grid gap-3 sm:grid-cols-2">
          <div className="legal-role-card">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-ink-900">You (business customer)</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-600">
              You decide how your visitors&apos; chat data is used. You&apos;re the{' '}
              <strong className="font-semibold text-ink-800">data controller</strong> for widget
              conversations.
            </p>
          </div>
          <div className="legal-role-card">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-white">
                <MessageCircle className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-ink-900">SupportDesk</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-600">
              We process that data on your behalf — storing chats, running AI, routing to agents.
              We&apos;re the <strong className="font-semibold text-ink-800">data processor</strong>.
            </p>
          </div>
        </div>

        <table className="legal-table">
          <thead>
            <tr>
              <th>Who</th>
              <th>Controller</th>
              <th>Processor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium text-ink-800">Business account holder</td>
              <td>SupportDesk</td>
              <td className="text-ink-400">—</td>
            </tr>
            <tr>
              <td className="font-medium text-ink-800">Widget visitor</td>
              <td>Your business</td>
              <td>SupportDesk</td>
            </tr>
          </tbody>
        </table>

        <LegalCallout variant="important">
          If you embed our widget, tell your visitors that chats may be processed by AI and stored
          for support. Link to your own privacy notice.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="business-data" title="Business account data">
        <ul>
          <li>
            <strong>Registration</strong> — company name, email, password (hashed, never plain text)
          </li>
          <li>
            <strong>Knowledge base</strong> — uploaded files (PDF, TXT), extracted text, vector embeddings
          </li>
          <li>
            <strong>Configuration</strong> — widget appearance, welcome messages, allowed domains, AI persona
          </li>
          <li>
            <strong>Team</strong> — agent names and emails when you invite support staff
          </li>
          <li>
            <strong>BYOK (optional)</strong> — third-party API keys, encrypted at rest; never shown in full after save
          </li>
          <li>
            <strong>Usage</strong> — message counts, token estimates, document counts for plan limits
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="visitor-data" title="Widget visitor data">
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-ink-200/80 bg-ink-50/40 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-ink-600 shadow-sm">
            <User className="h-4 w-4" />
          </div>
          <p className="text-xs leading-relaxed text-ink-600">
            This is data from people chatting on <em>your</em> website through the SupportDesk widget.
            You control what you ask them for.
          </p>
        </div>

        <ul>
          <li><strong>Chat content</strong> — messages in the conversation thread</li>
          <li><strong>Identity (optional)</strong> — name or email, if your flow collects it</li>
          <li><strong>Feedback (optional)</strong> — star rating and short comment after a chat</li>
          <li><strong>Technical</strong> — website origin, session token, hashed IP for abuse prevention</li>
        </ul>

        <p>
          We don&apos;t intentionally collect payment cards, government IDs, or health data through the
          widget. Don&apos;t encourage visitors to submit sensitive data in chat unless you have a
          lawful basis and proper safeguards.
        </p>
      </LegalSection>

      <LegalSection id="legal-bases" title="Legal bases">
        <p>Common reasons we process data:</p>
        <ul>
          <li><strong>Contract</strong> — needed to provide the service you signed up for</li>
          <li><strong>Legitimate interests</strong> — security, fraud prevention, service improvement</li>
          <li><strong>Consent</strong> — where you or visitors opt in (e.g. non-essential cookies, if added later)</li>
        </ul>
        <p>
          As a business customer, you determine the correct legal basis for processing your
          visitors&apos; data.
        </p>
      </LegalSection>

      <LegalSection id="registration" title="Consent at signup">
        <p>When you create a SupportDesk account, you confirm that you:</p>
        <ul>
          <li>Agree to our Terms of Service</li>
          <li>Have read and accept our Privacy Policy</li>
          <li>Understand how customer chat data will be processed when you embed the widget</li>
        </ul>
        <p>
          We record this at account creation. We don&apos;t sell your registration data to third parties.
        </p>
      </LegalSection>

      <LegalSection id="visitor-consent" title="Your visitors">
        <p>
          Add a short notice to your widget welcome message or site. Something like:
        </p>
        <div className="legal-code-block">
          Chats are handled by an AI assistant and may be reviewed by our support team.
          See our Privacy Policy for how we use chat data.
        </div>
        <p>
          You can edit this in <strong>Dashboard → Widget settings</strong>.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies & storage">
        <ul>
          <li>
            <strong>This marketing site</strong> — consent preference stored in local storage after you accept the banner
          </li>
          <li>
            <strong>Dashboard</strong> — authentication tokens and UI preferences in local storage
          </li>
          <li>
            <strong>Widget</strong> — session identifiers to keep conversations connected; no advertising cookies
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="subprocessors" title="Subprocessors">
        <p>We use trusted providers to run the platform:</p>
        <ul>
          <li>Cloud hosting and PostgreSQL database</li>
          <li>AI inference — platform keys or your BYOK provider</li>
          <li>File CDN / storage for uploads</li>
          <li>Redis for caching and rate limits</li>
          <li>Transactional email, when enabled</li>
        </ul>
        <p>
          Request the current subprocessor list at{' '}
          <a href="mailto:privacy@supportdesk.app">privacy@supportdesk.app</a>.
        </p>
      </LegalSection>

      <LegalSection id="choices" title="Your choices">
        <ul>
          <li><strong>Export</strong> — conversation transcripts from the dashboard</li>
          <li><strong>Delete</strong> — knowledge-base documents from the dashboard</li>
          <li><strong>Close account</strong> — email us to request full account deletion</li>
          <li><strong>Remove BYOK keys</strong> — anytime in Dashboard → AI providers</li>
        </ul>
      </LegalSection>

      <LegalSection id="contact" title="Contact & DPA">
        <p>
          Data protection inquiries:{' '}
          <a href="mailto:privacy@supportdesk.app">privacy@supportdesk.app</a>
        </p>
        <p>
          Need a Data Processing Agreement? Email us for a standard DPA template.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

import { env } from '../config/env';
import { logError } from '../utils/safeLog';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (env.resendApiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Email send failed (${res.status}): ${body}`);
    }
    return;
  }

  console.log(
    `[email] To: ${options.to}\nSubject: ${options.subject}\n${options.text ?? options.html}`
  );
}

export async function sendWelcomeEmail(to: string, businessName: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Welcome to SupportDesk',
    text: `Hi ${businessName},\n\nYour SupportDesk account is ready. Log in at ${env.clientUrl}/login to upload your knowledge base and install the chat widget.\n\n— SupportDesk`,
    html: `<p>Hi ${escapeHtml(businessName)},</p><p>Your SupportDesk account is ready. <a href="${env.clientUrl}/login">Log in</a> to upload your knowledge base and install the chat widget.</p><p>— SupportDesk</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Reset your SupportDesk password',
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `<p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
  });
}

export async function sendEscalationEmail(options: {
  to: string;
  businessName: string;
  conversationId: string;
}): Promise<void> {
  const url = `${env.clientUrl}/dashboard/conversations/${options.conversationId}`;
  await sendEmail({
    to: options.to,
    subject: `New escalated chat — ${options.businessName}`,
    text: `A customer chat was escalated and no agent is online.\n\nView conversation: ${url}`,
    html: `<p>A customer chat was escalated and no agent is online.</p><p><a href="${url}">View conversation</a></p>`,
  });
}

export async function sendPlanLimitEmail(options: {
  to: string;
  businessName: string;
  used: number;
  limit: number;
  overLimit: boolean;
}): Promise<void> {
  const subject = options.overLimit
    ? 'SupportDesk: monthly AI limit reached'
    : 'SupportDesk: approaching monthly AI limit';

  const body = options.overLimit
    ? `Hi ${options.businessName},\n\nYou've used ${options.used} of ${options.limit} AI messages this month on the Free plan. The widget will not send new AI replies until next month.\n\nPro plans with higher limits are coming soon.`
    : `Hi ${options.businessName},\n\nYou've used ${options.used} of ${options.limit} AI messages this month (${Math.round((options.used / options.limit) * 100)}%). Consider monitoring usage in your dashboard.\n\nPro plans with higher limits are coming soon.`;

  await sendEmail({
    to: options.to,
    subject,
    text: body,
    html: `<p>${escapeHtml(body).replace(/\n/g, '<br>')}</p>`,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sendEmailSafe(fn: () => Promise<void>): void {
  void fn().catch((err) => logError('email', err));
}

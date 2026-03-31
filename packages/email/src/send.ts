import { Resend } from 'resend';
import { createItem } from '@directus/sdk';
import type { EmailConfig, SendEmailOptions, SendResult } from './types.js';
import { getEmailTemplate } from './templates.js';

export async function sendEmail(config: EmailConfig, options: SendEmailOptions): Promise<SendResult> {
  const resend = new Resend(config.resendApiKey);

  let subject = options.subject || '';
  let html = options.html || '';
  let text = options.text || '';

  // If templateSlug is provided, fetch and render the template
  if (options.templateSlug) {
    const template = await getEmailTemplate(config, options.templateSlug);
    if (!template) {
      return { success: false, error: `Template "${options.templateSlug}" not found` };
    }
    subject = subject || renderVariables(template.subject, options.variables);
    html = html || renderVariables(template.htmlBody, options.variables);
    text = text || (template.textBody ? renderVariables(template.textBody, options.variables) : '');
  }

  if (!subject) {
    return { success: false, error: 'Subject is required' };
  }

  const from = config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail;
  const to = Array.isArray(options.to) ? options.to : [options.to];

  try {
    const attachments = options.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content instanceof Buffer ? a.content : Buffer.from(a.content),
    }));

    const payload: Parameters<typeof resend.emails.send>[0] = html
      ? { from, to, subject, html, reply_to: options.replyTo, attachments }
      : { from, to, subject, text: text || '', reply_to: options.replyTo, attachments };

    const result = await resend.emails.send(payload);

    const resendId = result.data?.id;

    if (config.enableLogging) {
      await logEmail(config, {
        templateSlug: options.templateSlug,
        toEmail: to.join(', '),
        fromEmail: config.fromEmail,
        subject,
        status: 'sent',
        resendId,
      });
    }

    return { success: true, id: resendId };
  } catch (err: any) {
    const errorMessage = err?.message || 'Unknown error';

    if (config.enableLogging) {
      await logEmail(config, {
        templateSlug: options.templateSlug,
        toEmail: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        fromEmail: config.fromEmail,
        subject,
        status: 'failed',
        error: errorMessage,
      });
    }

    return { success: false, error: errorMessage };
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderVariables(template: string, variables?: Record<string, string>): string {
  if (!variables) return template;
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g'), escapeHtml(value)),
    template,
  );
}

interface LogEntry {
  templateSlug?: string;
  toEmail: string;
  fromEmail: string;
  subject: string;
  status: 'sent' | 'failed';
  resendId?: string;
  error?: string;
}

async function logEmail(config: EmailConfig, entry: LogEntry): Promise<void> {
  try {
    await config.directus.request(
      createItem(config.collections.log, {
        template_slug: entry.templateSlug || null,
        to_email: entry.toEmail,
        from_email: entry.fromEmail,
        subject: entry.subject,
        status: entry.status,
        resend_id: entry.resendId || null,
        error: entry.error || null,
        site: config.siteId || null,
      }),
    );
  } catch {
    // Silently fail — logging should not break email sending
  }
}

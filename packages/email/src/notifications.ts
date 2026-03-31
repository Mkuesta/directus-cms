import type { EmailConfig, SendResult } from './types.js';
import { sendEmail } from './send.js';

export async function sendFormNotification(
  config: EmailConfig,
  options: {
    form: string;
    data: Record<string, any>;
    notifyEmails: string[];
  },
): Promise<SendResult> {
  const rows = Object.entries(options.data)
    .map(([key, value]) => `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">${escapeHtml(key)}</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(String(value))}</td></tr>`)
    .join('\n');

  const html = `
<h2>New Form Submission: ${escapeHtml(options.form)}</h2>
<table style="border-collapse:collapse;width:100%">
  <thead><tr><th style="padding:8px;border:1px solid #ddd;text-align:left">Field</th><th style="padding:8px;border:1px solid #ddd;text-align:left">Value</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<p style="color:#666;margin-top:16px">Submitted via ${config.siteName || 'your site'}</p>
`;

  return sendEmail(config, {
    to: options.notifyEmails,
    subject: `New ${options.form} submission${config.siteName ? ` — ${config.siteName}` : ''}`,
    html,
  });
}

export async function sendOrderConfirmation(
  config: EmailConfig,
  options: {
    customerEmail: string;
    orderId: string;
    lineItems: Array<{ name: string; quantity: number; price: number; downloadUrl?: string }>;
    total: number;
    currency?: string;
    /** Map of product slug → download URL (alternative to per-item downloadUrl) */
    downloadUrls?: Record<string, string>;
    /** Extra HTML to append after the order table (e.g. instructions, support info) */
    footerHtml?: string;
  },
): Promise<SendResult> {
  const currency = options.currency || 'EUR';
  const hasDownloads = options.lineItems.some((i) => i.downloadUrl) || (options.downloadUrls && Object.keys(options.downloadUrls).length > 0);

  const itemRows = options.lineItems
    .map((item) => {
      const downloadUrl = item.downloadUrl || options.downloadUrls?.[item.name];
      const downloadCell = hasDownloads
        ? `<td style="padding:8px;border:1px solid #ddd;text-align:center">${downloadUrl ? `<a href="${escapeHtml(downloadUrl)}" style="color:#4f46e5;text-decoration:none">Download</a>` : '—'}</td>`
        : '';
      return `<tr><td style="padding:8px;border:1px solid #ddd">${escapeHtml(item.name)}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td><td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.price, currency)}</td>${downloadCell}</tr>`;
    })
    .join('\n');

  const downloadHeader = hasDownloads
    ? '<th style="padding:8px;border:1px solid #ddd;text-align:center">Download</th>'
    : '';
  const footerColspan = hasDownloads ? 3 : 2;

  const downloadSection = hasDownloads
    ? '<p style="color:#666;margin-top:16px">Your download links are included above. If you have any issues, please contact us.</p>'
    : '';

  const html = `
<h2>Order Confirmation</h2>
<p>Thank you for your order! Your order ID is <strong>${escapeHtml(options.orderId)}</strong>.</p>
<table style="border-collapse:collapse;width:100%">
  <thead><tr><th style="padding:8px;border:1px solid #ddd;text-align:left">Item</th><th style="padding:8px;border:1px solid #ddd;text-align:center">Qty</th><th style="padding:8px;border:1px solid #ddd;text-align:right">Price</th>${downloadHeader}</tr></thead>
  <tbody>${itemRows}</tbody>
  <tfoot><tr><td colspan="${footerColspan}" style="padding:8px;border:1px solid #ddd;font-weight:bold;text-align:right">Total</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold;text-align:right">${formatCurrency(options.total, currency)}</td></tr></tfoot>
</table>
${downloadSection}
${options.footerHtml || ''}
`;

  return sendEmail(config, {
    to: options.customerEmail,
    subject: `Order Confirmation #${options.orderId}${config.siteName ? ` — ${config.siteName}` : ''}`,
    html,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
}

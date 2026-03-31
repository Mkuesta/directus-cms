import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePdf } from './invoice-pdf.js';
import { sendEmail } from './send.js';
import type { EmailConfig, InvoiceData, InvoiceStyleOptions, SendInvoiceOptions, SendResult } from './types.js';

/**
 * Generate a PDF invoice as a Buffer.
 * Requires `@react-pdf/renderer` to be installed.
 */
export async function generateInvoicePdf(
  data: InvoiceData,
  style?: InvoiceStyleOptions,
): Promise<Buffer> {
  const element = <InvoicePdf data={data} style={style} />;
  return await renderToBuffer(element as any);
}

/**
 * Generate a PDF invoice and send it as an email attachment via Resend.
 */
export async function sendInvoice(
  config: EmailConfig,
  options: SendInvoiceOptions,
): Promise<SendResult> {
  const { invoice, style, subject, html, replyTo, pdfFilename } = options;

  const pdfBuffer = await generateInvoicePdf(invoice, style);

  const filename = pdfFilename || `invoice-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;

  const defaultSubject = `Invoice ${invoice.invoiceNumber}${config.siteName ? ` — ${config.siteName}` : ''}`;

  const defaultHtml = `
<h2>Invoice ${escapeHtml(invoice.invoiceNumber)}</h2>
<p>Dear ${escapeHtml(invoice.customerName)},</p>
<p>Please find your invoice attached.</p>
<table style="border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:4px 12px 4px 0;color:#666">Invoice No.</td><td style="padding:4px 0;font-weight:bold">${escapeHtml(invoice.invoiceNumber)}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Date</td><td style="padding:4px 0">${escapeHtml(invoice.invoiceDate)}</td></tr>
  ${invoice.dueDate ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Due Date</td><td style="padding:4px 0">${escapeHtml(invoice.dueDate)}</td></tr>` : ''}
  <tr><td style="padding:4px 12px 4px 0;color:#666">Total</td><td style="padding:4px 0;font-weight:bold">${formatCurrency(invoice.total, invoice.currency)}</td></tr>
</table>
${invoice.paymentTerms ? `<p style="color:#666">Payment terms: ${escapeHtml(invoice.paymentTerms)}</p>` : ''}
<p>Thank you for your business.</p>
<p style="color:#999;font-size:12px">${escapeHtml(config.siteName || invoice.companyName)}</p>
`;

  return sendEmail(config, {
    to: invoice.customerEmail,
    subject: subject || defaultSubject,
    html: html || defaultHtml,
    replyTo,
    attachments: [{ filename, content: pdfBuffer }],
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

export { InvoicePdf } from './invoice-pdf.js';

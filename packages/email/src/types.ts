import type { RestClient } from '@directus/sdk';

// ── EmailCollections: maps logical names to Directus collection names ────────

export interface EmailCollections {
  /** Directus collection name for email templates (e.g. "email_templates") */
  templates: string;
  /** Directus collection name for email log (e.g. "email_log") */
  log: string;
}

// ── EmailConfig: passed to createEmailClient() ──────────────────────────────

export interface EmailConfig {
  /** A Directus SDK client instance */
  directus: RestClient<any>;
  /** Maps logical collection names to prefixed Directus collection names */
  collections: EmailCollections;
  /** Resend API key */
  resendApiKey: string;
  /** Default sender email address */
  fromEmail: string;
  /** Default sender display name (optional) */
  fromName?: string;
  /** Multi-tenant site ID (optional) */
  siteId?: number;
  /** Site name (optional, used in notification emails) */
  siteName?: string;
  /** Whether to log sent/failed emails to Directus (default false) */
  enableLogging?: boolean;
}

// ── Directus raw types ──────────────────────────────────────────────────────

export interface DirectusEmailTemplate {
  id: number;
  slug: string;
  name: string;
  subject: string;
  html_body: string;
  text_body?: string | null;
  variables: string[] | null;
  status: 'active' | 'draft';
  site?: number | null;
  date_created?: string | null;
  date_updated?: string | null;
}

export interface DirectusEmailLog {
  id?: number;
  template_slug?: string | null;
  to_email: string;
  from_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'bounced';
  resend_id?: string | null;
  error?: string | null;
  metadata?: Record<string, any> | null;
  site?: number | null;
  date_created?: string | null;
}

// ── Transformed types (used by consumers) ───────────────────────────────────

export interface EmailTemplate {
  id: number;
  slug: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: string[];
  status: 'active' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

// ── Send options & result ───────────────────────────────────────────────────

export interface EmailAttachment {
  /** File name (e.g. 'invoice.pdf') */
  filename: string;
  /** File content as Buffer or Uint8Array */
  content: Buffer | Uint8Array;
}

export interface SendEmailOptions {
  /** Recipient email address(es) */
  to: string | string[];
  /** Email subject (overrides template subject if provided) */
  subject?: string;
  /** Template slug to use for rendering */
  templateSlug?: string;
  /** Variables to interpolate into the template */
  variables?: Record<string, string>;
  /** Raw HTML body (overrides template if provided) */
  html?: string;
  /** Raw text body (overrides template if provided) */
  text?: string;
  /** Reply-to email address */
  replyTo?: string;
  /** File attachments */
  attachments?: EmailAttachment[];
}

export interface SendResult {
  success: boolean;
  /** Resend message ID on success */
  id?: string;
  /** Error message on failure */
  error?: string;
}

// ── Invoice types ───────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  /** Item name */
  name: string;
  /** Item description (optional) */
  description?: string;
  /** Quantity */
  quantity: number;
  /** Unit price */
  unitPrice: number;
  /** Line total (quantity * unitPrice) */
  total: number;
}

export interface InvoiceData {
  /** Invoice number (e.g. 'INV-2026-001') */
  invoiceNumber: string;
  /** Invoice date (e.g. '2026-03-20') */
  invoiceDate: string;
  /** Payment due date (optional) */
  dueDate?: string;

  // Seller
  /** Company / seller name */
  companyName: string;
  /** Company address lines */
  companyAddress?: string[];
  /** Company email */
  companyEmail?: string;
  /** Company phone */
  companyPhone?: string;
  /** Company logo URL or base64 data URI */
  companyLogo?: string;
  /** Company VAT / tax ID */
  companyTaxId?: string;

  // Buyer
  /** Customer name */
  customerName: string;
  /** Customer email */
  customerEmail: string;
  /** Customer address lines */
  customerAddress?: string[];
  /** Customer VAT / tax ID */
  customerTaxId?: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Totals
  /** Subtotal before tax/discount/shipping */
  subtotal: number;
  /** Tax amount */
  tax?: number;
  /** Tax rate as percentage (e.g. 21 for 21%) */
  taxRate?: number;
  /** Tax label (e.g. 'VAT', 'GST', 'Sales Tax') */
  taxLabel?: string;
  /** Discount amount */
  discount?: number;
  /** Shipping amount */
  shipping?: number;
  /** Grand total */
  total: number;
  /** ISO 4217 currency code (e.g. 'EUR', 'USD') */
  currency: string;

  // Footer
  /** Additional notes (e.g. 'Thank you for your business') */
  notes?: string;
  /** Payment terms (e.g. 'Net 30 days') */
  paymentTerms?: string;
}

export interface InvoiceStyleOptions {
  /** Primary brand color (default: '#4f46e5') */
  primaryColor?: string;
  /** Font family (default: 'Helvetica') */
  fontFamily?: string;
}

export interface SendInvoiceOptions {
  /** Invoice data */
  invoice: InvoiceData;
  /** Style overrides */
  style?: InvoiceStyleOptions;
  /** Additional email subject (default: 'Invoice {invoiceNumber}') */
  subject?: string;
  /** Additional HTML body above the invoice attachment */
  html?: string;
  /** Reply-to email address */
  replyTo?: string;
  /** PDF filename (default: 'invoice-{invoiceNumber}.pdf') */
  pdfFilename?: string;
}

// ── EmailClient: returned by createEmailClient() ────────────────────────────

export interface EmailClient {
  config: EmailConfig;
  /** Send an email (with optional template) */
  sendEmail(options: SendEmailOptions): Promise<SendResult>;
  /** Get all active email templates */
  getEmailTemplates(): Promise<EmailTemplate[]>;
  /** Get a single email template by slug */
  getEmailTemplate(slug: string): Promise<EmailTemplate | null>;
  /** Render a template with variables (pure, no side effects) */
  renderTemplate(template: EmailTemplate, variables: Record<string, string>): { subject: string; html: string; text?: string };
  /** Send a form submission notification email */
  sendFormNotification(options: {
    form: string;
    data: Record<string, any>;
    notifyEmails: string[];
  }): Promise<SendResult>;
  /** Send an order confirmation email (with optional download links) */
  sendOrderConfirmation(options: {
    customerEmail: string;
    orderId: string;
    lineItems: Array<{ name: string; quantity: number; price: number; downloadUrl?: string }>;
    total: number;
    currency?: string;
    /** Map of product slug/name → download URL (alternative to per-item downloadUrl) */
    downloadUrls?: Record<string, string>;
    /** Extra HTML to append after the order table */
    footerHtml?: string;
  }): Promise<SendResult>;
  /** Create a Next.js API route handler for sending emails */
  createApiHandler(): (request: Request) => Promise<Response>;
  /**
   * Generate a PDF invoice and send it as an email attachment.
   * Requires `@react-pdf/renderer` to be installed.
   */
  sendInvoice?(options: SendInvoiceOptions): Promise<SendResult>;
}

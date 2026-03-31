import type { RestClient } from '@directus/sdk';

// ── FormConfig: passed to createFormClient() ─────────────────────────────────

export interface FormCollections {
  /** Directus collection name for form submissions (e.g. "form_submissions") */
  submissions: string;
}

export interface FormConfig {
  /** A Directus SDK client instance (needs write access to submissions collection) */
  directus: RestClient<any>;
  /** Maps logical collection names to prefixed Directus collection names */
  collections: FormCollections;
  /** Multi-tenant site ID (optional, stored with each submission) */
  siteId?: number;
  /** Site name (optional, stored with each submission) */
  siteName?: string;
  /** Enable honeypot spam protection (default true) */
  honeypotEnabled?: boolean;
  /** Honeypot field name (default "_hp_field") */
  honeypotField?: string;
  /** Rate limit: max submissions per IP within window (default 5) */
  rateLimit?: number;
  /** Rate limit window in milliseconds (default 60000 = 1 minute) */
  rateLimitWindow?: number;
  /** Email notification config — fires after successful submission */
  notifications?: {
    /** Email addresses to notify on new submissions */
    notifyEmails: string[];
    /** Callback to send the notification (e.g. emailClient.sendFormNotification) */
    sendNotification: (options: { form: string; data: Record<string, any>; notifyEmails: string[] }) => Promise<any>;
  };
}

// ── Directus raw types ───────────────────────────────────────────────────────

export interface DirectusFormSubmission {
  id?: number;
  form: string;
  data: Record<string, any>;
  ip?: string;
  user_agent?: string;
  referrer?: string;
  site?: number | null;
  site_name?: string;
  status: 'new' | 'read' | 'archived' | 'spam';
  date_created?: string;
}

// ── Transformed types (used by consumers) ────────────────────────────────────

export interface FormSubmission {
  id: number;
  form: string;
  data: Record<string, any>;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  status: 'new' | 'read' | 'archived' | 'spam';
  createdAt?: string;
}

export interface SubmitFormOptions {
  /** Form identifier (e.g. "contact", "newsletter", "lead") */
  form: string;
  /** Form field data */
  data: Record<string, any>;
  /** Visitor IP address (pass from request headers) */
  ip?: string;
  /** Visitor user agent (pass from request headers) */
  userAgent?: string;
  /** Page referrer URL */
  referrer?: string;
  /** Honeypot field value (should be empty if legit) */
  honeypotValue?: string;
}

export interface SubmitResult {
  success: boolean;
  error?: 'spam_detected' | 'rate_limited' | 'submission_failed';
}

// ── FormClient: returned by createFormClient() ──────────────────────────────

export interface FormClient {
  config: FormConfig;
  /** Submit a form entry */
  submitForm(options: SubmitFormOptions): Promise<SubmitResult>;
  /** Get submissions for a form (for admin/review purposes) */
  getSubmissions(form: string, options?: { status?: string; limit?: number }): Promise<FormSubmission[]>;
  /** Create a Next.js API route handler for form submissions */
  createApiHandler(): (request: Request) => Promise<Response>;
}

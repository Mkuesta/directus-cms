import type { StripeConfig, Invoice } from './types.js';
import { getSupabaseClient, getSiteId } from './supabase.js';

function transformInvoice(raw: any): Invoice {
  return {
    id: raw.id,
    siteId: raw.site_id,
    customerId: raw.customer_id,
    subscriptionId: raw.subscription_id,
    stripeInvoiceId: raw.stripe_invoice_id,
    invoiceNumber: raw.invoice_number,
    amountDue: raw.amount_due,
    amountPaid: raw.amount_paid,
    currency: raw.currency,
    status: raw.status,
    invoicePdfUrl: raw.invoice_pdf_url,
    hostedInvoiceUrl: raw.hosted_invoice_url,
    periodStart: raw.period_start,
    periodEnd: raw.period_end,
    paidAt: raw.paid_at,
    metadata: raw.metadata || {},
    createdAt: raw.created_at,
  };
}

/**
 * Save an invoice. Upserts on stripe_invoice_id.
 */
export async function saveInvoice(
  config: StripeConfig,
  data: {
    stripeInvoiceId: string;
    customerId?: string;
    subscriptionId?: string;
    invoiceNumber?: string;
    amountDue?: number;
    amountPaid?: number;
    currency?: string;
    status?: string;
    invoicePdfUrl?: string;
    hostedInvoiceUrl?: string;
    periodStart?: string;
    periodEnd?: string;
    paidAt?: string;
    metadata?: Record<string, any>;
  },
): Promise<Invoice> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  const { data: result, error } = await supabase
    .from('invoices')
    .upsert(
      {
        site_id: siteId,
        customer_id: data.customerId || null,
        subscription_id: data.subscriptionId || null,
        stripe_invoice_id: data.stripeInvoiceId,
        invoice_number: data.invoiceNumber || null,
        amount_due: data.amountDue ?? null,
        amount_paid: data.amountPaid ?? null,
        currency: data.currency || null,
        status: data.status || null,
        invoice_pdf_url: data.invoicePdfUrl || null,
        hosted_invoice_url: data.hostedInvoiceUrl || null,
        period_start: data.periodStart || null,
        period_end: data.periodEnd || null,
        paid_at: data.paidAt || null,
        metadata: data.metadata || {},
      },
      { onConflict: 'stripe_invoice_id' },
    )
    .select('*')
    .single();

  if (error || !result) {
    throw new Error(`Failed to save invoice: ${error?.message}`);
  }

  return transformInvoice(result);
}

/**
 * Get all invoices for a customer email.
 */
export async function getInvoices(
  config: StripeConfig,
  email: string,
): Promise<Invoice[]> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  // Get customer ID first
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('site_id', siteId)
    .eq('email', email)
    .single();

  if (!customer) return [];

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('site_id', siteId)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  return (data || []).map(transformInvoice);
}

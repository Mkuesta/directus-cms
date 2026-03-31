import { createItem, readItems, updateItem } from '@directus/sdk';
import type {
  NewsletterConfig,
  DirectusSubscriber,
  Subscriber,
  SubscribeOptions,
  SubscribeResult,
} from './types';
import { checkHoneypot, checkRateLimit } from './spam-protection';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function transformSubscriber(raw: DirectusSubscriber): Subscriber {
  return {
    id: raw.id!,
    email: raw.email,
    name: raw.name ?? undefined,
    status: raw.status,
    source: raw.source ?? undefined,
    createdAt: raw.date_created ?? undefined,
    confirmedAt: raw.date_confirmed ?? undefined,
  };
}

export async function subscribe(
  config: NewsletterConfig,
  options: SubscribeOptions,
): Promise<SubscribeResult> {
  // Honeypot check
  if (!checkHoneypot(config, options.honeypotValue)) {
    return { success: false, error: 'spam_detected' };
  }

  // Rate limit check
  if (!checkRateLimit(config, options.ip)) {
    return { success: false, error: 'rate_limited' };
  }

  try {
    // Check for existing subscriber (scoped to site in multi-tenant)
    const existingFilter: Record<string, any> = { email: { _eq: options.email } };
    if (config.siteId != null) existingFilter.site = { _eq: config.siteId };

    const existing = await config.directus.request(
      readItems(config.collections.subscribers as any, {
        fields: ['id', 'email', 'status', 'name', 'source'],
        filter: existingFilter,
        limit: 1,
      } as any)
    ) as unknown as DirectusSubscriber[];

    if (existing.length > 0) {
      const sub = existing[0];

      if (sub.status === 'active') {
        return { success: false, error: 'already_subscribed' };
      }

      if (sub.status === 'pending') {
        // Already pending — don't rotate token, just return success
        return { success: true };
      }

      // Re-subscribe: only for 'unsubscribed' status
      const token = crypto.randomUUID();
      const useDoubleOptIn = config.doubleOptIn ?? true;
      await config.directus.request(
        updateItem(config.collections.subscribers as any, sub.id!, {
          status: useDoubleOptIn ? 'pending' : 'active',
          token,
          name: options.name ?? sub.name,
          source: options.source ?? sub.source,
          ip: options.ip,
          date_confirmed: useDoubleOptIn ? null : new Date().toISOString(),
        } as any)
      );

      if (useDoubleOptIn && config.emailClient && config.confirmationUrl) {
        await sendConfirmationEmail(config, options.email, token, options.name);
      }

      return { success: true };
    }

    // Create new subscriber
    const token = crypto.randomUUID();
    const useDoubleOptIn = config.doubleOptIn ?? true;

    const subscriber: Omit<DirectusSubscriber, 'id' | 'date_created'> = {
      email: options.email,
      name: options.name ?? null,
      status: useDoubleOptIn ? 'pending' : 'active',
      token,
      source: options.source ?? null,
      ip: options.ip ?? null,
      site: config.siteId ?? null,
      site_name: config.siteName ?? null,
      date_confirmed: useDoubleOptIn ? null : new Date().toISOString(),
    };

    await config.directus.request(
      createItem(config.collections.subscribers as any, subscriber as any)
    );

    if (useDoubleOptIn && config.emailClient && config.confirmationUrl) {
      await sendConfirmationEmail(config, options.email, token, options.name);
    }

    return { success: true };
  } catch {
    return { success: false, error: 'subscription_failed' };
  }
}

async function sendConfirmationEmail(
  config: NewsletterConfig,
  email: string,
  token: string,
  name?: string,
): Promise<void> {
  if (!config.emailClient || !config.confirmationUrl) return;

  const url = new URL(config.confirmationUrl);
  url.searchParams.set('action', 'confirm');
  url.searchParams.set('token', token);

  const siteName = config.siteName ?? 'Our Newsletter';
  const safeName = name ? escapeHtml(name) : '';
  const greeting = safeName ? `Hi ${safeName},` : 'Hi,';

  await config.emailClient.sendEmail({
    to: email,
    subject: `Confirm your subscription to ${siteName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Confirm your subscription</h2>
        <p>${greeting}</p>
        <p>Thank you for subscribing to <strong>${escapeHtml(siteName)}</strong>. Please confirm your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${url.toString()}" style="background-color: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">Confirm Subscription</a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this subscription, you can safely ignore this email.</p>
      </div>
    `,
    text: `${name ? `Hi ${name},` : 'Hi,'}\n\nConfirm your subscription to ${siteName}: ${url.toString()}\n\nIf you didn't request this, you can safely ignore this email.`,
  });
}

export async function confirmSubscription(
  config: NewsletterConfig,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const confirmFilter: Record<string, any> = {
      token: { _eq: token },
      status: { _eq: 'pending' },
    };
    if (config.siteId != null) confirmFilter.site = { _eq: config.siteId };

    const items = await config.directus.request(
      readItems(config.collections.subscribers as any, {
        fields: ['id', 'email', 'status', 'token'],
        filter: confirmFilter,
        limit: 1,
      } as any)
    ) as unknown as DirectusSubscriber[];

    if (items.length === 0) {
      return { success: false, error: 'Invalid or expired confirmation token' };
    }

    const sub = items[0];

    // Confirm and clear token to prevent replay
    await config.directus.request(
      updateItem(config.collections.subscribers as any, sub.id!, {
        status: 'active',
        token: null,
        date_confirmed: new Date().toISOString(),
      } as any)
    );

    return { success: true };
  } catch {
    return { success: false, error: 'Confirmation failed' };
  }
}

export async function unsubscribe(
  config: NewsletterConfig,
  email: string,
  token?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const unsubFilter: Record<string, any> = { email: { _eq: email } };
    if (config.siteId != null) unsubFilter.site = { _eq: config.siteId };

    const items = await config.directus.request(
      readItems(config.collections.subscribers as any, {
        fields: ['id', 'email', 'status', 'token'],
        filter: unsubFilter,
        limit: 1,
      } as any)
    ) as unknown as DirectusSubscriber[];

    // Always return success to prevent email enumeration
    if (items.length === 0) {
      return { success: true };
    }

    const sub = items[0];

    // SECURITY: Verify token matches subscriber's stored token
    if (token && sub.token && sub.token !== token) {
      return { success: true }; // Silent fail to prevent enumeration
    }

    if (sub.status === 'unsubscribed') {
      return { success: true };
    }

    await config.directus.request(
      updateItem(config.collections.subscribers as any, sub.id!, {
        status: 'unsubscribed',
      } as any)
    );

    return { success: true };
  } catch {
    return { success: false, error: 'Unsubscribe failed' };
  }
}

export async function getSubscribers(
  config: NewsletterConfig,
  options?: { status?: string; limit?: number },
): Promise<Subscriber[]> {
  const filter: Record<string, any> = {};
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }
  if (options?.status) {
    filter.status = { _eq: options.status };
  }

  const items = await config.directus.request(
    readItems(config.collections.subscribers as any, {
      fields: [
        'id',
        'email',
        'name',
        'status',
        'source',
        'site',
        'date_created',
        'date_confirmed',
      ],
      filter,
      sort: ['-date_created'],
      limit: options?.limit ?? 100,
    } as any)
  ) as unknown as DirectusSubscriber[];

  return items.map(transformSubscriber);
}

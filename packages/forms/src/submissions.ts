import { createItem, readItems } from '@directus/sdk';
import type {
  FormConfig,
  DirectusFormSubmission,
  FormSubmission,
  SubmitFormOptions,
  SubmitResult,
} from './types';
import { checkHoneypot, checkRateLimit } from './spam-protection';

function transformSubmission(raw: DirectusFormSubmission): FormSubmission {
  return {
    id: raw.id!,
    form: raw.form,
    data: raw.data,
    ip: raw.ip,
    userAgent: raw.user_agent,
    referrer: raw.referrer,
    status: raw.status,
    createdAt: raw.date_created,
  };
}

export async function submitForm(
  config: FormConfig,
  options: SubmitFormOptions,
): Promise<SubmitResult> {
  // Honeypot check
  if (!checkHoneypot(config, options.honeypotValue)) {
    return { success: false, error: 'spam_detected' };
  }

  // Rate limit check
  if (!checkRateLimit(config, options.ip)) {
    return { success: false, error: 'rate_limited' };
  }

  try {
    const submission: Omit<DirectusFormSubmission, 'id' | 'date_created'> = {
      form: options.form,
      data: options.data,
      ip: options.ip,
      user_agent: options.userAgent,
      referrer: options.referrer,
      site: config.siteId ?? null,
      site_name: config.siteName,
      status: 'new',
    };

    await config.directus.request(
      createItem(config.collections.submissions as any, submission as any)
    );

    // Fire-and-forget email notification
    if (config.notifications?.sendNotification) {
      config.notifications.sendNotification({
        form: options.form,
        data: options.data,
        notifyEmails: config.notifications.notifyEmails,
      }).catch(() => {});
    }

    return { success: true };
  } catch {
    return { success: false, error: 'submission_failed' };
  }
}

export async function getSubmissions(
  config: FormConfig,
  form: string,
  options?: { status?: string; limit?: number },
): Promise<FormSubmission[]> {
  const filter: Record<string, any> = { form: { _eq: form } };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }
  if (options?.status) {
    filter.status = { _eq: options.status };
  }

  const items = await config.directus.request(
    readItems(config.collections.submissions as any, {
      fields: [
        'id',
        'form',
        'data',
        'ip',
        'user_agent',
        'referrer',
        'site',
        'site_name',
        'status',
        'date_created',
      ],
      filter,
      sort: ['-date_created'],
      limit: options?.limit ?? 100,
    } as any)
  ) as unknown as DirectusFormSubmission[];

  return items.map(transformSubmission);
}

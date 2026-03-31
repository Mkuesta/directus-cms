import { readItems } from '@directus/sdk';
import type { EmailConfig, DirectusEmailTemplate, EmailTemplate } from './types.js';

const _cache = new WeakMap<object, { data: Map<string, EmailTemplate>; ts: number }>();
const CACHE_TTL = 60_000;

function getCached(config: EmailConfig): Map<string, EmailTemplate> | null {
  const entry = _cache.get(config.directus);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(config: EmailConfig, data: Map<string, EmailTemplate>): void {
  _cache.set(config.directus, { data, ts: Date.now() });
}

function transformTemplate(raw: DirectusEmailTemplate): EmailTemplate {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    subject: raw.subject,
    htmlBody: raw.html_body,
    textBody: raw.text_body || undefined,
    variables: raw.variables || [],
    status: raw.status,
    createdAt: raw.date_created || undefined,
    updatedAt: raw.date_updated || undefined,
  };
}

export async function getEmailTemplates(config: EmailConfig): Promise<EmailTemplate[]> {
  const cached = getCached(config);
  if (cached) return Array.from(cached.values());

  const filter: Record<string, any> = { status: { _eq: 'active' } };
  if (config.siteId) filter.site = { _eq: config.siteId };

  const items = await config.directus.request(
    readItems(config.collections.templates, {
      filter,
      fields: ['id', 'slug', 'name', 'subject', 'html_body', 'text_body', 'variables', 'status', 'date_created', 'date_updated'],
      limit: -1,
    }),
  ) as DirectusEmailTemplate[];

  const templates = items.map(transformTemplate);
  const map = new Map(templates.map((t) => [t.slug, t]));
  setCache(config, map);
  return templates;
}

export async function getEmailTemplate(config: EmailConfig, slug: string): Promise<EmailTemplate | null> {
  const cached = getCached(config);
  if (cached) return cached.get(slug) || null;

  // Fetch all to populate cache
  const templates = await getEmailTemplates(config);
  return templates.find((t) => t.slug === slug) || null;
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

export function renderTemplate(template: EmailTemplate, variables: Record<string, string>): { subject: string; html: string; text?: string } {
  const render = (str: string) =>
    Object.entries(variables).reduce(
      (result, [key, value]) => result.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g'), escapeHtml(value)),
      str,
    );

  return {
    subject: render(template.subject),
    html: render(template.htmlBody),
    text: template.textBody ? render(template.textBody) : undefined,
  };
}

import type { FormConfig, SubmitFormOptions } from './types';
import { submitForm } from './submissions';

/**
 * Creates a Next.js API route handler for form submissions.
 *
 * Usage:
 *   // app/api/forms/route.ts
 *   import { formClient } from '@/lib/forms';
 *   const handler = formClient.createApiHandler();
 *   export const POST = handler;
 */
export function createApiHandler(config: FormConfig) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();

      const { form, data, referrer, ...rest } = body as Record<string, any>;

      if (!form || typeof form !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing form identifier' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!data || typeof data !== 'object') {
        return new Response(JSON.stringify({ error: 'Missing form data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const honeypotField = config.honeypotField ?? '_hp_field';

      const options: SubmitFormOptions = {
        form,
        data,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? request.headers.get('x-real-ip')
          ?? undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
        referrer: referrer ?? request.headers.get('referer') ?? undefined,
        honeypotValue: rest[honeypotField] ?? data[honeypotField],
      };

      const result = await submitForm(config, options);

      if (!result.success) {
        const statusCode = result.error === 'rate_limited' ? 429 : 400;
        return new Response(JSON.stringify(result), {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

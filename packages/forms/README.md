# @directus-cms/forms

Form submissions and lead capture for Directus CMS-powered Next.js sites. Saves form data to a Directus collection with built-in honeypot spam protection, rate limiting, and a ready-made Next.js API route handler.

Data only — no UI components or styling.

## Prerequisites

- A Directus instance with a form submissions collection set up
- `@directus/sdk` installed in your site
- A Directus token with **write access** to the submissions collection

## Installation

```bash
npm install ../../directus-cms-forms --legacy-peer-deps
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@directus-cms/forms": "file:../../directus-cms-forms"
  }
}
```

## Setup

### 1. Directus Collection

Create a `form_submissions` collection (or `{prefix}_form_submissions`) in Directus:

| Field | Type | Description |
|-------|------|-------------|
| `form` | String | Form identifier (e.g. `"contact"`, `"newsletter"`) |
| `data` | JSON | Form field data |
| `ip` | String | Visitor IP address |
| `user_agent` | String | Visitor user agent |
| `referrer` | String | Page referrer URL |
| `site` | Integer | Multi-tenant site ID (optional) |
| `site_name` | String | Site name (optional) |
| `status` | Dropdown | `new`, `read`, `archived`, `spam` |
| `date_created` | DateTime (auto) | Submission timestamp |

**Directus permissions:** The token needs `create` access on this collection. For reading submissions (admin), it also needs `read` access.

### 2. Form Config

Create `lib/forms.ts` in your site:

```ts
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createFormClient } from '@directus-cms/forms';

const COLLECTION_PREFIX = 'stopabo_de';

export const forms = createFormClient({
  directus: createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
    .with(rest()),
  collections: {
    submissions: `${COLLECTION_PREFIX}_form_submissions`,
  },
  siteId: 4,           // optional
  siteName: 'StopAbo',  // optional
});
```

### 3. API Route

**`app/api/forms/route.ts`**

```ts
import { forms } from '@/lib/forms';

const handler = forms.createApiHandler();

export const POST = handler;
```

### 4. Frontend Form

Call the API from your form component:

```tsx
'use client';

import { useState } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form: 'contact',
        data: {
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
        },
        _hp_field: formData.get('_hp_field'), // honeypot
      }),
    });

    setStatus(res.ok ? 'sent' : 'error');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />

      {/* Honeypot — hidden from real users */}
      <input name="_hp_field" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send'}
      </button>

      {status === 'sent' && <p>Thank you! We'll be in touch.</p>}
      {status === 'error' && <p>Something went wrong. Please try again.</p>}
    </form>
  );
}
```

## Usage

### Submit a Form (Server-Side)

```ts
const result = await forms.submitForm({
  form: 'contact',
  data: { name: 'John', email: 'john@example.com', message: 'Hello!' },
  ip: '1.2.3.4',
  userAgent: 'Mozilla/5.0...',
});
// → { success: true }
// or { success: false, error: 'spam_detected' | 'rate_limited' | 'submission_failed' }
```

### Multiple Form Types

Use different `form` identifiers for different forms:

```ts
// Contact form
await forms.submitForm({ form: 'contact', data: { name, email, message } });

// Newsletter signup
await forms.submitForm({ form: 'newsletter', data: { email } });

// Lead capture
await forms.submitForm({ form: 'lead', data: { name, email, company, phone } });

// Quote request
await forms.submitForm({ form: 'quote', data: { service, budget, timeline } });
```

All submissions go to the same Directus collection, filtered by the `form` field.

### Read Submissions (Admin)

```ts
// Get all contact form submissions
const submissions = await forms.getSubmissions('contact');

// Filter by status
const unread = await forms.getSubmissions('contact', { status: 'new' });

// Limit results
const recent = await forms.getSubmissions('newsletter', { limit: 10 });
```

## Spam Protection

### Honeypot

Enabled by default. Add a hidden field to your form that bots will fill in but humans won't:

```html
<input name="_hp_field" style="display: none" tabIndex={-1} autoComplete="off" />
```

If the field has a value, the submission is rejected with `{ error: 'spam_detected' }`.

Customize the field name:

```ts
const forms = createFormClient({
  // ...
  honeypotField: '_my_trap',
});
```

Disable honeypot:

```ts
const forms = createFormClient({
  // ...
  honeypotEnabled: false,
});
```

### Rate Limiting

In-memory rate limiting per IP address. Default: 5 submissions per minute.

```ts
const forms = createFormClient({
  // ...
  rateLimit: 3,              // max 3 submissions
  rateLimitWindow: 120_000,  // per 2 minutes
});
```

Returns `{ error: 'rate_limited' }` with HTTP 429 when exceeded.

## Config Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `directus` | `RestClient` | *required* | Directus SDK client with write access |
| `collections.submissions` | `string` | *required* | Submissions collection name |
| `siteId` | `number` | — | Multi-tenant site ID |
| `siteName` | `string` | — | Site name (stored with submissions) |
| `honeypotEnabled` | `boolean` | `true` | Enable honeypot spam check |
| `honeypotField` | `string` | `"_hp_field"` | Honeypot field name |
| `rateLimit` | `number` | `5` | Max submissions per IP per window |
| `rateLimitWindow` | `number` | `60000` | Rate limit window (ms) |

## API Reference

### `createFormClient(config: FormConfig): FormClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `submitForm(options)` | `Promise<SubmitResult>` | Submit a form entry |
| `getSubmissions(form, options?)` | `Promise<FormSubmission[]>` | Get submissions for a form |
| `createApiHandler()` | `(request: Request) => Promise<Response>` | Next.js API route handler |

### API Route Handler

The handler created by `createApiHandler()` expects a POST request with JSON body:

```json
{
  "form": "contact",
  "data": { "name": "John", "email": "john@example.com" },
  "_hp_field": "",
  "referrer": "https://stopabo.de/contact"
}
```

**Responses:**

| Status | Body | Meaning |
|--------|------|---------|
| 200 | `{ "success": true }` | Submitted |
| 400 | `{ "success": false, "error": "spam_detected" }` | Honeypot triggered |
| 429 | `{ "success": false, "error": "rate_limited" }` | Too many submissions |
| 400 | `{ "error": "Missing form identifier" }` | Missing `form` field |
| 400 | `{ "error": "Missing form data" }` | Missing `data` field |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl` |
| `collections.submissions` | `"stopabo_de_form_submissions"` |
| `siteName` | `"StopAbo"`, `"Falwo"` |
| `siteId` | `4`, `7` (or omit for single-tenant) |

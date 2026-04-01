# Payload CMS Integration Guide for Our Next.js + Supabase Platform

## Overview
This document provides clear instructions for implementing **Payload CMS** as the content and product management system for our existing **Next.js + Supabase** application.  
The CMS must support:

- Blogging with scheduling  
- Product pages (CV templates)  
- Categories & tags  
- Stripe + PayPal payments  
- Digital file delivery via Supabase Storage  
- Auto‑generated product pages (like Vorlagen.de)  
- SEO fields  
- CMS admin dashboard for non‑technical users  

---

# 1. Project Architecture

```
Next.js (frontend)
   |
   |— Fetch pages, products, blogs from Payload API
   |
Payload CMS (self‑hosted, inside same repository)
   |
Supabase (PostgreSQL database + storage)
   |
Stripe + PayPal (payments)
```

### Key Principles
- **Next.js** handles all UI, layouts, templates.
- **Payload CMS** stores all editable content (blogs, products, SEO, categories).
- **Supabase** is used as the underlying PostgreSQL database + storage for digital assets.
- **Stripe/PayPal** handle checkout and payment confirmation.
- **Automatic static page generation** in Next.js for SEO.

---

# 2. Setup Instructions

## 2.1 Install Payload CMS in the Existing Project
Developer must install Payload CMS inside the Next.js repository:

```bash
npx create-payload-app
```

Choose:
- **Next.js template**  
- **PostgreSQL** as database  
- Configure it to use our **Supabase PostgreSQL connection string**.

Payload will generate:

```
/payload
  /collections
  payload.config.ts
```

---

# 3. Database Configuration (Supabase)

### Requirements:
- Supabase project must provide:
  - PostgreSQL connection URI  
  - Supabase Storage bucket for CV/file uploads  
  - Auth (if we later add user accounts)

### Developer tasks:
1. Create a dedicated **storage bucket** named `cv-templates`  
2. Configure **RLS policies** so only authorized purchases can download files  
3. Provide Supabase PG connection URI to Payload

---

# 4. Payload Collections to Implement

## 4.1 **Products** (CV Templates)
Fields:

- `title` (text)
- `slug` (text, unique)
- `description` (rich text)
- `shortDescription` (text)
- `price` (number)
- `category` (relationship → Categories)
- `tags` (relationship → Tags)
- `previewImages` (array → upload images)
- `file` (upload → Supabase storage or local)
- `features` (array of text)
- `relatedProducts` (relationship)
- `seo` (group: title, description, canonical, ogImage)
- `publishAt` (date for scheduling)
- `status` (draft/published)

**Auto‑populate product page using Next.js dynamic route:**

```
/products/[slug]
```

---

## 4.2 **Categories**

Fields:
- `name`
- `slug`
- `description`
- `image` (optional)

Used for filtering + landing pages like Vorlagen.de.

---

## 4.3 **Tags**

Fields:
- `name`
- `slug`

Used for filtering.

---

## 4.4 **Blog Posts**

Fields:
- `title`
- `slug`
- `coverImage`
- `content` (rich text blocks)
- `category` (optional)
- `tags`
- `seo` (group)
- `publishAt` (schedule)
- `status` (draft/published)

Next.js route:

```
/blog/[slug]
```

Blogs must support:
✔ Scheduling  
✔ SEO  
✔ Rich text  

---

## 4.5 **Pages (Optional)**

Editable static pages such as:
- About
- Terms
- Privacy

Fields:
- `title`
- `slug`
- `contentBlocks`
- `seo` group

Next.js dynamic route:

```
/[slug]
```

---

## 4.6 **Global Settings (Header/Footer)**

Payload `globals`:

### Global: Header
- navigation links (array)
- logo

### Global: Footer
- navigation columns
- social links
- legal text

Next.js fetches these once and renders globally.

---

# 5. Frontend Implementation (Next.js)

## 5.1 Product Page Template
One dynamic template at:

```
/app/products/[slug]/page.tsx
```

Developer uses:

```ts
const product = await payload.find({
  collection: 'products',
  where: { slug: { equals: params.slug } }
});
```

This template handles:
- Title  
- Gallery  
- Features  
- Description  
- Price  
- Add‑to‑cart buttons  
- Related products  

Just like Vorlagen.de.

---

## 5.2 Blog Template

```
/app/blog/[slug]/page.tsx
```

Uses static generation + on‑demand revalidation.

---

## 5.3 Category Pages

```
/app/category/[slug]/page.tsx
```

Filters products via category relationship.

---

# 6. Payments Integration

## 6.1 Stripe Checkout

Flow:
1. User clicks “Buy template”
2. Next.js sends product ID + price to a serverless function
3. Serverless function creates Stripe Checkout Session
4. After payment, Stripe webhook notifies backend
5. Backend grants access to the digital file (Supabase signed URL)

Developer must implement:

- `/api/checkout/session`
- `/api/stripe/webhook`

---

## 6.2 PayPal Integration
Optional but required:

- Use PayPal REST API
- Mirror Stripe logic:
  - Create order
  - Handle payment success callback
  - Grant file access in Supabase

---

# 7. Digital File Delivery (CV Templates)

Files stored in Supabase storage:

```
cv-templates/<slug>/<file>
```

Developer must:
- Generate **signed URLs** for secure downloads
- Only allow download after purchase

---

# 8. SEO Implementation

Every collection with `seo` group must include:

- `metaTitle`
- `metaDescription`
- `canonicalURL`
- `openGraphImage`

Next.js uses these fields to generate:

```ts
export const metadata = { ... }
```

---

# 9. Scheduling Blog Posts

Blog posts and products have:

- `status` (draft/published)
- `publishAt` (datetime)

Payload automatically:

- Hides posts until publishAt
- Shows “Scheduled” status in admin
- Works with static regeneration

Developer must implement:
- Payload access control: only return published posts
- Revalidation webhook

---

# 10. Deployment Instructions

### Developer must deploy:
- Next.js frontend + Payload CMS (same repo) → Vercel or server
- Supabase → managed
- Stripe → dashboard setup
- PayPal → dashboard setup

---

# 11. Summary Checklist for Developer

### CMS Setup
- [ ] Install Payload CMS in Next.js repo
- [ ] Connect Payload to Supabase PostgreSQL
- [ ] Configure Supabase Storage bucket
- [ ] Implement collections (Products, Categories, Tags, Blog, Pages)
- [ ] Implement globals (Header, Footer)
- [ ] Add SEO fields to all relevant collections
- [ ] Add schedules (publishAt)

### Frontend
- [ ] Build dynamic product page template
- [ ] Build blog page template
- [ ] Build category pages
- [ ] Implement global nav + footer
- [ ] Implement static generation + revalidation

### Payments
- [ ] Integrate Stripe Checkout
- [ ] Create Stripe webhook
- [ ] Grant Supabase file access after payment
- [ ] Implement PayPal as alternative

---

# 12. Final Notes

Payload CMS + Supabase + Next.js gives you:

- Full CMS without Strapi complexity  
- WooCommerce-style product management  
- SEO + blog + scheduling  
- Dynamic product pages for 200+ CV templates  
- Secure digital downloads  
- Payment integrations  
- User-friendly admin panel  

This setup is powerful, scalable, and ideal for a non-technical content manager.


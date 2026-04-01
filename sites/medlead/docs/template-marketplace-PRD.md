# Product Requirements Document (PRD)
## Template Marketplace E-Commerce Platform

**Version:** 1.0  
**Date:** November 28, 2025  
**Project Type:** B2C E-Commerce Platform for Digital Templates  
**Tech Stack:** Next.js 14+, Supabase, Payload CMS, Tailwind CSS, shadcn/ui, Stripe, PayPal

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Audience](#3-target-audience)
4. [Feature Requirements](#4-feature-requirements)
5. [Technical Architecture](#5-technical-architecture)
6. [User Flows](#6-user-flows)
7. [Database Schema](#7-database-schema)
8. [API Specifications](#8-api-specifications)
9. [UI/UX Requirements](#9-uiux-requirements)
10. [Security & Compliance](#10-security--compliance)
11. [Performance Requirements](#11-performance-requirements)
12. [Development Phases](#12-development-phases)
13. [Success Metrics](#13-success-metrics)

---

## 1. Executive Summary

### 1.1 Project Overview
Build a modern, high-performance e-commerce platform for selling downloadable digital templates (CV/resume templates, business documents, presentations, etc.) similar to vorlagen.de. The platform will feature a content management system, automated product page generation, payment processing, and secure digital delivery.

### 1.2 Core Value Proposition
- **For Customers:** Easy discovery and instant download of professional, ready-to-use templates
- **For Business:** Automated, scalable digital product delivery with minimal operational overhead
- **For Content Managers:** User-friendly CMS for managing products, content, and SEO without technical knowledge

### 1.3 Key Differentiators
- Lightning-fast page loads with Next.js App Router
- SEO-optimized product pages for organic discovery
- Secure, automated digital delivery system
- Flexible payment options (Stripe + PayPal)
- Rich blogging platform for content marketing
- Modern, accessible UI with Tailwind + shadcn/ui

---

## 2. Product Vision & Goals

### 2.1 Vision Statement
Create the most user-friendly marketplace for professional templates that empowers individuals and businesses to create stunning documents effortlessly.

### 2.2 Business Goals
- **Launch Goal:** 200+ templates available at launch
- **Revenue Target:** Generate consistent revenue through digital product sales
- **Traffic Goal:** Achieve high organic search rankings for template-related keywords
- **Conversion Goal:** 3-5% conversion rate from visitors to customers
- **Customer Satisfaction:** 4.5+ star average rating

### 2.3 User Goals
- **Customers:** Find, preview, purchase, and download templates in under 3 minutes
- **Content Managers:** Add new products and blog posts without developer assistance
- **Administrators:** Monitor sales, manage inventory, and handle customer issues efficiently

---

## 3. Target Audience

### 3.1 Primary Users

#### Customers (End Users)
- **Job Seekers:** Age 22-45, looking for professional CV/resume templates
- **Small Business Owners:** Need business documents, invoices, proposals
- **Students:** Require presentation templates, report formats
- **Freelancers:** Looking for professional document templates
- **Technical Proficiency:** Low to medium; expect simple, intuitive experience

#### Content Managers
- **Role:** Marketing team, content creators
- **Technical Proficiency:** Non-technical users
- **Needs:** Easy product upload, SEO management, blog publishing

#### Administrators
- **Role:** Business owners, e-commerce managers
- **Technical Proficiency:** Medium
- **Needs:** Sales analytics, order management, customer support tools

### 3.2 User Personas

**Persona 1: Sarah - The Job Seeker**
- Age: 28
- Goal: Find a professional CV template quickly
- Pain Points: Limited time, overwhelmed by options, needs mobile-friendly experience
- Success Criteria: Find, purchase, and download template in under 5 minutes

**Persona 2: Marcus - The Small Business Owner**
- Age: 35
- Goal: Professional invoice and proposal templates
- Pain Points: Needs multiple templates, wants bulk purchase options
- Success Criteria: Easy filtering by category, clear preview, flexible payment options

**Persona 3: Lisa - The Content Manager**
- Age: 32
- Goal: Manage product catalog and publish SEO-optimized blog posts
- Pain Points: Not technical, needs visual editor, wants scheduling capabilities
- Success Criteria: Add products without developer help, schedule posts, see analytics

---

## 4. Feature Requirements

### 4.1 Core Features (MVP - Phase 1)

#### 4.1.1 Product Catalog System
**Priority:** P0 (Critical)

**Capabilities:**
- Display 200+ templates organized by categories
- Each product page includes:
  - High-quality preview images (3-5 images per product)
  - Detailed description (rich text)
  - Feature list (bullet points)
  - File format information
  - Pricing
  - "Add to Cart" / "Buy Now" buttons
  - Related products section
  - Customer reviews section
- Dynamic URL structure: `/products/[category]/[slug]`
- Breadcrumb navigation
- Product schema markup for SEO

**Technical Requirements:**
- Static site generation (SSG) for all product pages
- Image optimization with Next.js Image component
- Lazy loading for images
- On-demand revalidation when products update

---

#### 4.1.2 Search & Filter System
**Priority:** P0 (Critical)

**Search Features:**
- Global search bar in header
- Autocomplete suggestions
- Search by: title, category, tags, keywords
- Search results page with filters
- Recent searches (client-side storage)

**Filter Options:**
- **By Category:** CV Templates, Business Documents, Presentations, etc.
- **By Price:** Free, Under $10, $10-$20, $20+
- **By Format:** Word, PowerPoint, Google Docs, PDF
- **By Style:** Modern, Classic, Creative, Professional
- **By Color:** Predefined color schemes
- **By Rating:** 4+ stars, 3+ stars
- **Sort Options:** Relevance, Newest, Price (Low to High), Price (High to Low), Most Popular

**Technical Implementation:**
- Client-side filtering for better performance
- URL parameters for shareable filter states
- Instant filter updates (no page reload)
- Filter count badges

---

#### 4.1.3 Shopping Cart & Checkout
**Priority:** P0 (Critical)

**Cart Features:**
- Persistent cart (local storage + database sync for logged-in users)
- Cart icon with item count in header
- Add/remove items
- Update quantities (for bundle deals)
- Apply discount codes
- View cart summary (subtotal, tax if applicable, total)
- Cart drawer for quick view
- Mini cart preview on hover

**Checkout Flow:**
1. **Cart Review:** View all items, edit quantities
2. **Customer Information:** Email, name (required for receipt)
3. **Payment Method Selection:** Stripe or PayPal
4. **Payment Processing:** Secure payment via chosen gateway
5. **Order Confirmation:** Order number, download links
6. **Email Confirmation:** Receipt + download links

**Guest Checkout:**
- Allow purchases without account creation
- Email required for receipt and download link
- Option to create account after purchase

**Payment Integration:**
- **Stripe Checkout:** Primary payment method
  - Credit/debit cards
  - Apple Pay / Google Pay
  - Afterpay/Klarna (if applicable)
- **PayPal:** Alternative payment method
  - PayPal account
  - PayPal Credit

**Technical Requirements:**
- Stripe API integration with webhook handling
- PayPal REST API integration
- PCI compliance through hosted checkout
- Order confirmation page: `/order-confirmation/[orderId]`
- Secure session management
- Transaction logging for reconciliation

---

#### 4.1.4 Digital File Delivery System
**Priority:** P0 (Critical)

**Download Mechanism:**
- **Immediate Access:** Downloads available immediately after payment confirmation
- **Secure Links:** Time-limited, signed URLs (valid for 24-48 hours)
- **Download Limits:** 5 downloads per purchase (configurable)
- **File Storage:** Supabase Storage with private buckets
- **File Organization:** 
  ```
  /templates
    /cv-templates
      /modern-cv-template
        - template.docx
        - template.pptx
        - preview.jpg
    /business-documents
      /invoice-template
        - invoice.xlsx
  ```

**Download Experience:**
- **Download Page:** `/downloads/[orderId]` or `/downloads/[token]`
- List all purchased items
- Download buttons for each file
- Re-download capability
- Download status indicators
- ZIP option for multiple files

**Security Measures:**
- Row-level security (RLS) in Supabase
- Verify purchase before generating download link
- Prevent unauthorized access
- Watermark detection on free previews
- DMCA protection notice

**Technical Implementation:**
```typescript
// Supabase Storage structure
- Bucket: 'templates' (private)
- RLS policies to restrict access
- Signed URL generation with expiration
- Download tracking in database
```

---

#### 4.1.5 User Authentication System (Optional for MVP)
**Priority:** P1 (High)

**Features:**
- Email/password authentication
- Social login (Google, Facebook optional)
- Password reset flow
- Email verification
- User dashboard:
  - Order history
  - Download access to past purchases
  - Profile management
  - Wishlist (Phase 2)

**Implementation:**
- Supabase Auth for authentication
- Protected routes with middleware
- Session management
- Remember me functionality

---

#### 4.1.6 Category & Tag System
**Priority:** P0 (Critical)

**Category Pages:**
- URL structure: `/category/[slug]`
- Display all products in category
- Category description at top
- Breadcrumb: Home > Category
- Filter sidebar specific to category
- SEO-optimized with category schema markup

**Categories (Initial Set):**
1. CV & Resume Templates
2. Cover Letter Templates
3. Business Documents
4. Invoice Templates
5. Presentation Templates
6. Report Templates
7. Proposal Templates
8. Planner & Organizer Templates

**Tag System:**
- Multiple tags per product
- Tag pages: `/tag/[slug]`
- Tag cloud widget
- Related tags suggestions

**Technical Requirements:**
- Many-to-many relationships (Products ↔ Tags)
- One-to-many relationships (Categories ↔ Products)
- Tag-based filtering
- Category hierarchy support (parent/child categories)

---

#### 4.1.7 Blog & Content Marketing
**Priority:** P1 (High)

**Blog Features:**
- Rich text editor in CMS (Payload)
- Blog post pages: `/blog/[slug]`
- Blog listing page: `/blog`
- Author profiles
- Categories for blog posts
- Tags for blog posts
- Featured image
- Estimated reading time
- Social sharing buttons
- Related posts
- Comment section (optional - can use Disqus or similar)

**Content Types:**
- **How-to Guides:** "How to Create a Professional CV"
- **Industry Tips:** "Top 10 Resume Mistakes to Avoid"
- **Product Showcases:** "Best CV Templates for 2025"
- **Customer Stories:** Case studies and testimonials
- **SEO Content:** Target long-tail keywords

**Publishing Features:**
- Draft/Published status
- Scheduled publishing
- SEO fields (meta title, description, keywords)
- Featured posts
- Blog categories
- Author bios

**Technical Requirements:**
- Static generation for published posts
- On-demand revalidation
- RSS feed
- Sitemap inclusion
- OpenGraph tags for social sharing

---

#### 4.1.8 SEO & Performance Optimization
**Priority:** P0 (Critical)

**On-Page SEO:**
- Dynamic meta tags (title, description, keywords)
- OpenGraph tags for social media
- Twitter Card tags
- Canonical URLs
- Structured data (JSON-LD):
  - Product schema
  - Organization schema
  - Breadcrumb schema
  - Review schema
  - Article schema (blog posts)
- Alt text for all images
- Semantic HTML structure
- Header hierarchy (H1, H2, H3)

**Technical SEO:**
- XML sitemap generation
- Robots.txt
- 301 redirects for changed URLs
- 404 error page with suggestions
- Mobile-responsive (mobile-first)
- Fast page load times (<3s)
- Core Web Vitals optimization:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1

**Performance Features:**
- Image optimization (WebP format, lazy loading)
- Code splitting
- Tree shaking
- Minification
- CDN for static assets
- Caching strategy
- Prefetching for links

---

#### 4.1.9 Email Notifications
**Priority:** P1 (High)

**Transactional Emails:**
1. **Order Confirmation**
   - Order number
   - Items purchased
   - Total amount
   - Download links
   - Receipt/Invoice (PDF attachment)

2. **Download Link Email**
   - Sent if user leaves checkout before downloading
   - Magic link to download page
   - Expires in 48 hours

3. **Account Creation**
   - Welcome message
   - Account verification link

4. **Password Reset**
   - Secure reset link
   - Expires in 1 hour

5. **Purchase Receipt**
   - For accounting purposes
   - Includes VAT/Tax information

**Email Service:**
- Use Resend, SendGrid, or Mailgun
- Branded email templates
- HTML + plain text versions
- Unsubscribe link (for marketing emails only)

**Marketing Emails (Phase 2):**
- New product announcements
- Special offers
- Abandoned cart recovery
- Product recommendations

---

#### 4.1.10 Admin Dashboard (Payload CMS)
**Priority:** P0 (Critical)

**Dashboard Features:**
- Sales overview (daily, weekly, monthly)
- Total revenue
- Number of orders
- Top-selling products
- Recent orders
- Low stock alerts (for physical products - not applicable initially)

**Product Management:**
- Add/edit/delete products
- Bulk upload (CSV import)
- Image management (upload, crop, optimize)
- Category assignment
- Tag management
- SEO field editor
- Publish/unpublish
- Product duplication
- Archive products

**Order Management:**
- View all orders
- Filter by: date, status, amount, customer
- Order details view
- Refund processing
- Download order reports (CSV/Excel)
- Customer contact information

**Content Management:**
- Blog post editor (rich text)
- Page builder for static pages (About, Terms, Privacy)
- Media library
- File manager
- SEO settings per page

**User Management:**
- View all users
- User roles (Admin, Editor, Customer)
- Permissions management
- Activity logs

**Settings:**
- Payment gateway configuration
- Email template customization
- Tax settings
- Currency settings
- Shipping settings (if physical products added later)
- SEO default settings
- Social media links
- Analytics integration (Google Analytics 4)

---

### 4.2 Advanced Features (Phase 2 & 3)

#### 4.2.1 User Accounts & Profiles
**Priority:** P2

- Purchase history
- Downloadable files library
- Wishlist
- Favorites
- Profile customization
- Email preferences
- Order tracking

---

#### 4.2.2 Review & Rating System
**Priority:** P2

- Star ratings (1-5 stars)
- Written reviews
- Verified purchase badge
- Helpful votes for reviews
- Review moderation
- Review schema markup
- Average rating display

---

#### 4.2.3 Wishlist & Favorites
**Priority:** P2

- Save products for later
- Share wishlist
- Email wishlist
- Move to cart

---

#### 4.2.4 Discount & Coupon System
**Priority:** P2

**Coupon Types:**
- Percentage off (10%, 20%, etc.)
- Fixed amount off ($5, $10, etc.)
- Free shipping (if applicable)
- Buy X Get Y free
- First-time customer discount
- Bundle discounts

**Coupon Management:**
- Create/edit/delete coupons
- Set expiration dates
- Usage limits (total uses, per user)
- Minimum purchase requirements
- Product/category restrictions
- Coupon codes (auto-generated or custom)

---

#### 4.2.5 Affiliate Program
**Priority:** P3

- Affiliate dashboard
- Unique referral links
- Commission tracking
- Payout management
- Affiliate analytics

---

#### 4.2.6 Advanced Analytics
**Priority:** P2

- Conversion funnel analysis
- Customer lifetime value
- Product performance metrics
- Traffic sources
- A/B testing results
- Heatmaps (Hotjar integration)
- Session recordings

---

#### 4.2.7 Multi-Language Support
**Priority:** P3

- English (default)
- German
- French
- Spanish
- Language switcher
- Translated URLs
- Localized pricing

---

#### 4.2.8 Subscription Model (Optional)
**Priority:** P3

- Monthly/annual subscriptions
- Access to premium templates
- Early access to new products
- Exclusive content
- Subscription management portal

---

## 5. Technical Architecture

### 5.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │   Tailwind   │  │   shadcn/ui  │     │
│  │  App Router  │  │     CSS      │  │  Components  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  • Server Components (RSC)                                  │
│  • Client Components (for interactivity)                    │
│  • API Routes (/app/api/*)                                  │
│  • Middleware (auth, redirects)                             │
│  • Image Optimization                                       │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Content Layer (CMS)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Payload CMS                        │  │
│  │  • Admin Dashboard (/payload)                        │  │
│  │  • Collections API                                   │  │
│  │  • Access Control                                    │  │
│  │  • Webhooks (revalidation)                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Supabase (PostgreSQL + Storage)              │  │
│  │  • PostgreSQL Database                               │  │
│  │  • Storage Buckets (templates, images)               │  │
│  │  • Row Level Security (RLS)                          │  │
│  │  • Real-time subscriptions (optional)                │  │
│  │  • Authentication                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Stripe  │  │  PayPal  │  │  Resend  │  │   CDN    │   │
│  │ Payments │  │ Payments │  │  Emails  │  │ (Vercel) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.2 Tech Stack Details

#### 5.2.1 Frontend
**Framework:** Next.js 14+ (App Router)
- **Why:** Server-side rendering, excellent SEO, API routes, image optimization, file-based routing
- **Rendering Strategy:**
  - **Static Generation (SSG):** Product pages, blog posts, category pages
  - **Server Components (RSC):** Default for data fetching
  - **Client Components:** Interactive elements (cart, filters, search)
  - **Incremental Static Regeneration (ISR):** Update static pages on-demand

**Styling:** Tailwind CSS
- **Why:** Utility-first, highly customizable, excellent performance, responsive design
- **Configuration:**
  - Custom color palette
  - Typography scale
  - Spacing system
  - Breakpoints
  - Dark mode support (optional)

**UI Components:** shadcn/ui
- **Why:** Accessible, customizable, built on Radix UI, copy-paste components
- **Components to Use:**
  - Button, Card, Dialog, Dropdown, Input, Select
  - Tabs, Toast, Tooltip, Badge
  - Sheet (for cart drawer), Command (for search)
  - Form components with react-hook-form

**State Management:**
- **React Context:** For cart, user session
- **Zustand (optional):** For complex client state
- **URL State:** For filters, search queries

**Forms:**
- **react-hook-form:** Form handling
- **zod:** Schema validation
- **Server Actions:** For form submissions

---

#### 5.2.2 Backend & CMS
**CMS:** Payload CMS 2.0+
- **Why:** Headless CMS, TypeScript-based, PostgreSQL support, flexible, extensible
- **Location:** Integrated in Next.js project at `/payload`
- **Admin UI:** Accessible at `/admin` or custom route
- **API:** RESTful + GraphQL support
- **Features Used:**
  - Collections (Products, Categories, Tags, Blog, Pages, Orders)
  - Globals (Header, Footer, Site Settings)
  - File uploads (with Supabase Storage adapter)
  - Access control & permissions
  - Hooks for custom logic
  - Webhooks for revalidation

**Database:** Supabase (PostgreSQL)
- **Why:** Open-source, PostgreSQL-based, real-time capabilities, storage, authentication
- **Connection:** Direct connection to Payload CMS
- **Features Used:**
  - PostgreSQL database for all data
  - Storage buckets for files
  - Row Level Security (RLS) for access control
  - Auth (optional for user accounts)
  - Real-time (Phase 2 - for notifications)

---

#### 5.2.3 Payments
**Primary:** Stripe
- **Integration:** Stripe Checkout (hosted)
- **Features:**
  - One-time payments
  - Multiple payment methods
  - Webhooks for order confirmation
  - Receipt generation
  - Refunds
  - Dispute handling
- **API:** Stripe Node.js SDK
- **Webhook Endpoint:** `/api/webhooks/stripe`

**Secondary:** PayPal
- **Integration:** PayPal Checkout SDK
- **Features:**
  - PayPal account payments
  - Guest checkout with card
  - Order confirmation webhooks
- **API:** PayPal REST API
- **Webhook Endpoint:** `/api/webhooks/paypal`

**Order Flow:**
```
1. User clicks "Checkout"
2. Cart data sent to API route
3. API creates Stripe/PayPal session
4. User redirected to payment gateway
5. User completes payment
6. Webhook received by server
7. Order created in database
8. Download links generated
9. Confirmation email sent
10. User redirected to download page
```

---

#### 5.2.4 Email
**Service:** Resend (recommended) or SendGrid
- **Why:** Modern, developer-friendly, React Email support
- **Templates:** Built with React Email
- **Types:**
  - Transactional (receipts, confirmations)
  - Marketing (newsletters - Phase 2)
- **Deliverability:** SPF, DKIM, DMARC configuration

---

#### 5.2.5 Deployment
**Platform:** Vercel (recommended)
- **Why:** Built for Next.js, edge functions, automatic deployments, preview URLs
- **Configuration:**
  - Environment variables
  - Custom domains
  - SSL certificates
  - Analytics integration
  - Image optimization
  - Edge middleware

**Alternative:** Railway, Render, or self-hosted VPS

**CI/CD:**
- GitHub integration
- Automatic deployments on push to main
- Preview deployments for PRs
- Environment-specific deployments (staging, production)

---

#### 5.2.6 Additional Services

**Analytics:**
- Google Analytics 4 (GA4)
- Vercel Analytics
- Plausible (privacy-focused alternative)

**Search (Phase 2):**
- Algolia or Meilisearch for advanced search
- Full-text search in PostgreSQL (initial implementation)

**Monitoring:**
- Sentry (error tracking)
- Vercel monitoring (performance)
- Uptime monitoring (UptimeRobot, Pingdom)

**CDN:**
- Vercel Edge Network (automatic)
- Cloudflare (if using custom deployment)

---

### 5.3 Project Structure

```
/project-root
│
├── /app                          # Next.js App Router
│   ├── /api                      # API routes
│   │   ├── /checkout
│   │   │   └── route.ts          # Create checkout session
│   │   ├── /webhooks
│   │   │   ├── /stripe
│   │   │   │   └── route.ts      # Stripe webhook handler
│   │   │   └── /paypal
│   │   │       └── route.ts      # PayPal webhook handler
│   │   ├── /download
│   │   │   └── /[token]
│   │   │       └── route.ts      # Generate download link
│   │   └── /revalidate
│   │       └── route.ts          # On-demand revalidation
│   │
│   ├── /(storefront)             # Main site route group
│   │   ├── /page.tsx             # Homepage
│   │   ├── /layout.tsx           # Root layout
│   │   ├── /products
│   │   │   ├── /page.tsx         # All products
│   │   │   └── /[slug]
│   │   │       └── page.tsx      # Product detail page
│   │   ├── /category
│   │   │   └── /[slug]
│   │   │       └── page.tsx      # Category page
│   │   ├── /blog
│   │   │   ├── /page.tsx         # Blog listing
│   │   │   └── /[slug]
│   │   │       └── page.tsx      # Blog post
│   │   ├── /cart
│   │   │   └── page.tsx          # Cart page
│   │   ├── /checkout
│   │   │   └── page.tsx          # Checkout page
│   │   ├── /order-confirmation
│   │   │   └── /[orderId]
│   │   │       └── page.tsx      # Order confirmation
│   │   ├── /downloads
│   │   │   └── /[token]
│   │   │       └── page.tsx      # Download page
│   │   └── /[slug]
│   │       └── page.tsx          # Dynamic pages (About, Terms, etc.)
│   │
│   └── /(dashboard)              # User dashboard (Phase 2)
│       └── /account
│           ├── /page.tsx         # Account overview
│           ├── /orders
│           │   └── page.tsx      # Order history
│           └── /downloads
│               └── page.tsx      # Download library
│
├── /payload                      # Payload CMS
│   ├── /collections
│   │   ├── Products.ts
│   │   ├── Categories.ts
│   │   ├── Tags.ts
│   │   ├── BlogPosts.ts
│   │   ├── Pages.ts
│   │   ├── Orders.ts
│   │   └── Users.ts
│   ├── /globals
│   │   ├── Header.ts
│   │   ├── Footer.ts
│   │   └── SiteSettings.ts
│   ├── /blocks                   # Reusable content blocks
│   ├── /hooks                    # Payload hooks
│   ├── /access                   # Access control functions
│   └── payload.config.ts         # Main config
│
├── /components                   # React components
│   ├── /ui                       # shadcn/ui components
│   ├── /layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── /product
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductGallery.tsx
│   │   └── ProductFilters.tsx
│   ├── /cart
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   └── /common
│       ├── SearchBar.tsx
│       ├── Breadcrumbs.tsx
│       └── LoadingSpinner.tsx
│
├── /lib                          # Utility functions
│   ├── /stripe
│   │   └── client.ts
│   ├── /paypal
│   │   └── client.ts
│   ├── /supabase
│   │   └── client.ts
│   ├── /email
│   │   └── client.ts
│   ├── utils.ts                  # General utilities
│   └── validations.ts            # Zod schemas
│
├── /hooks                        # Custom React hooks
│   ├── useCart.ts
│   ├── useCheckout.ts
│   └── useProduct.ts
│
├── /styles
│   └── globals.css               # Global styles
│
├── /public
│   ├── /images
│   └── /fonts
│
├── /emails                       # React Email templates
│   ├── OrderConfirmation.tsx
│   ├── DownloadLinks.tsx
│   └── WelcomeEmail.tsx
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local                    # Environment variables
└── README.md
```

---

## 6. User Flows

### 6.1 Customer Purchase Flow

```
START → Homepage
  ↓
[Browse Products]
  ↓
View Category or Search
  ↓
[Product Listing Page]
  ↓
Click Product
  ↓
[Product Detail Page]
  • View images
  • Read description
  • Check features
  • See price
  ↓
Click "Add to Cart" OR "Buy Now"
  ↓
[Cart Page/Drawer]
  • Review items
  • Apply coupon (optional)
  • View total
  ↓
Click "Checkout"
  ↓
[Checkout Page]
  • Enter email
  • Enter name
  • Choose payment method (Stripe/PayPal)
  ↓
Click "Complete Payment"
  ↓
[Payment Gateway]
  • Enter payment details
  • Complete payment
  ↓
Payment Success
  ↓
[Order Confirmation Page]
  • Order number displayed
  • Download links available
  • Email sent
  ↓
[Download Files]
  ↓
END → Files downloaded
```

---

### 6.2 Content Manager Flow (Adding Product)

```
START → Login to /admin
  ↓
Navigate to Products → Create New
  ↓
[Product Form]
  • Upload preview images
  • Enter title
  • Write description
  • Add features
  • Set price
  • Select category
  • Add tags
  • Upload template file
  • Fill SEO fields
  • Set publish status
  ↓
Click "Save" or "Publish"
  ↓
Payload saves to database
  ↓
Webhook triggers revalidation
  ↓
Product page generated/updated
  ↓
END → Product live on site
```

---

### 6.3 Guest Checkout Flow

```
User adds product to cart
  ↓
Proceeds to checkout (no account required)
  ↓
Enters email + name
  ↓
Completes payment
  ↓
Order created in database
  ↓
Email sent with:
  • Receipt
  • Download links
  • Magic link to download page
  ↓
User can download files via:
  • Email links
  • Order confirmation page
  • Magic link (valid 48 hours)
  ↓
Optional: User creates account to save purchase history
```

---

### 6.4 Search Flow

```
User types in search bar
  ↓
Autocomplete suggestions appear
  ↓
User selects suggestion OR presses Enter
  ↓
[Search Results Page]
  • Matching products displayed
  • Filters available (category, price, format)
  • Sort options
  ↓
User applies filters
  ↓
Results update instantly (client-side)
  ↓
User clicks product
  ↓
[Product Detail Page]
```

---

## 7. Database Schema

### 7.1 Core Tables

#### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  
  -- Files
  preview_images JSONB, -- Array of image URLs
  file_url VARCHAR(500), -- Link to Supabase Storage
  file_format VARCHAR(50), -- e.g., "DOCX", "PPTX"
  file_size VARCHAR(50), -- e.g., "2.5 MB"
  
  -- Content
  features JSONB, -- Array of feature strings
  
  -- Relationships
  category_id UUID REFERENCES categories(id),
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  keywords TEXT,
  
  -- Publishing
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  publish_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_publish_at ON products(publish_at);
```

---

#### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  
  -- Hierarchy
  parent_id UUID REFERENCES categories(id),
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

---

#### Tags Table
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Junction table for many-to-many relationship
CREATE TABLE product_tags (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
```

---

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  user_id UUID REFERENCES users(id), -- NULL for guest checkout
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Payment
  payment_method VARCHAR(50), -- 'stripe', 'paypal'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_intent_id VARCHAR(255), -- Stripe payment intent ID
  paypal_order_id VARCHAR(255), -- PayPal order ID
  
  -- Download
  download_token VARCHAR(255) UNIQUE, -- Secure token for download page
  download_expires_at TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  download_limit INTEGER DEFAULT 5,
  
  -- Metadata
  status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Additional
  ip_address INET,
  user_agent TEXT
);

-- Indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_download_token ON orders(download_token);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

---

#### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  -- Snapshot of product at time of purchase
  product_title VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  file_url VARCHAR(500), -- Snapshot of file URL
  
  quantity INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

---

#### Blog Posts Table
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB, -- Rich text content (Lexical JSON)
  
  -- Media
  cover_image_url VARCHAR(500),
  
  -- Author
  author_id UUID REFERENCES users(id),
  
  -- Categorization
  category_id UUID REFERENCES categories(id),
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  keywords TEXT,
  
  -- Publishing
  status VARCHAR(50) DEFAULT 'draft',
  publish_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  reading_time INTEGER -- in minutes
);

-- Junction table for blog tags
CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

---

#### Reviews Table (Phase 2)
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id), -- Ensures verified purchase
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title VARCHAR(255),
  content TEXT,
  
  -- Moderation
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  
  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

---

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  
  -- Authentication (handled by Supabase Auth)
  -- This table extends auth.users
  
  -- Profile
  avatar_url VARCHAR(500),
  
  -- Preferences
  email_notifications BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

---

#### Pages Table (Static Content)
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content JSONB, -- Rich text content
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  
  -- Publishing
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 7.2 Supabase Storage Buckets

```
Bucket: templates (private)
├── cv-templates/
│   ├── modern-cv-template/
│   │   ├── template.docx
│   │   ├── template.pptx
│   │   └── preview.jpg
│   └── creative-cv-template/
│       └── template.docx
├── business-documents/
└── presentations/

Bucket: images (public)
├── products/
│   ├── product-1-main.jpg
│   ├── product-1-preview-1.jpg
│   └── product-1-preview-2.jpg
├── blog/
└── categories/

Bucket: avatars (public)
└── user-avatars/
```

---

### 7.3 Row-Level Security (RLS) Policies

```sql
-- Products: Public can read published products
CREATE POLICY "Public can view published products"
  ON products FOR SELECT
  USING (status = 'published' AND (publish_at IS NULL OR publish_at <= NOW()));

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.email() = customer_email
  );

-- Template Files: Only accessible after purchase verification
-- (Handled via signed URLs in application logic)

-- Reviews: Public can read approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');
```

---

## 8. API Specifications

### 8.1 Payload CMS API Endpoints

#### Products API
```typescript
// GET all products (with filters)
GET /api/products
Query params:
  - limit: number (default: 10)
  - page: number (default: 1)
  - where[category][equals]: string
  - where[price][greater_than]: number
  - where[price][less_than]: number
  - sort: string (e.g., '-createdAt', 'price')
  - depth: number (populate relationships)

Response:
{
  docs: Product[],
  totalDocs: number,
  limit: number,
  page: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPrevPage: boolean
}

// GET single product
GET /api/products/{id}
GET /api/products/slug/{slug}

// POST create product (admin only)
POST /api/products

// PATCH update product (admin only)
PATCH /api/products/{id}

// DELETE product (admin only)
DELETE /api/products/{id}
```

---

#### Categories API
```typescript
// GET all categories
GET /api/categories
Query params:
  - depth: number

// GET single category with products
GET /api/categories/{id}?depth=1

// GET category by slug
GET /api/categories/slug/{slug}
```

---

#### Blog Posts API
```typescript
// GET all published posts
GET /api/blog-posts
Query params:
  - where[status][equals]: 'published'
  - where[publishAt][less_than_equal]: 'now'
  - sort: '-publishAt'
  - limit, page

// GET single post
GET /api/blog-posts/slug/{slug}
```

---

### 8.2 Custom API Routes

#### Checkout API
```typescript
// Create Stripe Checkout Session
POST /api/checkout/stripe
Body: {
  items: [
    {
      productId: string,
      quantity: number
    }
  ],
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string
}

Response: {
  sessionId: string,
  url: string
}

// Create PayPal Order
POST /api/checkout/paypal
Body: {
  items: [...],
  returnUrl: string,
  cancelUrl: string
}

Response: {
  orderId: string,
  approvalUrl: string
}
```

---

#### Webhook Handlers
```typescript
// Stripe Webhook
POST /api/webhooks/stripe
Headers: {
  stripe-signature: string
}
Body: Stripe Event

Handles events:
  - checkout.session.completed
  - payment_intent.succeeded
  - payment_intent.payment_failed

// PayPal Webhook
POST /api/webhooks/paypal
Body: PayPal Event

Handles events:
  - CHECKOUT.ORDER.APPROVED
  - PAYMENT.CAPTURE.COMPLETED
```

---

#### Download API
```typescript
// Generate download link
POST /api/download/generate
Body: {
  orderId: string,
  productId: string
}

Response: {
  downloadUrl: string, // Signed URL
  expiresAt: string
}

// Verify download token
GET /api/download/verify/{token}

Response: {
  valid: boolean,
  order: Order,
  items: OrderItem[]
}
```

---

#### Search API (Phase 2)
```typescript
// Full-text search
GET /api/search
Query params:
  - q: string (query)
  - type: 'products' | 'blog' | 'all'
  - limit: number

Response: {
  products: Product[],
  blogPosts: BlogPost[],
  categories: Category[]
}

// Autocomplete suggestions
GET /api/search/autocomplete
Query params:
  - q: string

Response: {
  suggestions: string[]
}
```

---

#### Revalidation API
```typescript
// Trigger revalidation of specific paths
POST /api/revalidate
Body: {
  paths: string[]
}

Headers: {
  authorization: string // Secret token
}

Response: {
  revalidated: boolean,
  message: string
}
```

---

## 9. UI/UX Requirements

### 9.1 Design Principles

1. **Simplicity:** Clean, uncluttered interfaces
2. **Consistency:** Uniform design language across all pages
3. **Accessibility:** WCAG 2.1 AA compliance
4. **Responsiveness:** Mobile-first design
5. **Performance:** Fast load times, smooth interactions
6. **Trust:** Clear pricing, secure checkout, professional appearance

---

### 9.2 Page Layouts

#### Homepage
```
┌─────────────────────────────────────────┐
│            Header / Navigation           │
├─────────────────────────────────────────┤
│                                          │
│         Hero Section                     │
│   • Headline                             │
│   • Subheadline                          │
│   • CTA button                           │
│   • Featured image/video                 │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│    Category Showcase (4-6 categories)   │
│   ┌──────┐ ┌──────┐ ┌──────┐           │
│   │ CV   │ │Invoice│ │Present│          │
│   └──────┘ └──────┘ └──────┘           │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│    Featured Products (8-12 products)    │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│   │Prod│ │Prod│ │Prod│ │Prod│         │
│   └────┘ └────┘ └────┘ └────┘         │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│         Why Choose Us Section           │
│   • USP 1: Professional quality          │
│   • USP 2: Instant download              │
│   • USP 3: Easy customization            │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Recent Blog Posts (3 posts)        │
│                                          │
├─────────────────────────────────────────┤
│      Newsletter Signup Section          │
├─────────────────────────────────────────┤
│            Footer                        │
└─────────────────────────────────────────┘
```

---

#### Product Detail Page
```
┌─────────────────────────────────────────┐
│            Header                        │
├─────────────────────────────────────────┤
│    Breadcrumbs: Home > Category > Prod  │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │  Product Name │    │
│  │   Product    │  │  ★★★★☆ (45)   │    │
│  │   Gallery    │  │               │    │
│  │   (images)   │  │  $19.99       │    │
│  │              │  │               │    │
│  │  [Main Img]  │  │  [Add to Cart]│    │
│  │  [🔍]        │  │  [Buy Now]    │    │
│  │              │  │               │    │
│  │ [👁] [👁] [👁]│  │  Features:    │    │
│  │              │  │  • Feature 1   │    │
│  └──────────────┘  │  • Feature 2   │    │
│                     │                │    │
│                     └──────────────┘    │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│         Tabs Section                     │
│  [Description] [Details] [Reviews]      │
│  ─────────────                           │
│                                          │
│  Rich text description...                │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│       Related Products                   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │Prod│ │Prod│ │Prod│ │Prod│           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                          │
├─────────────────────────────────────────┤
│            Footer                        │
└─────────────────────────────────────────┘
```

**Components:**
- **Image Gallery:** 
  - Main image with zoom
  - Thumbnail strip (3-5 images)
  - Lightbox for full-screen view
- **Product Info:**
  - Title (H1)
  - Star rating + review count
  - Price (with compare-at price if discounted)
  - Add to Cart button (primary CTA)
  - Buy Now button (secondary CTA, skips cart)
  - Feature bullets
  - Category + Tags
- **Tabs:**
  - Description (rich text)
  - Details (format, size, included files)
  - Reviews (Phase 2)
- **Related Products:** 4-8 similar products

---

#### Category Page
```
┌─────────────────────────────────────────┐
│            Header                        │
├─────────────────────────────────────────┤
│    Breadcrumbs: Home > Category         │
├─────────────────────────────────────────┤
│                                          │
│  Category Hero Banner                   │
│  • Category name                         │
│  • Description                           │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│ ┌────────┐ ┌──────────────────────────┐│
│ │Filters │ │   Product Grid            ││
│ │        │ │  ┌────┐ ┌────┐ ┌────┐   ││
│ │Price   │ │  │Prod│ │Prod│ │Prod│   ││
│ │☐ $0-10 │ │  └────┘ └────┘ └────┘   ││
│ │☐$10-20 │ │  ┌────┐ ┌────┐ ┌────┐   ││
│ │        │ │  │Prod│ │Prod│ │Prod│   ││
│ │Format  │ │  └────┘ └────┘ └────┘   ││
│ │☐ DOCX  │ │                           ││
│ │☐ PPTX  │ │  [Load More] / Pagination││
│ │        │ │                           ││
│ │Style   │ └──────────────────────────┘│
│ │☐Modern │                              │
│ │☐Classic│  Sort: [Relevance ▼]        │
│ │        │  12 products                 │
│ └────────┘                              │
│                                          │
├─────────────────────────────────────────┤
│            Footer                        │
└─────────────────────────────────────────┘
```

**Features:**
- Sidebar filters (collapsible on mobile)
- Product grid (responsive: 4 cols desktop, 2 cols tablet, 1 col mobile)
- Sort dropdown
- Pagination or infinite scroll
- Active filters displayed as removable badges

---

#### Cart Drawer (Slide-out)
```
┌──────────────────────────────┐
│  Your Cart              [✕]  │
├──────────────────────────────┤
│                              │
│ ┌─────┐  Product Name        │
│ │ Img │  $19.99              │
│ └─────┘  [Remove]            │
│                              │
│ ┌─────┐  Product Name 2      │
│ │ Img │  $14.99              │
│ └─────┘  [Remove]            │
│                              │
├──────────────────────────────┤
│                              │
│  Subtotal:         $34.98    │
│  Tax:               $0.00    │
│  ─────────────────────────   │
│  Total:            $34.98    │
│                              │
│  [View Cart]  [Checkout]     │
│                              │
└──────────────────────────────┘
```

---

#### Checkout Page
```
┌─────────────────────────────────────────┐
│            Header (minimal)              │
├─────────────────────────────────────────┤
│                                          │
│  Checkout Progress: [Cart] → [Info] →   │
│                     [Payment] → [Done]   │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│ ┌──────────────────┐ ┌────────────────┐ │
│ │                  │ │ Order Summary  │ │
│ │ Customer Info    │ │                │ │
│ │ [Email]          │ │ Product 1      │ │
│ │ [Name]           │ │ $19.99         │ │
│ │                  │ │                │ │
│ │ Payment Method   │ │ Product 2      │ │
│ │ ◉ Stripe         │ │ $14.99         │ │
│ │ ○ PayPal         │ │ ───────────    │ │
│ │                  │ │ Total: $34.98  │ │
│ │ [Complete Order] │ │                │ │
│ │                  │ └────────────────┘ │
│ └──────────────────┘                    │
│                                          │
│ 🔒 Secure Checkout                       │
│                                          │
├─────────────────────────────────────────┤
│            Footer (minimal)              │
└─────────────────────────────────────────┘
```

---

### 9.3 Component Library (shadcn/ui)

**Essential Components:**
- Button (primary, secondary, outline, ghost, link)
- Card (for product cards, blog cards)
- Dialog / Modal (for quick view, confirmations)
- Drawer / Sheet (for cart, mobile menu)
- Input (text, email, number)
- Select / Dropdown
- Checkbox, Radio
- Badge (for tags, categories)
- Tabs
- Accordion (for FAQs)
- Breadcrumbs
- Pagination
- Toast (for notifications)
- Skeleton (loading states)
- Avatar
- Command (for search with keyboard navigation)
- Tooltip

**Custom Components to Build:**
- ProductCard
- ProductGallery
- CartItem
- CartDrawer
- SearchBar with Autocomplete
- FilterSidebar
- PriceDisplay
- StarRating
- ReviewCard
- CategoryCard
- BlogCard
- DownloadButton

---

### 9.4 Responsive Design Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

**Layout Adjustments:**
- **Mobile (<640px):**
  - Single column layout
  - Hamburger menu
  - Stacked product cards
  - Bottom-fixed CTA buttons
- **Tablet (640-1024px):**
  - 2-column product grid
  - Condensed navigation
  - Drawer for filters
- **Desktop (1024px+):**
  - 4-column product grid
  - Full navigation
  - Sidebar filters
  - Hover effects

---

### 9.5 Accessibility Requirements

**WCAG 2.1 AA Compliance:**
- **Keyboard Navigation:** All interactive elements accessible via Tab
- **Focus Indicators:** Visible focus states (outline)
- **Color Contrast:** Minimum 4.5:1 for text
- **Alt Text:** All images have descriptive alt attributes
- **ARIA Labels:** Proper labeling for screen readers
- **Form Labels:** All inputs have associated labels
- **Semantic HTML:** Proper use of headings, lists, buttons
- **Skip Links:** "Skip to main content" link
- **Error Messages:** Clear, descriptive error messages
- **Loading States:** Announce to screen readers

**Testing:**
- Lighthouse accessibility audit (score 90+)
- axe DevTools for automated testing
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)

---

### 9.6 Visual Design Guidelines

**Color Palette:**
```css
/* Example palette - adjust to brand */
--primary: #0066FF (brand blue)
--primary-foreground: #FFFFFF
--secondary: #F3F4F6 (light gray)
--accent: #10B981 (green for success)
--destructive: #EF4444 (red for errors)
--muted: #6B7280 (gray for secondary text)
--background: #FFFFFF
--foreground: #111827 (dark gray for text)
```

**Typography:**
```css
/* Headings */
H1: 3rem (48px), bold
H2: 2.25rem (36px), bold
H3: 1.875rem (30px), semibold
H4: 1.5rem (24px), semibold

/* Body */
Body: 1rem (16px), regular
Small: 0.875rem (14px), regular
Tiny: 0.75rem (12px), regular
```

**Spacing:**
- Consistent use of Tailwind spacing scale (0, 0.5, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- Generous whitespace for readability
- Padding: 16px (mobile), 24px (desktop) for containers

**Imagery:**
- High-quality product images (minimum 1200x800px)
- Consistent aspect ratios (3:2 or 4:3)
- Optimized (WebP format, lazy loading)
- Placeholder images during loading (blur-up effect)

---

## 10. Security & Compliance

### 10.1 Security Measures

#### Payment Security
- **PCI DSS Compliance:** Use Stripe/PayPal hosted checkout (no card data stored)
- **HTTPS:** Enforce SSL/TLS for all connections
- **Secure Cookies:** HttpOnly, Secure, SameSite attributes
- **CSP Headers:** Content Security Policy to prevent XSS

#### Data Protection
- **Environment Variables:** Store secrets in .env.local (never commit)
- **API Keys:** Rotate regularly, restrict by IP/domain
- **Database Security:**
  - Row-level security (RLS) in Supabase
  - Prepared statements to prevent SQL injection
  - Encrypted connections
- **File Access:**
  - Signed URLs with expiration (24-48 hours)
  - Download limit per purchase
  - Verify purchase before generating links

#### Authentication (if implemented)
- **Password Hashing:** bcrypt or Argon2
- **Session Management:** Secure session tokens
- **Rate Limiting:** Prevent brute force attacks
- **2FA:** Optional two-factor authentication (Phase 2)

#### API Security
- **Rate Limiting:** 100 requests/minute per IP
- **Input Validation:** Validate all inputs (use Zod)
- **CORS:** Restrict to allowed origins
- **Webhook Verification:** Verify Stripe/PayPal signatures

---

### 10.2 Privacy & GDPR Compliance

**Required Pages:**
- Privacy Policy
- Terms of Service
- Cookie Policy
- Refund Policy

**Data Collection:**
- Disclose what data is collected (email, name, payment info, IP)
- Purpose of data collection
- How data is stored and protected
- Third-party data sharing (Stripe, PayPal)
- User rights (access, deletion, portability)

**Cookie Consent:**
- Cookie banner on first visit
- Essential cookies (session, auth)
- Optional cookies (analytics, marketing)
- Cookie preference center

**User Rights:**
- Right to access data
- Right to deletion (GDPR)
- Data export functionality (Phase 2)

---

### 10.3 Legal Requirements

**Business Information:**
- Company name and address
- Contact information
- Business registration number (if applicable)
- VAT/Tax ID (if applicable)

**Terms of Service:**
- License terms for digital products
- Refund policy (typically no refunds for digital goods)
- Prohibited uses
- Liability limitations
- Dispute resolution

**DMCA Protection:**
- DMCA notice and takedown procedure
- Copyright infringement reporting
- Counter-notice process

---

### 10.4 Backup & Recovery

**Database Backups:**
- Supabase automatic daily backups
- Manual backup before major changes
- Test restoration process quarterly

**File Backups:**
- Replicate Supabase Storage to secondary location
- Version control for code (Git)
- Document backup procedures

**Disaster Recovery:**
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 24 hours
- Documented recovery procedures

---

## 11. Performance Requirements

### 11.1 Performance Targets

**Page Load Times:**
- **Homepage:** < 2 seconds
- **Product Pages:** < 2.5 seconds
- **Category Pages:** < 2 seconds
- **Checkout:** < 1.5 seconds

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Lighthouse Scores:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 95+

---

### 11.2 Optimization Strategies

**Frontend Optimization:**
- Static site generation (SSG) for all content pages
- Incremental static regeneration (ISR)
- Image optimization (Next.js Image component)
- Code splitting and lazy loading
- Tree shaking unused code
- Minification of CSS/JS
- Prefetching for critical pages
- Service worker for offline support (optional)

**Database Optimization:**
- Proper indexing on frequently queried fields
- Query optimization (avoid N+1 queries)
- Connection pooling
- Caching layer (Redis - Phase 2)

**CDN & Caching:**
- Vercel Edge Network for static assets
- Cache-Control headers
- Service worker caching (Phase 2)

**Bundle Size:**
- Keep JavaScript bundle < 200KB (gzipped)
- Analyze bundle with @next/bundle-analyzer
- Remove unused dependencies

---

### 11.3 Monitoring & Analytics

**Performance Monitoring:**
- Vercel Analytics (built-in)
- Google PageSpeed Insights (monthly audits)
- Lighthouse CI in deployment pipeline

**Error Tracking:**
- Sentry for frontend/backend errors
- Error rate alerts

**User Analytics:**
- Google Analytics 4
- Track: page views, conversions, bounce rate, session duration
- E-commerce tracking (purchases, cart abandonment)

**Business Metrics:**
- Revenue tracking
- Conversion rate
- Average order value
- Customer acquisition cost
- Lifetime value

---

## 12. Development Phases

### Phase 1: MVP (Weeks 1-6)

**Week 1-2: Setup & Foundation**
- [ ] Initialize Next.js 14 project with App Router
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up Supabase project (database + storage)
- [ ] Install and configure Payload CMS
- [ ] Connect Payload to Supabase PostgreSQL
- [ ] Create database schema and migrations
- [ ] Set up Git repository and version control
- [ ] Configure environment variables

**Week 3-4: Core Collections & CMS**
- [ ] Implement Payload collections:
  - [ ] Products collection
  - [ ] Categories collection
  - [ ] Tags collection
  - [ ] Blog Posts collection
  - [ ] Pages collection
  - [ ] Orders collection
- [ ] Implement globals (Header, Footer, Site Settings)
- [ ] Configure Supabase Storage adapter for file uploads
- [ ] Set up RLS policies
- [ ] Create sample data (20 products for testing)

**Week 5-6: Frontend Pages**
- [ ] Build layout components (Header, Footer, Navigation)
- [ ] Implement Homepage
- [ ] Implement Product Listing Page
- [ ] Implement Product Detail Page
- [ ] Implement Category Pages
- [ ] Implement Cart functionality
- [ ] Implement Search functionality
- [ ] Build 404 and error pages

---

### Phase 2: E-Commerce & Payments (Weeks 7-9)

**Week 7: Checkout Flow**
- [ ] Build Checkout Page
- [ ] Implement cart persistence (local storage)
- [ ] Create checkout API routes
- [ ] Integrate Stripe Checkout
- [ ] Integrate PayPal
- [ ] Test payment flows

**Week 8: Order Management**
- [ ] Implement Stripe webhook handler
- [ ] Implement PayPal webhook handler
- [ ] Create order confirmation page
- [ ] Build download page with secure links
- [ ] Implement download tracking
- [ ] Set up email notifications (Resend)
- [ ] Create email templates (order confirmation, download links)

**Week 9: Admin Features**
- [ ] Customize Payload dashboard
- [ ] Create order management UI
- [ ] Implement sales analytics
- [ ] Build product management workflows
- [ ] Test admin workflows

---

### Phase 3: Content & SEO (Weeks 10-11)

**Week 10: Blog & Content**
- [ ] Build Blog Listing Page
- [ ] Build Blog Post Page
- [ ] Implement blog categories and tags
- [ ] Create related posts logic
- [ ] Add social sharing buttons

**Week 11: SEO Optimization**
- [ ] Implement metadata generation for all pages
- [ ] Add structured data (JSON-LD schemas)
- [ ] Create XML sitemap
- [ ] Configure robots.txt
- [ ] Set up canonical URLs
- [ ] Implement OpenGraph tags
- [ ] Build 301 redirect system
- [ ] Test with Lighthouse and Google Search Console

---

### Phase 4: Polish & Launch (Weeks 12-14)

**Week 12: UI/UX Polish**
- [ ] Implement loading states and skeletons
- [ ] Add animations and transitions
- [ ] Refine mobile responsiveness
- [ ] Improve accessibility (WCAG AA)
- [ ] Test on multiple devices and browsers
- [ ] Optimize images and assets

**Week 13: Testing & QA**
- [ ] End-to-end testing (Playwright/Cypress)
- [ ] Payment flow testing (test mode)
- [ ] Cross-browser testing
- [ ] Performance testing (Lighthouse)
- [ ] Security audit
- [ ] Load testing
- [ ] Bug fixes

**Week 14: Content Population & Launch**
- [ ] Upload 200+ products
- [ ] Write 10+ blog posts
- [ ] Create static pages (About, Terms, Privacy, Contact)
- [ ] Set up Google Analytics
- [ ] Configure domain and SSL
- [ ] Deploy to production (Vercel)
- [ ] Monitor launch
- [ ] Marketing launch

---

### Phase 5: Post-Launch (Weeks 15+)

**Immediate Post-Launch (Weeks 15-16):**
- [ ] Monitor error logs (Sentry)
- [ ] Track analytics and user behavior
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Optimize based on real traffic

**Phase 2 Features (Weeks 17-24):**
- [ ] User accounts and authentication
- [ ] Review and rating system
- [ ] Wishlist functionality
- [ ] Advanced search (Algolia/Meilisearch)
- [ ] Discount and coupon system
- [ ] Abandoned cart recovery
- [ ] Email marketing integration
- [ ] Advanced analytics dashboard
- [ ] Product recommendations
- [ ] Customer support chat (Intercom/Crisp)

**Phase 3 Features (Weeks 25+):**
- [ ] Multi-language support
- [ ] Multiple currencies
- [ ] Affiliate program
- [ ] Subscription model
- [ ] Bundle deals
- [ ] Gift cards
- [ ] Loyalty program
- [ ] Mobile app (React Native)

---

## 13. Success Metrics

### 13.1 Launch Metrics (First 3 Months)

**Traffic:**
- 10,000+ monthly visitors
- 5,000+ monthly organic visitors
- Average session duration: 2+ minutes
- Bounce rate: < 60%

**E-Commerce:**
- 100+ orders per month
- 3-5% conversion rate
- Average order value: $15-25
- Cart abandonment rate: < 70%

**Content:**
- 50+ blog posts published
- 5,000+ blog page views
- 20+ backlinks acquired

**Technical:**
- 99.9% uptime
- Page load time < 3 seconds
- Zero critical security incidents
- Error rate < 0.5%

---

### 13.2 6-Month Metrics

**Traffic:**
- 50,000+ monthly visitors
- 25,000+ monthly organic visitors
- 100+ keywords ranking in top 10

**E-Commerce:**
- 500+ orders per month
- $10,000+ monthly revenue
- 100+ returning customers
- 4.5+ star average rating

**Content:**
- 100+ blog posts
- 20,000+ blog page views
- 50+ backlinks

---

### 13.3 12-Month Metrics

**Traffic:**
- 100,000+ monthly visitors
- 60,000+ monthly organic visitors
- 500+ keywords ranking

**E-Commerce:**
- 1,500+ orders per month
- $30,000+ monthly revenue
- 500+ active users with accounts
- 10,000+ email subscribers

---

### 13.4 Key Performance Indicators (KPIs)

**Daily Monitoring:**
- Orders placed
- Revenue
- Traffic sources
- Top-selling products
- Error rate

**Weekly Review:**
- Conversion rate by traffic source
- Cart abandonment rate
- Average order value
- Customer acquisition cost
- Top search queries

**Monthly Analysis:**
- Month-over-month growth
- Customer lifetime value
- Refund rate
- Content performance (top posts)
- SEO rankings

---

## 14. Risk Management

### 14.1 Technical Risks

**Risk:** Database performance degradation with scale
**Mitigation:** Proper indexing, query optimization, caching layer

**Risk:** Payment gateway downtime
**Mitigation:** Multiple payment options (Stripe + PayPal), status page monitoring

**Risk:** File delivery security breach
**Mitigation:** Signed URLs, download limits, RLS policies, regular security audits

**Risk:** DDoS attacks
**Mitigation:** Cloudflare protection, rate limiting, traffic monitoring

---

### 14.2 Business Risks

**Risk:** Low conversion rate
**Mitigation:** A/B testing, user feedback, optimize checkout flow, trust signals

**Risk:** High refund rate
**Mitigation:** Clear product descriptions, preview images, sample files, FAQ

**Risk:** Copyright infringement claims
**Mitigation:** DMCA policy, watermarked previews, clear licensing terms

**Risk:** Slow customer acquisition
**Mitigation:** Content marketing, SEO, paid ads, affiliate program, social media

---

## 15. Appendices

### 15.1 Glossary

- **MVP:** Minimum Viable Product
- **SSG:** Static Site Generation
- **ISR:** Incremental Static Regeneration
- **RLS:** Row-Level Security
- **CMS:** Content Management System
- **SEO:** Search Engine Optimization
- **LCP:** Largest Contentful Paint
- **FID:** First Input Delay
- **CLS:** Cumulative Layout Shift

---

### 15.2 References

- Next.js Documentation: https://nextjs.org/docs
- Payload CMS Documentation: https://payloadcms.com/docs
- Supabase Documentation: https://supabase.com/docs
- Stripe Documentation: https://stripe.com/docs
- PayPal Developer Documentation: https://developer.paypal.com/
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- shadcn/ui Documentation: https://ui.shadcn.com/

---

### 15.3 Competitor Analysis

**Vorlagen.de:**
- Strengths: Huge catalog, clean design, strong SEO
- Weaknesses: Dated UI, slow load times
- Opportunity: Modern tech stack, better UX

**Template.net:**
- Strengths: Diverse templates, good SEO
- Weaknesses: Cluttered UI, aggressive upselling
- Opportunity: Cleaner design, transparent pricing

**Canva:**
- Strengths: Brand recognition, easy editing
- Weaknesses: Subscription-heavy, limited file formats
- Opportunity: One-time purchases, native file formats

---

## 16. Contact & Support

**Project Owner:** [Your Name]
**Development Team:** [Team Members]
**Launch Date Target:** [Target Date]

**Support Channels:**
- Email: support@yourtemplatemarketplace.com
- Help Center: /help
- Live Chat: (Phase 2)

---

**Document Version:** 1.0
**Last Updated:** November 28, 2025
**Status:** Ready for Development

---

## Sign-off

By proceeding with this PRD, all stakeholders agree to the scope, timeline, and requirements outlined in this document.

**Approved by:**
- [ ] Product Owner
- [ ] Technical Lead
- [ ] Design Lead
- [ ] Business Stakeholder

---

*End of Product Requirements Document*

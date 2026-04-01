# Template Marketplace - Developer TODO List

**Project:** Template Marketplace E-Commerce Platform  
**Tech Stack:** Next.js 14+, Supabase, Payload CMS, Tailwind CSS, shadcn/ui, Stripe, PayPal  
**Timeline:** 14 weeks (MVP)  
**Last Updated:** November 28, 2025

---

## Table of Contents
- [Phase 1: Setup & Foundation (Weeks 1-2)](#phase-1-setup--foundation-weeks-1-2)
- [Phase 2: CMS & Collections (Weeks 3-4)](#phase-2-cms--collections-weeks-3-4)
- [Phase 3: Frontend Pages (Weeks 5-6)](#phase-3-frontend-pages-weeks-5-6)
- [Phase 4: E-Commerce & Payments (Weeks 7-9)](#phase-4-e-commerce--payments-weeks-7-9)
- [Phase 5: Content & SEO (Weeks 10-11)](#phase-5-content--seo-weeks-10-11)
- [Phase 6: Polish & Launch (Weeks 12-14)](#phase-6-polish--launch-weeks-12-14)
- [Post-Launch Tasks](#post-launch-tasks)

---

## Phase 1: Setup & Foundation (Weeks 1-2)

**Goal:** Set up development environment, initialize project, configure all services

### Week 1: Project Initialization

#### Day 1-2: Next.js Setup
- [ ] **Initialize Next.js 14 project**
  ```bash
  npx create-next-app@latest template-marketplace --typescript --tailwind --app
  cd template-marketplace
  ```
  - ✅ Choose: TypeScript, ESLint, Tailwind CSS, App Router
  - ✅ Directory structure: `/app`, `/components`, `/lib`

- [ ] **Configure Tailwind CSS**
  - [ ] Update `tailwind.config.ts` with custom colors
  - [ ] Add custom fonts (if needed)
  - [ ] Set up design tokens
  - [ ] Test Tailwind is working

- [ ] **Install shadcn/ui**
  ```bash
  npx shadcn-ui@latest init
  ```
  - [ ] Configure `components.json`
  - [ ] Install base components:
    ```bash
    npx shadcn-ui@latest add button card input select dialog sheet badge toast tabs
    ```

- [ ] **Project Structure Setup**
  - [ ] Create folder structure:
    ```
    /app
      /api
      /(storefront)
      /(dashboard)
    /components
      /ui
      /layout
      /product
      /cart
      /common
    /lib
      /stripe
      /paypal
      /supabase
      /email
    /payload
    /hooks
    /styles
    /public
    /emails
    ```

- [ ] **Git Repository Setup**
  - [ ] Initialize git: `git init`
  - [ ] Create `.gitignore` (include `.env.local`, `node_modules`, `.next`)
  - [ ] Create GitHub/GitLab repository
  - [ ] Push initial commit
  - [ ] Set up branch protection rules (main branch)

#### Day 3: Supabase Setup

- [ ] **Create Supabase Project**
  - [ ] Go to https://supabase.com
  - [ ] Create new project
  - [ ] Choose region (closest to target audience)
  - [ ] Save credentials:
    - Project URL
    - Anon/Public Key
    - Service Role Key (secret!)
    - Database connection string

- [ ] **Configure Supabase Storage**
  - [ ] Create buckets:
    - [ ] `templates` (private) - for downloadable files
    - [ ] `images` (public) - for product images, blog images
    - [ ] `avatars` (public) - for user avatars (Phase 2)
  
  - [ ] Set up storage policies:
    ```sql
    -- For templates bucket (private)
    CREATE POLICY "Authenticated users can upload templates"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'templates');
    
    -- For images bucket (public read)
    CREATE POLICY "Public can view images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'images');
    ```

- [ ] **Install Supabase Client**
  ```bash
  npm install @supabase/supabase-js
  ```

- [ ] **Create Supabase client utilities**
  - [ ] Create `/lib/supabase/client.ts`:
    ```typescript
    import { createClient } from '@supabase/supabase-js'
    
    export const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    ```
  
  - [ ] Create `/lib/supabase/server.ts` for server-side operations:
    ```typescript
    import { createClient } from '@supabase/supabase-js'
    
    export const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    ```

- [ ] **Test Supabase Connection**
  - [ ] Create test API route: `/app/api/test-supabase/route.ts`
  - [ ] Query Supabase to verify connection
  - [ ] Test storage bucket access

#### Day 4: Payload CMS Installation

- [ ] **Install Payload CMS**
  ```bash
  npm install payload @payloadcms/db-postgres @payloadcms/richtext-lexical
  npm install --save-dev @payloadcms/next
  ```

- [ ] **Create Payload Configuration**
  - [ ] Create `/payload/payload.config.ts`:
    ```typescript
    import { buildConfig } from 'payload/config'
    import { postgresAdapter } from '@payloadcms/db-postgres'
    import { lexicalEditor } from '@payloadcms/richtext-lexical'
    
    export default buildConfig({
      serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      admin: {
        user: 'users',
      },
      editor: lexicalEditor({}),
      collections: [
        // Will add collections here
      ],
      db: postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URL,
        },
      }),
      typescript: {
        outputFile: 'payload-types.ts',
      },
    })
    ```

- [ ] **Configure Next.js for Payload**
  - [ ] Update `next.config.js`:
    ```javascript
    const { withPayload } = require('@payloadcms/next/withPayload')
    
    module.exports = withPayload({
      // your Next.js config
    })
    ```

- [ ] **Set up Payload Admin Route**
  - [ ] Create `/app/(payload)/admin/[[...segments]]/page.tsx`
  - [ ] Configure admin UI access at `/admin`

- [ ] **Create Initial Admin User**
  - [ ] Run Payload migration
  - [ ] Create first admin account via CLI or UI
  - [ ] Test login at `/admin`

#### Day 5: Environment Variables & Configuration

- [ ] **Create `.env.local` file**
  ```env
  # Next.js
  NEXT_PUBLIC_SERVER_URL=http://localhost:3000
  
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres
  
  # Payload CMS
  PAYLOAD_SECRET=your_random_secret_key_here
  
  # Stripe (test keys)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  
  # PayPal (sandbox)
  NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
  PAYPAL_CLIENT_SECRET=your_secret
  
  # Email
  RESEND_API_KEY=re_...
  ```

- [ ] **Create `.env.example` template**
  - [ ] Copy `.env.local` structure
  - [ ] Replace values with placeholders
  - [ ] Commit to git

- [ ] **Configure TypeScript**
  - [ ] Update `tsconfig.json` with path aliases:
    ```json
    {
      "compilerOptions": {
        "paths": {
          "@/*": ["./*"],
          "@/components/*": ["./components/*"],
          "@/lib/*": ["./lib/*"],
          "@/hooks/*": ["./hooks/*"]
        }
      }
    }
    ```

- [ ] **Install Additional Dependencies**
  ```bash
  # Utilities
  npm install clsx tailwind-merge class-variance-authority
  npm install zod react-hook-form @hookform/resolvers
  npm install date-fns
  
  # State Management
  npm install zustand
  
  # Icons
  npm install lucide-react
  ```

### Week 2: Database Schema & Setup

#### Day 1-2: Database Schema Creation

- [ ] **Create Database Migration Files**
  - [ ] Create `/supabase/migrations/` folder
  - [ ] Create initial migration: `001_initial_schema.sql`

- [ ] **Define Products Table**
  ```sql
  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    
    preview_images JSONB,
    file_url VARCHAR(500),
    file_format VARCHAR(50),
    file_size VARCHAR(50),
    
    features JSONB,
    
    category_id UUID REFERENCES categories(id),
    
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    keywords TEXT,
    
    status VARCHAR(50) DEFAULT 'draft',
    publish_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0
  );
  
  CREATE INDEX idx_products_slug ON products(slug);
  CREATE INDEX idx_products_category ON products(category_id);
  CREATE INDEX idx_products_status ON products(status);
  ```

- [ ] **Define Categories Table**
  ```sql
  CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    parent_id UUID REFERENCES categories(id),
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE INDEX idx_categories_slug ON categories(slug);
  ```

- [ ] **Define Tags Table**
  ```sql
  CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE product_tags (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
  );
  ```

- [ ] **Define Orders Table**
  ```sql
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    user_id UUID,
    
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    paypal_order_id VARCHAR(255),
    
    download_token VARCHAR(255) UNIQUE,
    download_expires_at TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    download_limit INTEGER DEFAULT 5,
    
    status VARCHAR(50) DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    ip_address INET,
    user_agent TEXT
  );
  
  CREATE INDEX idx_orders_order_number ON orders(order_number);
  CREATE INDEX idx_orders_customer_email ON orders(customer_email);
  CREATE INDEX idx_orders_download_token ON orders(download_token);
  ```

- [ ] **Define Order Items Table**
  ```sql
  CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    product_title VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    file_url VARCHAR(500),
    
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE INDEX idx_order_items_order ON order_items(order_id);
  ```

- [ ] **Define Blog Posts Table**
  ```sql
  CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content JSONB,
    cover_image_url VARCHAR(500),
    author_id UUID,
    category_id UUID,
    
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    keywords TEXT,
    
    status VARCHAR(50) DEFAULT 'draft',
    publish_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    views_count INTEGER DEFAULT 0,
    reading_time INTEGER
  );
  
  CREATE TABLE blog_post_tags (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
  );
  ```

- [ ] **Define Pages Table**
  ```sql
  CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content JSONB,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Define Users Table** (extends Supabase auth.users)
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
  );
  ```

#### Day 3: Run Migrations & Set Up RLS

- [ ] **Run Database Migrations**
  ```bash
  # Connect to Supabase
  npx supabase db push
  ```

- [ ] **Set Up Row-Level Security Policies**
  ```sql
  -- Enable RLS on all tables
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  
  -- Products: Public can view published
  CREATE POLICY "Public can view published products"
    ON products FOR SELECT
    USING (status = 'published' AND (publish_at IS NULL OR publish_at <= NOW()));
  
  -- Orders: Users can only see their own
  CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id OR auth.email() = customer_email);
  ```

- [ ] **Create Database Functions**
  ```sql
  -- Function to generate order number
  CREATE OR REPLACE FUNCTION generate_order_number()
  RETURNS TEXT AS $$
  BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END;
  $$ LANGUAGE plpgsql;
  
  -- Function to update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  -- Add triggers for all tables
  CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  ```

- [ ] **Verify Database Setup**
  - [ ] Test all table creations
  - [ ] Test relationships (foreign keys)
  - [ ] Test RLS policies
  - [ ] Create sample data for testing

#### Day 4-5: Testing & Documentation

- [ ] **Create Database Seed Script**
  - [ ] Create `/scripts/seed.ts`
  - [ ] Add sample categories (5-10)
  - [ ] Add sample products (10-20)
  - [ ] Add sample blog posts (5)
  - [ ] Run seed script: `npm run seed`

- [ ] **Test Database Operations**
  - [ ] Test CRUD operations for each table
  - [ ] Test queries with filters
  - [ ] Test pagination
  - [ ] Test relationships

- [ ] **Document Setup**
  - [ ] Create `README.md` with setup instructions
  - [ ] Document environment variables
  - [ ] Document database schema
  - [ ] Document API structure

---

## Phase 2: CMS & Collections (Weeks 3-4)

**Goal:** Implement all Payload CMS collections and configure admin dashboard

### Week 3: Core Collections

#### Day 1-2: Products Collection

- [ ] **Create Products Collection**
  - [ ] Create `/payload/collections/Products.ts`
  
  ```typescript
  import { CollectionConfig } from 'payload/types'
  
  export const Products: CollectionConfig = {
    slug: 'products',
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'category', 'price', 'status'],
    },
    access: {
      read: () => true, // Public can read published
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        admin: {
          position: 'sidebar',
        },
      },
      {
        name: 'shortDescription',
        type: 'textarea',
        maxLength: 500,
      },
      {
        name: 'description',
        type: 'richText',
        required: true,
      },
      {
        name: 'price',
        type: 'number',
        required: true,
        min: 0,
      },
      {
        name: 'compareAtPrice',
        type: 'number',
        min: 0,
      },
      {
        name: 'previewImages',
        type: 'array',
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
          },
          {
            name: 'alt',
            type: 'text',
          },
        ],
      },
      {
        name: 'file',
        type: 'upload',
        relationTo: 'files',
        required: true,
      },
      {
        name: 'fileFormat',
        type: 'text',
      },
      {
        name: 'fileSize',
        type: 'text',
      },
      {
        name: 'features',
        type: 'array',
        fields: [
          {
            name: 'feature',
            type: 'text',
          },
        ],
      },
      {
        name: 'category',
        type: 'relationship',
        relationTo: 'categories',
        required: true,
      },
      {
        name: 'tags',
        type: 'relationship',
        relationTo: 'tags',
        hasMany: true,
      },
      {
        name: 'relatedProducts',
        type: 'relationship',
        relationTo: 'products',
        hasMany: true,
      },
      {
        name: 'seo',
        type: 'group',
        fields: [
          {
            name: 'metaTitle',
            type: 'text',
          },
          {
            name: 'metaDescription',
            type: 'textarea',
            maxLength: 160,
          },
          {
            name: 'keywords',
            type: 'text',
          },
          {
            name: 'ogImage',
            type: 'upload',
            relationTo: 'media',
          },
        ],
      },
      {
        name: 'status',
        type: 'select',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' },
        ],
        defaultValue: 'draft',
        admin: {
          position: 'sidebar',
        },
      },
      {
        name: 'publishAt',
        type: 'date',
        admin: {
          position: 'sidebar',
          date: {
            pickerAppearance: 'dayAndTime',
          },
        },
      },
    ],
  }
  ```

- [ ] **Add Products Collection to Config**
  - [ ] Import in `payload.config.ts`
  - [ ] Add to collections array
  - [ ] Test in admin UI

- [ ] **Configure Slug Auto-generation**
  - [ ] Add beforeValidate hook to generate slug from title
  - [ ] Test slug generation

#### Day 3: Categories & Tags Collections

- [ ] **Create Categories Collection**
  - [ ] Create `/payload/collections/Categories.ts`
  
  ```typescript
  export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: {
      useAsTitle: 'name',
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
      },
      {
        name: 'description',
        type: 'textarea',
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'parent',
        type: 'relationship',
        relationTo: 'categories',
      },
      {
        name: 'displayOrder',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'isFeatured',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'seo',
        type: 'group',
        fields: [
          { name: 'metaTitle', type: 'text' },
          { name: 'metaDescription', type: 'textarea' },
        ],
      },
    ],
  }
  ```

- [ ] **Create Tags Collection**
  - [ ] Create `/payload/collections/Tags.ts`
  - [ ] Similar structure to Categories (simpler)
  - [ ] Add to config

- [ ] **Test Collections**
  - [ ] Create test categories via admin
  - [ ] Create test tags
  - [ ] Verify relationships work

#### Day 4: Blog Posts Collection

- [ ] **Create Blog Posts Collection**
  - [ ] Create `/payload/collections/BlogPosts.ts`
  
  ```typescript
  export const BlogPosts: CollectionConfig = {
    slug: 'blog-posts',
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'status', 'publishAt'],
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
      },
      {
        name: 'excerpt',
        type: 'textarea',
        maxLength: 300,
      },
      {
        name: 'content',
        type: 'richText',
        required: true,
      },
      {
        name: 'coverImage',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'author',
        type: 'relationship',
        relationTo: 'users',
      },
      {
        name: 'category',
        type: 'relationship',
        relationTo: 'categories',
      },
      {
        name: 'tags',
        type: 'relationship',
        relationTo: 'tags',
        hasMany: true,
      },
      {
        name: 'seo',
        type: 'group',
        fields: [
          { name: 'metaTitle', type: 'text' },
          { name: 'metaDescription', type: 'textarea' },
          { name: 'keywords', type: 'text' },
        ],
      },
      {
        name: 'status',
        type: 'select',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
        defaultValue: 'draft',
      },
      {
        name: 'publishAt',
        type: 'date',
        admin: {
          date: {
            pickerAppearance: 'dayAndTime',
          },
        },
      },
      {
        name: 'readingTime',
        type: 'number',
      },
    ],
  }
  ```

- [ ] **Add Reading Time Calculation Hook**
  - [ ] beforeChange hook to calculate reading time
  - [ ] Test calculation

#### Day 5: Pages, Orders & Media Collections

- [ ] **Create Pages Collection**
  - [ ] Create `/payload/collections/Pages.ts`
  - [ ] Similar to blog posts but simpler
  - [ ] Add to config

- [ ] **Create Orders Collection**
  - [ ] Create `/payload/collections/Orders.ts`
  - [ ] Read-only for admin viewing
  - [ ] Fields match database schema
  - [ ] Add to config

- [ ] **Create Media Collection**
  - [ ] Create `/payload/collections/Media.ts`
  - [ ] Configure for Supabase Storage
  
  ```typescript
  export const Media: CollectionConfig = {
    slug: 'media',
    upload: {
      staticURL: '/media',
      staticDir: 'media', // or configure for Supabase
      imageSizes: [
        {
          name: 'thumbnail',
          width: 400,
          height: 300,
          position: 'centre',
        },
        {
          name: 'card',
          width: 768,
          height: 1024,
          position: 'centre',
        },
        {
          name: 'hero',
          width: 1920,
          height: 1080,
          position: 'centre',
        },
      ],
      mimeTypes: ['image/*'],
    },
    fields: [
      {
        name: 'alt',
        type: 'text',
      },
    ],
  }
  ```

- [ ] **Create Files Collection** (for template downloads)
  - [ ] Create `/payload/collections/Files.ts`
  - [ ] Configure for Supabase Storage (templates bucket)
  - [ ] Restrict to authenticated users

### Week 4: Globals, Hooks & Configuration

#### Day 1-2: Global Settings

- [ ] **Create Header Global**
  - [ ] Create `/payload/globals/Header.ts`
  
  ```typescript
  export const Header: GlobalConfig = {
    slug: 'header',
    fields: [
      {
        name: 'logo',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'navigation',
        type: 'array',
        fields: [
          {
            name: 'label',
            type: 'text',
            required: true,
          },
          {
            name: 'url',
            type: 'text',
            required: true,
          },
          {
            name: 'newTab',
            type: 'checkbox',
            defaultValue: false,
          },
        ],
      },
      {
        name: 'ctaButton',
        type: 'group',
        fields: [
          { name: 'label', type: 'text' },
          { name: 'url', type: 'text' },
        ],
      },
    ],
  }
  ```

- [ ] **Create Footer Global**
  - [ ] Create `/payload/globals/Footer.ts`
  - [ ] Fields: logo, navigation columns, social links, copyright text
  - [ ] Add to config

- [ ] **Create Site Settings Global**
  - [ ] Create `/payload/globals/SiteSettings.ts`
  - [ ] Fields: site name, description, contact email, social media URLs
  - [ ] Default SEO settings
  - [ ] Add to config

- [ ] **Add Globals to Config**
  - [ ] Import all globals in `payload.config.ts`
  - [ ] Add to globals array
  - [ ] Test in admin UI

#### Day 3: Payload Hooks & Custom Logic

- [ ] **Create Slug Generation Hook**
  - [ ] Create `/payload/hooks/generateSlug.ts`
  - [ ] Auto-generate slug from title
  - [ ] Ensure uniqueness
  - [ ] Apply to Products, Blog Posts, Pages

- [ ] **Create Revalidation Hook**
  - [ ] Create `/payload/hooks/revalidate.ts`
  - [ ] Trigger Next.js revalidation on content updates
  
  ```typescript
  export const revalidateAfterChange = async ({
    doc,
    req,
    operation,
  }) => {
    if (operation === 'create' || operation === 'update') {
      const revalidateEndpoint = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate`
      
      await fetch(revalidateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REVALIDATION_SECRET}`,
        },
        body: JSON.stringify({
          path: `/products/${doc.slug}`,
        }),
      })
    }
  }
  ```
  
  - [ ] Add hook to Products afterChange
  - [ ] Add hook to Blog Posts afterChange

- [ ] **Create Order Number Generation Hook**
  - [ ] Create `/payload/hooks/generateOrderNumber.ts`
  - [ ] Auto-generate unique order numbers
  - [ ] Format: ORD-YYYYMMDD-XXXX
  - [ ] Add to Orders beforeValidate

#### Day 4: Access Control

- [ ] **Configure Admin Access Control**
  - [ ] Create `/payload/access/isAdmin.ts`
  - [ ] Create `/payload/access/isAdminOrSelf.ts`
  - [ ] Create `/payload/access/isPublished.ts`

- [ ] **Apply Access Control to Collections**
  - [ ] Products: Public read (published only), admin write
  - [ ] Blog Posts: Public read (published only), admin write
  - [ ] Orders: Admin only
  - [ ] Categories/Tags: Public read, admin write
  - [ ] Pages: Public read, admin write

- [ ] **Test Access Control**
  - [ ] Test as anonymous user
  - [ ] Test as logged-in user
  - [ ] Test as admin
  - [ ] Verify RLS policies work

#### Day 5: Testing & Documentation

- [ ] **Test All Collections**
  - [ ] Create test products (10+)
  - [ ] Upload test images
  - [ ] Create test blog posts (5+)
  - [ ] Create categories and tags
  - [ ] Test relationships

- [ ] **Test Admin UI**
  - [ ] Test all CRUD operations
  - [ ] Test file uploads
  - [ ] Test image optimization
  - [ ] Test slug generation
  - [ ] Test scheduling (publishAt)

- [ ] **Document CMS Structure**
  - [ ] Document all collections
  - [ ] Document all globals
  - [ ] Document hooks
  - [ ] Create user guide for content managers

- [ ] **Optimize Payload Performance**
  - [ ] Add pagination to collections
  - [ ] Optimize queries
  - [ ] Add indexes where needed

---

## Phase 3: Frontend Pages (Weeks 5-6)

**Goal:** Build all frontend pages and components with static generation

### Week 5: Core Layout & Components

#### Day 1: Layout Components

- [ ] **Create Root Layout**
  - [ ] Create `/app/layout.tsx`
  - [ ] Add HTML structure
  - [ ] Include Tailwind styles
  - [ ] Add fonts (if custom)
  - [ ] Include metadata
  
  ```typescript
  export const metadata: Metadata = {
    title: {
      default: 'Template Marketplace',
      template: '%s | Template Marketplace',
    },
    description: 'Professional templates for every need',
  }
  ```

- [ ] **Create Header Component**
  - [ ] Create `/components/layout/Header.tsx`
  - [ ] Logo
  - [ ] Navigation menu
  - [ ] Search bar
  - [ ] Cart icon with count
  - [ ] Mobile menu (hamburger)
  - [ ] Fetch navigation from Payload Header global
  
  ```typescript
  const Header = async () => {
    const header = await payload.findGlobal({
      slug: 'header',
    })
    
    return (
      <header>
        {/* Render navigation */}
      </header>
    )
  }
  ```

- [ ] **Create Footer Component**
  - [ ] Create `/components/layout/Footer.tsx`
  - [ ] Footer columns
  - [ ] Social links
  - [ ] Copyright text
  - [ ] Fetch from Payload Footer global

- [ ] **Create Navigation Component**
  - [ ] Create `/components/layout/Navigation.tsx`
  - [ ] Desktop navigation
  - [ ] Mobile navigation (Sheet/Drawer)
  - [ ] Active link styling

#### Day 2: Reusable Components

- [ ] **Create ProductCard Component**
  - [ ] Create `/components/product/ProductCard.tsx`
  - [ ] Product image with hover effect
  - [ ] Title, price, category
  - [ ] Add to cart button
  - [ ] Quick view button (optional)
  - [ ] Rating display (Phase 2)
  
  ```typescript
  interface ProductCardProps {
    id: string
    title: string
    slug: string
    price: number
    compareAtPrice?: number
    image: string
    category: string
  }
  ```

- [ ] **Create ProductGrid Component**
  - [ ] Create `/components/product/ProductGrid.tsx`
  - [ ] Responsive grid (1-2-4 columns)
  - [ ] Render array of ProductCards
  - [ ] Empty state

- [ ] **Create SearchBar Component**
  - [ ] Create `/components/common/SearchBar.tsx`
  - [ ] Input with icon
  - [ ] Autocomplete (Phase 2)
  - [ ] Submit handler
  - [ ] Clear button

- [ ] **Create Breadcrumbs Component**
  - [ ] Create `/components/common/Breadcrumbs.tsx`
  - [ ] Generate breadcrumbs from pathname
  - [ ] Schema markup for SEO
  - [ ] Link styling

- [ ] **Create LoadingSpinner Component**
  - [ ] Create `/components/common/LoadingSpinner.tsx`
  - [ ] Animated spinner
  - [ ] Different sizes
  - [ ] Use Lucide icons

#### Day 3: Homepage

- [ ] **Create Homepage**
  - [ ] Create `/app/(storefront)/page.tsx`
  
  ```typescript
  export default async function HomePage() {
    // Fetch featured products
    const { docs: featuredProducts } = await payload.find({
      collection: 'products',
      where: {
        status: { equals: 'published' },
      },
      limit: 12,
    })
    
    // Fetch featured categories
    const { docs: categories } = await payload.find({
      collection: 'categories',
      where: {
        isFeatured: { equals: true },
      },
    })
    
    return (
      <main>
        <HeroSection />
        <CategoriesShowcase categories={categories} />
        <FeaturedProducts products={featuredProducts} />
        <WhyChooseUs />
        <RecentBlogPosts />
        <Newsletter />
      </main>
    )
  }
  ```

- [ ] **Create HeroSection Component**
  - [ ] Create `/components/home/HeroSection.tsx`
  - [ ] Headline and subheadline
  - [ ] CTA buttons
  - [ ] Hero image/video
  - [ ] Responsive design

- [ ] **Create CategoriesShowcase Component**
  - [ ] Create `/components/home/CategoriesShowcase.tsx`
  - [ ] Grid of category cards
  - [ ] Category image, name, product count
  - [ ] Link to category page

- [ ] **Create FeaturedProducts Component**
  - [ ] Create `/components/home/FeaturedProducts.tsx`
  - [ ] Use ProductGrid
  - [ ] "View All" button

- [ ] **Test Homepage**
  - [ ] Verify all data loads
  - [ ] Test links
  - [ ] Test responsiveness
  - [ ] Check performance (Lighthouse)

#### Day 4: Product Listing Page

- [ ] **Create Products Page**
  - [ ] Create `/app/(storefront)/products/page.tsx`
  - [ ] Fetch all published products
  - [ ] Implement pagination or infinite scroll
  - [ ] Add filters (sidebar)
  - [ ] Add sorting
  
  ```typescript
  export default async function ProductsPage({
    searchParams,
  }: {
    searchParams: { page?: string; category?: string; sort?: string }
  }) {
    const page = parseInt(searchParams.page || '1')
    const perPage = 24
    
    const { docs: products, totalPages } = await payload.find({
      collection: 'products',
      where: {
        status: { equals: 'published' },
        ...(searchParams.category && {
          category: { equals: searchParams.category },
        }),
      },
      sort: searchParams.sort || '-createdAt',
      limit: perPage,
      page,
    })
    
    return (
      <div className="container">
        <h1>All Templates</h1>
        <div className="flex gap-8">
          <FilterSidebar />
          <div className="flex-1">
            <SortDropdown />
            <ProductGrid products={products} />
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Create FilterSidebar Component**
  - [ ] Create `/components/product/FilterSidebar.tsx`
  - [ ] Category filter
  - [ ] Price range filter
  - [ ] Format filter
  - [ ] Style filter
  - [ ] Apply filters via URL params
  - [ ] Clear filters button

- [ ] **Create SortDropdown Component**
  - [ ] Create `/components/product/SortDropdown.tsx`
  - [ ] Sort options (newest, price low-high, etc.)
  - [ ] Update URL params

- [ ] **Create Pagination Component**
  - [ ] Create `/components/common/Pagination.tsx`
  - [ ] Previous/Next buttons
  - [ ] Page numbers
  - [ ] Update URL params

#### Day 5: Category Pages

- [ ] **Create Category Page**
  - [ ] Create `/app/(storefront)/category/[slug]/page.tsx`
  - [ ] Fetch category by slug
  - [ ] Fetch products in category
  - [ ] Display category info (banner, description)
  - [ ] Use ProductGrid
  - [ ] Generate static params
  
  ```typescript
  export async function generateStaticParams() {
    const { docs: categories } = await payload.find({
      collection: 'categories',
      limit: 100,
    })
    
    return categories.map((category) => ({
      slug: category.slug,
    }))
  }
  
  export default async function CategoryPage({
    params,
  }: {
    params: { slug: string }
  }) {
    const { docs: categories } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: params.slug } },
    })
    
    const category = categories[0]
    
    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        category: { equals: category.id },
        status: { equals: 'published' },
      },
    })
    
    return (
      <div>
        <CategoryHero category={category} />
        <ProductGrid products={products} />
      </div>
    )
  }
  ```

- [ ] **Add Metadata Generation**
  - [ ] Use category SEO fields
  - [ ] OpenGraph tags
  - [ ] JSON-LD schema

- [ ] **Test Category Pages**
  - [ ] Test with multiple categories
  - [ ] Verify filtering works
  - [ ] Check breadcrumbs

### Week 6: Product Detail & Search

#### Day 1-2: Product Detail Page

- [ ] **Create Product Detail Page**
  - [ ] Create `/app/(storefront)/products/[slug]/page.tsx`
  - [ ] Fetch product by slug
  - [ ] Display all product info
  - [ ] Generate static params
  
  ```typescript
  export async function generateStaticParams() {
    const { docs: products } = await payload.find({
      collection: 'products',
      limit: 1000,
    })
    
    return products.map((product) => ({
      slug: product.slug,
    }))
  }
  
  export default async function ProductPage({
    params,
  }: {
    params: { slug: string }
  }) {
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: params.slug } },
      depth: 2, // Include related products
    })
    
    const product = docs[0]
    
    return (
      <div className="container">
        <Breadcrumbs />
        <div className="grid md:grid-cols-2 gap-8">
          <ProductGallery images={product.previewImages} />
          <ProductInfo product={product} />
        </div>
        <ProductTabs product={product} />
        <RelatedProducts products={product.relatedProducts} />
      </div>
    )
  }
  ```

- [ ] **Create ProductGallery Component**
  - [ ] Create `/components/product/ProductGallery.tsx`
  - [ ] Main image display
  - [ ] Thumbnail strip
  - [ ] Image zoom on hover
  - [ ] Lightbox (Dialog) for full-screen view
  - [ ] Use Next Image with optimization

- [ ] **Create ProductInfo Component**
  - [ ] Create `/components/product/ProductInfo.tsx`
  - [ ] Product title (H1)
  - [ ] Rating and review count
  - [ ] Price (with compare-at-price if discounted)
  - [ ] Feature list
  - [ ] Add to Cart button
  - [ ] Buy Now button
  - [ ] Category and tags
  - [ ] File format and size info

- [ ] **Create ProductTabs Component**
  - [ ] Create `/components/product/ProductTabs.tsx`
  - [ ] Use shadcn/ui Tabs
  - [ ] Description tab (render rich text)
  - [ ] Details tab (format, included files, etc.)
  - [ ] Reviews tab (Phase 2)

- [ ] **Create RelatedProducts Component**
  - [ ] Create `/components/product/RelatedProducts.tsx`
  - [ ] Display related products
  - [ ] Use ProductCard
  - [ ] Horizontal scroll on mobile

- [ ] **Add Metadata Generation**
  - [ ] Dynamic metadata with SEO fields
  - [ ] Product schema (JSON-LD)
  - [ ] OpenGraph tags

#### Day 3: Search Functionality

- [ ] **Create Search Results Page**
  - [ ] Create `/app/(storefront)/search/page.tsx`
  - [ ] Get query from URL params
  - [ ] Search products (full-text search)
  - [ ] Display results
  - [ ] No results state
  
  ```typescript
  export default async function SearchPage({
    searchParams,
  }: {
    searchParams: { q?: string }
  }) {
    const query = searchParams.q || ''
    
    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        or: [
          { title: { like: query } },
          { description: { like: query } },
          { keywords: { like: query } },
        ],
        status: { equals: 'published' },
      },
    })
    
    return (
      <div className="container">
        <h1>Search Results for "{query}"</h1>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <NoResults query={query} />
        )}
      </div>
    )
  }
  ```

- [ ] **Enhance SearchBar Component**
  - [ ] Submit handler to navigate to search page
  - [ ] Recent searches (localStorage)
  - [ ] Clear button

- [ ] **Create NoResults Component**
  - [ ] Create `/components/common/NoResults.tsx`
  - [ ] Friendly message
  - [ ] Suggestions
  - [ ] Link to popular categories

#### Day 4: Blog Pages

- [ ] **Create Blog Listing Page**
  - [ ] Create `/app/(storefront)/blog/page.tsx`
  - [ ] Fetch published blog posts
  - [ ] Display in grid
  - [ ] Pagination
  
  ```typescript
  export default async function BlogPage() {
    const { docs: posts } = await payload.find({
      collection: 'blog-posts',
      where: {
        status: { equals: 'published' },
        publishAt: { less_than_equal: new Date().toISOString() },
      },
      sort: '-publishAt',
      limit: 12,
    })
    
    return (
      <div className="container">
        <h1>Blog</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    )
  }
  ```

- [ ] **Create BlogCard Component**
  - [ ] Create `/components/blog/BlogCard.tsx`
  - [ ] Cover image
  - [ ] Title, excerpt
  - [ ] Author, date
  - [ ] Reading time
  - [ ] Category/tags

- [ ] **Create Blog Post Page**
  - [ ] Create `/app/(storefront)/blog/[slug]/page.tsx`
  - [ ] Fetch post by slug
  - [ ] Display full content
  - [ ] Generate static params
  - [ ] Add metadata
  
  ```typescript
  export default async function BlogPostPage({
    params,
  }: {
    params: { slug: string }
  }) {
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: params.slug } },
    })
    
    const post = docs[0]
    
    return (
      <article className="container max-w-3xl">
        <header>
          <h1>{post.title}</h1>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{formatDate(post.publishAt)}</span>
            <span>{post.readingTime} min read</span>
          </div>
        </header>
        {post.coverImage && (
          <Image src={post.coverImage.url} alt={post.title} />
        )}
        <div className="prose">
          {/* Render rich text content */}
          {renderRichText(post.content)}
        </div>
        <footer>
          <ShareButtons />
          <RelatedPosts />
        </footer>
      </article>
    )
  }
  ```

- [ ] **Create Rich Text Renderer**
  - [ ] Create `/components/common/RichTextRenderer.tsx`
  - [ ] Handle Lexical JSON format
  - [ ] Render text, headings, lists, images
  - [ ] Apply Tailwind typography classes

#### Day 5: Static Pages & Testing

- [ ] **Create Dynamic Page Route**
  - [ ] Create `/app/(storefront)/[slug]/page.tsx`
  - [ ] Fetch page by slug
  - [ ] Render content
  - [ ] Handle About, Terms, Privacy, Contact pages
  
  ```typescript
  export async function generateStaticParams() {
    const { docs: pages } = await payload.find({
      collection: 'pages',
      where: { status: { equals: 'published' } },
    })
    
    return pages.map((page) => ({
      slug: page.slug,
    }))
  }
  ```

- [ ] **Create 404 Page**
  - [ ] Create `/app/not-found.tsx`
  - [ ] Friendly 404 message
  - [ ] Search bar
  - [ ] Popular categories links
  - [ ] Home button

- [ ] **Test All Pages**
  - [ ] Test homepage
  - [ ] Test product listing
  - [ ] Test product detail
  - [ ] Test category pages
  - [ ] Test search
  - [ ] Test blog pages
  - [ ] Test 404

- [ ] **Performance Testing**
  - [ ] Run Lighthouse on all pages
  - [ ] Check Core Web Vitals
  - [ ] Optimize images if needed
  - [ ] Check bundle size

---

## Phase 4: E-Commerce & Payments (Weeks 7-9)

**Goal:** Implement shopping cart, checkout flow, and payment processing

### Week 7: Shopping Cart

#### Day 1-2: Cart State Management

- [ ] **Create Cart Context/Store**
  - [ ] Create `/lib/cart/store.ts` (using Zustand)
  
  ```typescript
  import { create } from 'zustand'
  import { persist } from 'zustand/middleware'
  
  interface CartItem {
    id: string
    productId: string
    title: string
    price: number
    image: string
    slug: string
  }
  
  interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    clearCart: () => void
    getTotal: () => number
    getItemCount: () => number
  }
  
  export const useCart = create<CartStore>()(
    persist(
      (set, get) => ({
        items: [],
        
        addItem: (item) => {
          const items = get().items
          const existingItem = items.find((i) => i.id === item.id)
          
          if (existingItem) {
            // Already in cart, don't add duplicate
            return
          }
          
          set({ items: [...items, item] })
        },
        
        removeItem: (id) => {
          set({ items: get().items.filter((i) => i.id !== id) })
        },
        
        clearCart: () => {
          set({ items: [] })
        },
        
        getTotal: () => {
          return get().items.reduce((sum, item) => sum + item.price, 0)
        },
        
        getItemCount: () => {
          return get().items.length
        },
      }),
      {
        name: 'cart-storage',
      }
    )
  )
  ```

- [ ] **Test Cart Store**
  - [ ] Test add item
  - [ ] Test remove item
  - [ ] Test persistence (localStorage)
  - [ ] Test cart total calculation

#### Day 3: Cart UI Components

- [ ] **Create CartDrawer Component**
  - [ ] Create `/components/cart/CartDrawer.tsx`
  - [ ] Use shadcn/ui Sheet component
  - [ ] Display cart items
  - [ ] Cart summary (subtotal, total)
  - [ ] View Cart and Checkout buttons
  
  ```typescript
  'use client'
  
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
  import { useCart } from '@/lib/cart/store'
  import { CartItem } from './CartItem'
  
  export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { items, getTotal } = useCart()
    
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Your Cart ({items.length})</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">${getTotal().toFixed(2)}</span>
            </div>
            <Button className="w-full" asChild>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }
  ```

- [ ] **Create CartItem Component**
  - [ ] Create `/components/cart/CartItem.tsx`
  - [ ] Product image, title, price
  - [ ] Remove button
  - [ ] Link to product page

- [ ] **Create CartIcon Component**
  - [ ] Create `/components/cart/CartIcon.tsx`
  - [ ] Shopping cart icon with item count badge
  - [ ] Opens CartDrawer on click
  - [ ] Add to Header

- [ ] **Create Cart Page**
  - [ ] Create `/app/(storefront)/cart/page.tsx`
  - [ ] Full cart view
  - [ ] Update quantities (if allowing multiple)
  - [ ] Apply coupon code (Phase 2)
  - [ ] Proceed to Checkout button

#### Day 4: Add to Cart Functionality

- [ ] **Add "Add to Cart" Button to ProductCard**
  - [ ] Update ProductCard component
  - [ ] Client component for interactivity
  - [ ] Call useCart().addItem()
  - [ ] Toast notification on add

- [ ] **Add "Add to Cart" Button to Product Page**
  - [ ] Update ProductInfo component
  - [ ] Prominent CTA button
  - [ ] Toast notification
  - [ ] Disable if already in cart

- [ ] **Create "Buy Now" Button**
  - [ ] Add to ProductInfo
  - [ ] Add to cart and redirect to checkout immediately

- [ ] **Create Toast Notifications**
  - [ ] Install sonner: `npm install sonner`
  - [ ] Add Toaster to root layout
  - [ ] Show success message on add to cart
  - [ ] Show error messages

#### Day 5: Testing Cart

- [ ] **Test Cart Functionality**
  - [ ] Add multiple products
  - [ ] Remove products
  - [ ] Verify persistence
  - [ ] Test cart drawer open/close
  - [ ] Test cart page
  - [ ] Test on mobile

- [ ] **Cart Error Handling**
  - [ ] Handle unavailable products
  - [ ] Handle price changes
  - [ ] Validate cart before checkout

### Week 8: Checkout & Payments

#### Day 1: Stripe Setup

- [ ] **Set Up Stripe Account**
  - [ ] Create Stripe account at https://stripe.com
  - [ ] Get test API keys
  - [ ] Add to .env.local

- [ ] **Install Stripe**
  ```bash
  npm install stripe @stripe/stripe-js
  ```

- [ ] **Create Stripe Client**
  - [ ] Create `/lib/stripe/client.ts`
  
  ```typescript
  import Stripe from 'stripe'
  
  export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })
  ```

- [ ] **Create Stripe Utilities**
  - [ ] Create `/lib/stripe/utils.ts`
  - [ ] formatAmount function
  - [ ] Price formatting helpers

#### Day 2: Checkout Page

- [ ] **Create Checkout Page**
  - [ ] Create `/app/(storefront)/checkout/page.tsx`
  - [ ] Check if cart is empty (redirect if so)
  - [ ] Display order summary
  - [ ] Customer information form
  - [ ] Payment method selection
  
  ```typescript
  'use client'
  
  export default function CheckoutPage() {
    const { items, getTotal } = useCart()
    const [isLoading, setIsLoading] = useState(false)
    
    if (items.length === 0) {
      redirect('/products')
    }
    
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <CheckoutForm onSubmit={handleCheckout} />
          </div>
          <div>
            <OrderSummary items={items} total={getTotal()} />
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Create CheckoutForm Component**
  - [ ] Create `/components/checkout/CheckoutForm.tsx`
  - [ ] Use react-hook-form + zod
  - [ ] Fields: email, name
  - [ ] Payment method radio (Stripe/PayPal)
  - [ ] Submit button
  
  ```typescript
  const checkoutSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    paymentMethod: z.enum(['stripe', 'paypal']),
  })
  ```

- [ ] **Create OrderSummary Component**
  - [ ] Create `/components/checkout/OrderSummary.tsx`
  - [ ] List all cart items
  - [ ] Subtotal, tax (if applicable), total
  - [ ] Sticky on desktop

#### Day 3: Stripe Checkout Integration

- [ ] **Create Stripe Checkout Session API**
  - [ ] Create `/app/api/checkout/stripe/route.ts`
  
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { stripe } from '@/lib/stripe/client'
  import { supabaseAdmin } from '@/lib/supabase/server'
  
  export async function POST(req: NextRequest) {
    try {
      const body = await req.json()
      const { items, customerEmail, customerName } = body
      
      // Verify items exist and get current prices
      const productIds = items.map((item: any) => item.productId)
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', productIds)
      
      // Create line items for Stripe
      const lineItems = products.map((product) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            images: [product.preview_images[0]?.url],
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: 1,
      }))
      
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail,
        line_items: lineItems,
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout`,
        metadata: {
          customerName,
          productIds: productIds.join(','),
        },
      })
      
      return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error) {
      console.error('Stripe checkout error:', error)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
  }
  ```

- [ ] **Handle Checkout Submission**
  - [ ] Update CheckoutForm to call API
  - [ ] Redirect to Stripe Checkout
  - [ ] Handle errors

- [ ] **Test Stripe Checkout**
  - [ ] Use test card: 4242 4242 4242 4242
  - [ ] Complete payment
  - [ ] Verify redirect to success URL

#### Day 4: Stripe Webhook

- [ ] **Create Stripe Webhook Endpoint**
  - [ ] Create `/app/api/webhooks/stripe/route.ts`
  
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { stripe } from '@/lib/stripe/client'
  import { supabaseAdmin } from '@/lib/supabase/server'
  import Stripe from 'stripe'
  
  export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!
    
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }
    
    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Create order in database
      const orderNumber = generateOrderNumber()
      const downloadToken = generateSecureToken()
      
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_email: session.customer_email,
          customer_name: session.metadata?.customerName,
          total_amount: session.amount_total! / 100,
          payment_method: 'stripe',
          payment_status: 'completed',
          payment_intent_id: session.payment_intent as string,
          download_token: downloadToken,
          download_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          status: 'completed',
        })
        .select()
        .single()
      
      if (error) {
        console.error('Order creation error:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }
      
      // Create order items
      const productIds = session.metadata?.productIds?.split(',') || []
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', productIds)
      
      const orderItems = products.map((product) => ({
        order_id: order.id,
        product_id: product.id,
        product_title: product.title,
        product_price: product.price,
        file_url: product.file_url,
      }))
      
      await supabaseAdmin.from('order_items').insert(orderItems)
      
      // Send confirmation email
      await sendOrderConfirmationEmail({
        email: session.customer_email!,
        orderNumber,
        downloadToken,
        items: products,
      })
      
      return NextResponse.json({ received: true })
    }
    
    return NextResponse.json({ received: true })
  }
  ```

- [ ] **Set Up Stripe Webhook in Dashboard**
  - [ ] Go to Stripe Dashboard > Webhooks
  - [ ] Add endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
  - [ ] Select events: `checkout.session.completed`
  - [ ] Copy webhook secret to .env.local

- [ ] **Test Webhook Locally**
  - [ ] Install Stripe CLI: https://stripe.com/docs/stripe-cli
  - [ ] Forward webhooks to local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - [ ] Complete test payment
  - [ ] Verify order created in database

#### Day 5: PayPal Integration

- [ ] **Set Up PayPal Developer Account**
  - [ ] Create account at https://developer.paypal.com
  - [ ] Create sandbox app
  - [ ] Get client ID and secret
  - [ ] Add to .env.local

- [ ] **Install PayPal SDK**
  ```bash
  npm install @paypal/checkout-server-sdk @paypal/react-paypal-js
  ```

- [ ] **Create PayPal Client**
  - [ ] Create `/lib/paypal/client.ts`
  
  ```typescript
  import paypal from '@paypal/checkout-server-sdk'
  
  const environment = new paypal.core.SandboxEnvironment(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_CLIENT_SECRET!
  )
  
  export const paypalClient = new paypal.core.PayPalHttpClient(environment)
  ```

- [ ] **Create PayPal Order API**
  - [ ] Create `/app/api/checkout/paypal/route.ts`
  - [ ] Similar to Stripe, create order with line items
  - [ ] Return approval URL

- [ ] **Create PayPal Webhook Handler**
  - [ ] Create `/app/api/webhooks/paypal/route.ts`
  - [ ] Handle PAYMENT.CAPTURE.COMPLETED event
  - [ ] Create order in database
  - [ ] Send confirmation email

- [ ] **Add PayPal Button to Checkout**
  - [ ] Use @paypal/react-paypal-js
  - [ ] Render PayPal buttons
  - [ ] Handle onApprove callback

- [ ] **Test PayPal Flow**
  - [ ] Use PayPal sandbox buyer account
  - [ ] Complete payment
  - [ ] Verify order creation

### Week 9: Order Management & Downloads

#### Day 1-2: Order Confirmation Page

- [ ] **Create Order Confirmation Page**
  - [ ] Create `/app/(storefront)/order-confirmation/page.tsx`
  - [ ] Get session_id from URL
  - [ ] Fetch order details from database
  - [ ] Display order number, items, total
  - [ ] Display download links
  
  ```typescript
  export default async function OrderConfirmationPage({
    searchParams,
  }: {
    searchParams: { session_id?: string; order_number?: string }
  }) {
    let order
    
    if (searchParams.session_id) {
      // Fetch order by Stripe session
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)
      order = await getOrderByPaymentIntentId(session.payment_intent as string)
    } else if (searchParams.order_number) {
      order = await getOrderByOrderNumber(searchParams.order_number)
    }
    
    if (!order) {
      notFound()
    }
    
    const orderItems = await getOrderItems(order.id)
    
    return (
      <div className="container max-w-2xl py-16">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Your order number is: <strong>{order.order_number}</strong>
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <span>{item.product_title}</span>
                <span>${item.product_price.toFixed(2)}</span>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Download Your Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your download links are valid for 48 hours. You can download each file up to 5 times.
            </p>
            {orderItems.map((item) => (
              <DownloadButton
                key={item.id}
                orderId={order.id}
                productId={item.product_id}
                productTitle={item.product_title}
              />
            ))}
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          A confirmation email has been sent to {order.customer_email}
        </p>
      </div>
    )
  }
  ```

- [ ] **Create DownloadButton Component**
  - [ ] Create `/components/download/DownloadButton.tsx`
  - [ ] Call download API
  - [ ] Track download count
  - [ ] Disable after limit reached
  - [ ] Show loading state

#### Day 3: Download System

- [ ] **Create Download API**
  - [ ] Create `/app/api/download/generate/route.ts`
  
  ```typescript
  export async function POST(req: NextRequest) {
    const { orderId, productId } = await req.json()
    
    // Verify order and product
    const { data: orderItem } = await supabaseAdmin
      .from('order_items')
      .select('*, orders(*)')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .single()
    
    if (!orderItem) {
      return NextResponse.json({ error: 'Invalid order or product' }, { status: 404 })
    }
    
    // Check download limit
    if (orderItem.orders.download_count >= orderItem.orders.download_limit) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 403 })
    }
    
    // Check expiration
    if (new Date(orderItem.orders.download_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Download link expired' }, { status: 410 })
    }
    
    // Generate signed URL from Supabase Storage
    const { data: signedUrl } = await supabaseAdmin.storage
      .from('templates')
      .createSignedUrl(orderItem.file_url, 3600) // 1 hour expiration
    
    // Increment download count
    await supabaseAdmin
      .from('orders')
      .update({ download_count: orderItem.orders.download_count + 1 })
      .eq('id', orderId)
    
    return NextResponse.json({ downloadUrl: signedUrl.signedUrl })
  }
  ```

- [ ] **Create Download Page (with token)**
  - [ ] Create `/app/(storefront)/downloads/[token]/page.tsx`
  - [ ] Verify download token
  - [ ] Display order items
  - [ ] Provide download buttons
  - [ ] Show download count and expiration

#### Day 4: Email Notifications

- [ ] **Set Up Resend**
  - [ ] Create account at https://resend.com
  - [ ] Get API key
  - [ ] Add to .env.local
  - [ ] Verify domain (if using custom)

- [ ] **Install React Email**
  ```bash
  npm install resend react-email @react-email/components
  ```

- [ ] **Create Email Templates**
  - [ ] Create `/emails/OrderConfirmation.tsx`
  
  ```typescript
  import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
  } from '@react-email/components'
  
  interface OrderConfirmationEmailProps {
    orderNumber: string
    customerName: string
    items: Array<{ title: string; price: number }>
    total: number
    downloadUrl: string
  }
  
  export default function OrderConfirmationEmail({
    orderNumber,
    customerName,
    items,
    total,
    downloadUrl,
  }: OrderConfirmationEmailProps) {
    return (
      <Html>
        <Head />
        <Preview>Your order {orderNumber} has been confirmed</Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={h1}>Thank you for your order!</Heading>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              Your order <strong>{orderNumber}</strong> has been confirmed.
            </Text>
            
            {/* Order items */}
            {items.map((item, index) => (
              <div key={index}>
                <Text>{item.title} - ${item.price.toFixed(2)}</Text>
              </div>
            ))}
            
            <Text style={text}>
              <strong>Total: ${total.toFixed(2)}</strong>
            </Text>
            
            <Link href={downloadUrl} style={button}>
              Download Your Templates
            </Link>
            
            <Text style={footer}>
              This download link is valid for 48 hours.
            </Text>
          </Container>
        </Body>
      </Html>
    )
  }
  
  // Styles...
  ```

- [ ] **Create Email Service**
  - [ ] Create `/lib/email/send.ts`
  
  ```typescript
  import { Resend } from 'resend'
  import OrderConfirmationEmail from '@/emails/OrderConfirmation'
  
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  export async function sendOrderConfirmationEmail({
    email,
    orderNumber,
    customerName,
    items,
    total,
    downloadToken,
  }: any) {
    const downloadUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/downloads/${downloadToken}`
    
    await resend.emails.send({
      from: 'orders@yourdomain.com',
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber,
        customerName,
        items,
        total,
        downloadUrl,
      }),
    })
  }
  ```

- [ ] **Integrate Email Sending**
  - [ ] Call in Stripe webhook after order creation
  - [ ] Call in PayPal webhook after order creation
  - [ ] Test email delivery

#### Day 5: Testing & Error Handling

- [ ] **Test Complete Purchase Flow**
  - [ ] Add products to cart
  - [ ] Go to checkout
  - [ ] Complete payment (Stripe)
  - [ ] Verify order confirmation page
  - [ ] Test downloads
  - [ ] Verify email received
  - [ ] Repeat with PayPal

- [ ] **Error Handling**
  - [ ] Handle payment failures
  - [ ] Handle webhook failures
  - [ ] Handle download errors
  - [ ] Handle email failures
  - [ ] Add retry logic for webhooks

- [ ] **Clear Cart After Purchase**
  - [ ] Clear cart on successful order
  - [ ] Add to order confirmation page

- [ ] **Security Audit**
  - [ ] Verify all API routes are protected
  - [ ] Check rate limiting
  - [ ] Verify signed URL security
  - [ ] Check webhook signature verification

---

## Phase 5: Content & SEO (Weeks 10-11)

**Goal:** Implement comprehensive SEO, structured data, and sitemap generation

### Week 10: SEO Implementation

#### Day 1-2: Metadata Generation

- [ ] **Create Metadata Utilities**
  - [ ] Create `/lib/seo/metadata.ts`
  
  ```typescript
  import { Metadata } from 'next'
  
  export function generateMetadata({
    title,
    description,
    image,
    url,
    type = 'website',
  }: {
    title: string
    description: string
    image?: string
    url: string
    type?: string
  }): Metadata {
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type,
        images: image ? [{ url: image }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
      },
      alternates: {
        canonical: url,
      },
    }
  }
  ```

- [ ] **Add Metadata to All Pages**
  - [ ] Homepage: generateMetadata with site defaults
  - [ ] Product pages: Use product SEO fields
  - [ ] Category pages: Use category SEO fields
  - [ ] Blog posts: Use post SEO fields
  - [ ] Static pages: Use page SEO fields

- [ ] **Product Page Metadata**
  - [ ] Create generateMetadata function
  
  ```typescript
  export async function generateMetadata({
    params,
  }: {
    params: { slug: string }
  }): Promise<Metadata> {
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: params.slug } },
    })
    
    const product = docs[0]
    
    return generateMetadata({
      title: product.seo?.metaTitle || product.title,
      description: product.seo?.metaDescription || product.shortDescription,
      image: product.previewImages[0]?.url,
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/products/${product.slug}`,
      type: 'product',
    })
  }
  ```

- [ ] **Add OpenGraph Images**
  - [ ] Generate OG images for products (use previewImages)
  - [ ] Generate OG images for blog posts (use coverImage)
  - [ ] Create default OG image for pages without custom image

#### Day 3: Structured Data (JSON-LD)

- [ ] **Create Structured Data Utilities**
  - [ ] Create `/lib/seo/structured-data.ts`
  
  ```typescript
  export function generateProductSchema(product: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.shortDescription,
      image: product.previewImages.map((img: any) => img.url),
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: product.ratingAverage ? {
        '@type': 'AggregateRating',
        ratingValue: product.ratingAverage,
        reviewCount: product.ratingCount,
      } : undefined,
    }
  }
  
  export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }
  }
  
  export function generateArticleSchema(post: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: post.coverImage?.url,
      datePublished: post.publishAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author?.name,
      },
    }
  }
  ```

- [ ] **Add Structured Data to Pages**
  - [ ] Product pages: Product schema + Breadcrumb schema
  - [ ] Category pages: CollectionPage schema
  - [ ] Blog posts: Article schema
  - [ ] Homepage: Organization schema

- [ ] **Create StructuredData Component**
  - [ ] Create `/components/seo/StructuredData.tsx`
  
  ```typescript
  export function StructuredData({ data }: { data: any }) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    )
  }
  ```

- [ ] **Test Structured Data**
  - [ ] Use Google Rich Results Test: https://search.google.com/test/rich-results
  - [ ] Verify all schemas are valid
  - [ ] Check for warnings

#### Day 4: Sitemap & Robots.txt

- [ ] **Generate Dynamic Sitemap**
  - [ ] Create `/app/sitemap.ts`
  
  ```typescript
  import { MetadataRoute } from 'next'
  import payload from 'payload'
  
  export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!
    
    // Static routes
    const routes = [
      '',
      '/products',
      '/blog',
      '/about',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
    
    // Product pages
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { status: { equals: 'published' } },
      limit: 10000,
    })
    
    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    
    // Category pages
    const { docs: categories } = await payload.find({
      collection: 'categories',
      limit: 1000,
    })
    
    const categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
    
    // Blog posts
    const { docs: posts } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 10000,
    })
    
    const blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
    
    return [...routes, ...productRoutes, ...categoryRoutes, ...blogRoutes]
  }
  ```

- [ ] **Create robots.txt**
  - [ ] Create `/app/robots.ts`
  
  ```typescript
  import { MetadataRoute } from 'next'
  
  export default function robots(): MetadataRoute.Robots {
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin/', '/api/', '/downloads/'],
        },
      ],
      sitemap: `${process.env.NEXT_PUBLIC_SERVER_URL}/sitemap.xml`,
    }
  }
  ```

- [ ] **Test Sitemap**
  - [ ] Access /sitemap.xml
  - [ ] Verify all URLs are present
  - [ ] Check formatting

#### Day 5: Performance & Accessibility

- [ ] **Image Optimization**
  - [ ] Ensure all images use Next.js Image component
  - [ ] Add proper alt text to all images
  - [ ] Use placeholder blur
  - [ ] Lazy load images below the fold
  - [ ] Optimize image sizes (WebP format)

- [ ] **Accessibility Audit**
  - [ ] Run Lighthouse accessibility audit
  - [ ] Add ARIA labels where needed
  - [ ] Ensure keyboard navigation works
  - [ ] Check color contrast (4.5:1 minimum)
  - [ ] Add skip to content link
  - [ ] Test with screen reader (NVDA/VoiceOver)

- [ ] **Performance Optimization**
  - [ ] Run Lighthouse performance audit
  - [ ] Optimize Core Web Vitals
  - [ ] Add loading skeletons
  - [ ] Implement route prefetching
  - [ ] Analyze bundle size: `npm run build -- --analyze`
  - [ ] Remove unused dependencies

### Week 11: Analytics & Final SEO

#### Day 1-2: Analytics Integration

- [ ] **Set Up Google Analytics 4**
  - [ ] Create GA4 property
  - [ ] Get Measurement ID
  - [ ] Install @next/third-parties: `npm install @next/third-parties`
  - [ ] Add to root layout
  
  ```typescript
  import { GoogleAnalytics } from '@next/third-parties/google'
  
  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          {children}
          <GoogleAnalytics gaId="G-XXXXXXXXXX" />
        </body>
      </html>
    )
  }
  ```

- [ ] **Set Up Vercel Analytics** (if using Vercel)
  ```bash
  npm install @vercel/analytics
  ```
  
  - [ ] Add to root layout
  
  ```typescript
  import { Analytics } from '@vercel/analytics/react'
  
  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          {children}
          <Analytics />
        </body>
      </html>
    )
  }
  ```

- [ ] **Configure E-Commerce Tracking**
  - [ ] Track add_to_cart events
  - [ ] Track begin_checkout events
  - [ ] Track purchase events
  - [ ] Create tracking utilities
  
  ```typescript
  export function trackAddToCart(product: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            item_category: product.category,
            price: product.price,
          },
        ],
      })
    }
  }
  
  export function trackPurchase(order: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.orderNumber,
        value: order.total,
        currency: 'USD',
        items: order.items.map((item: any) => ({
          item_id: item.productId,
          item_name: item.title,
          price: item.price,
        })),
      })
    }
  }
  ```

- [ ] **Add Tracking to Components**
  - [ ] Add to cart button: trackAddToCart
  - [ ] Checkout page: trackBeginCheckout
  - [ ] Order confirmation: trackPurchase

#### Day 3: Google Search Console Setup

- [ ] **Set Up Google Search Console**
  - [ ] Go to https://search.google.com/search-console
  - [ ] Add property (domain or URL prefix)
  - [ ] Verify ownership (DNS or HTML file)
  - [ ] Submit sitemap

- [ ] **Configure Search Console**
  - [ ] Check for crawl errors
  - [ ] Monitor index coverage
  - [ ] Check Core Web Vitals
  - [ ] View search performance

#### Day 4-5: Content Optimization & Testing

- [ ] **Content Population**
  - [ ] Upload 50+ products via CMS
  - [ ] Write product descriptions (SEO-optimized)
  - [ ] Add feature lists
  - [ ] Upload high-quality images
  - [ ] Set proper categories and tags

- [ ] **Blog Content**
  - [ ] Write 10+ blog posts
  - [ ] Focus on target keywords
  - [ ] Include internal links to products
  - [ ] Add images with alt text
  - [ ] Schedule posts

- [ ] **SEO Audit**
  - [ ] Run full Lighthouse audit on all page types
  - [ ] Check all meta tags are present
  - [ ] Verify structured data is correct
  - [ ] Check canonical URLs
  - [ ] Verify no duplicate content
  - [ ] Check heading hierarchy

- [ ] **Cross-Browser Testing**
  - [ ] Test in Chrome, Firefox, Safari, Edge
  - [ ] Test on mobile devices (iOS, Android)
  - [ ] Test different screen sizes
  - [ ] Fix any browser-specific issues

---

## Phase 6: Polish & Launch (Weeks 12-14)

**Goal:** Final testing, optimization, and production deployment

### Week 12: UI/UX Polish

#### Day 1-2: UI Refinement

- [ ] **Loading States**
  - [ ] Add loading skeletons to all pages
  - [ ] Use Suspense boundaries
  - [ ] Add loading spinners to buttons
  - [ ] Show loading for async operations

- [ ] **Empty States**
  - [ ] Empty cart message
  - [ ] No search results
  - [ ] No products in category
  - [ ] Empty blog

- [ ] **Animations & Transitions**
  - [ ] Add page transitions (optional)
  - [ ] Button hover effects
  - [ ] Card hover effects
  - [ ] Smooth scroll
  - [ ] Toast animations

- [ ] **Error States**
  - [ ] 404 page (already done)
  - [ ] 500 error page
  - [ ] Form validation errors
  - [ ] Payment errors
  - [ ] Network errors

#### Day 3: Mobile Optimization

- [ ] **Mobile Navigation**
  - [ ] Test hamburger menu
  - [ ] Ensure touch targets are 44x44px minimum
  - [ ] Test swipe gestures
  - [ ] Optimize for thumb reach

- [ ] **Mobile Checkout**
  - [ ] Test checkout flow on mobile
  - [ ] Ensure form inputs are large enough
  - [ ] Test payment methods on mobile
  - [ ] Optimize button sizes

- [ ] **Mobile Performance**
  - [ ] Run Lighthouse on mobile
  - [ ] Optimize images for mobile
  - [ ] Test on slow 3G connection
  - [ ] Reduce JavaScript bundle for mobile

#### Day 4-5: Accessibility & Internationalization

- [ ] **Final Accessibility Check**
  - [ ] Run axe DevTools audit
  - [ ] Test keyboard navigation thoroughly
  - [ ] Test with screen reader
  - [ ] Check focus indicators
  - [ ] Verify ARIA labels
  - [ ] Test color contrast

- [ ] **i18n Preparation** (Optional for MVP)
  - [ ] Install next-intl: `npm install next-intl`
  - [ ] Set up translations structure
  - [ ] Extract hardcoded strings
  - [ ] Prepare for multi-language

### Week 13: Testing & QA

#### Day 1-2: Automated Testing

- [ ] **Set Up Testing Framework**
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```

- [ ] **Write E2E Tests**
  - [ ] Create `/tests/e2e/` folder
  - [ ] Test: Browse products
  - [ ] Test: Search products
  - [ ] Test: Add to cart
  - [ ] Test: Checkout flow (use test card)
  - [ ] Test: Blog navigation
  - [ ] Test: Filter products
  
  ```typescript
  // Example: tests/e2e/checkout.spec.ts
  import { test, expect } from '@playwright/test'
  
  test('complete purchase flow', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to product
    await page.click('text=CV Templates')
    await page.click('.product-card').first()
    
    // Add to cart
    await page.click('text=Add to Cart')
    await expect(page.locator('.cart-count')).toHaveText('1')
    
    // Go to checkout
    await page.click('.cart-icon')
    await page.click('text=Checkout')
    
    // Fill form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="name"]', 'Test User')
    
    // Complete checkout (mock)
    // ...
  })
  ```

- [ ] **Run All Tests**
  ```bash
  npx playwright test
  ```

- [ ] **Fix Failing Tests**

#### Day 3: Manual Testing

- [ ] **User Acceptance Testing (UAT)**
  - [ ] Test as guest user (full purchase flow)
  - [ ] Test as returning user (if auth implemented)
  - [ ] Test admin workflows in CMS
  - [ ] Test all product CRUD operations
  - [ ] Test blog CRUD operations

- [ ] **Payment Testing**
  - [ ] Test successful Stripe payment
  - [ ] Test failed Stripe payment
  - [ ] Test successful PayPal payment
  - [ ] Test payment cancellation
  - [ ] Verify webhooks fire correctly
  - [ ] Verify emails are sent

- [ ] **Edge Cases**
  - [ ] Empty cart checkout attempt
  - [ ] Expired download links
  - [ ] Download limit reached
  - [ ] Invalid discount codes (Phase 2)
  - [ ] Network errors during checkout

#### Day 4: Performance Testing

- [ ] **Load Testing**
  - [ ] Use k6 or Apache Bench
  - [ ] Test homepage load
  - [ ] Test product page load
  - [ ] Test checkout API
  - [ ] Test concurrent users

- [ ] **Database Performance**
  - [ ] Check slow queries
  - [ ] Add missing indexes
  - [ ] Optimize complex queries
  - [ ] Test with large dataset (1000+ products)

- [ ] **Caching Strategy**
  - [ ] Configure Next.js cache headers
  - [ ] Implement ISR for products
  - [ ] Set proper revalidation times
  - [ ] Test cache invalidation

#### Day 5: Security Audit

- [ ] **Security Testing**
  - [ ] SQL injection testing (should be prevented by Supabase)
  - [ ] XSS testing
  - [ ] CSRF protection
  - [ ] Rate limiting
  - [ ] API authentication
  - [ ] Webhook signature verification

- [ ] **Dependency Audit**
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **Environment Variables Check**
  - [ ] Verify no secrets in code
  - [ ] Check .env.example is updated
  - [ ] Verify production env vars

- [ ] **HTTPS & SSL**
  - [ ] Ensure HTTPS is enforced
  - [ ] Check SSL certificate
  - [ ] Test mixed content warnings

### Week 14: Deployment & Launch

#### Day 1-2: Production Setup

- [ ] **Set Up Production Database**
  - [ ] Create production Supabase project
  - [ ] Run migrations
  - [ ] Set up RLS policies
  - [ ] Create storage buckets
  - [ ] Configure backups

- [ ] **Set Up Production Payment Gateways**
  - [ ] Switch Stripe to live mode
  - [ ] Get live API keys
  - [ ] Switch PayPal to production
  - [ ] Test with real card (small amount)

- [ ] **Configure Production Environment**
  - [ ] Set up Vercel project (or hosting platform)
  - [ ] Add environment variables
  - [ ] Configure custom domain
  - [ ] Set up SSL certificate
  - [ ] Configure DNS

- [ ] **Set Up Email Service**
  - [ ] Verify domain in Resend
  - [ ] Set up SPF, DKIM, DMARC records
  - [ ] Test email delivery
  - [ ] Configure sending limits

#### Day 3: Pre-Launch Checklist

- [ ] **Content Checklist**
  - [ ] Upload all products (200+)
  - [ ] Publish blog posts (10+)
  - [ ] Create static pages (About, Terms, Privacy, Contact)
  - [ ] Set up navigation menus
  - [ ] Configure footer

- [ ] **SEO Checklist**
  - [ ] Submit sitemap to Google Search Console
  - [ ] Verify all meta tags
  - [ ] Check structured data
  - [ ] Set up Google Analytics
  - [ ] Create robots.txt
  - [ ] Set up redirects (if needed)

- [ ] **Legal Checklist**
  - [ ] Terms of Service page
  - [ ] Privacy Policy page
  - [ ] Refund Policy page
  - [ ] Cookie Policy page
  - [ ] GDPR compliance (if applicable)
  - [ ] Cookie consent banner

- [ ] **Technical Checklist**
  - [ ] Run final Lighthouse audit (90+ on all metrics)
  - [ ] Test all payment flows
  - [ ] Verify email notifications work
  - [ ] Test download system
  - [ ] Check error monitoring (Sentry)
  - [ ] Set up uptime monitoring

#### Day 4: Soft Launch

- [ ] **Deploy to Production**
  ```bash
  git push origin main
  # Or via Vercel CLI
  vercel --prod
  ```

- [ ] **Post-Deployment Checks**
  - [ ] Verify site is live
  - [ ] Test homepage loads
  - [ ] Test product pages load
  - [ ] Test checkout flow (real payment)
  - [ ] Verify emails are sent
  - [ ] Check analytics tracking

- [ ] **Smoke Testing**
  - [ ] Create test order
  - [ ] Download test files
  - [ ] Check order in admin
  - [ ] Verify webhook fired
  - [ ] Check database entry

- [ ] **Soft Launch to Small Audience**
  - [ ] Share with friends/family
  - [ ] Gather initial feedback
  - [ ] Monitor for errors
  - [ ] Fix critical bugs

#### Day 5: Public Launch

- [ ] **Final Pre-Launch Check**
  - [ ] Verify no test data in production
  - [ ] Check all prices are correct
  - [ ] Verify payment gateways are in live mode
  - [ ] Test one more complete purchase

- [ ] **Launch**
  - [ ] Announce on social media
  - [ ] Send email to subscribers (if list exists)
  - [ ] Submit to product directories
  - [ ] Share on relevant communities

- [ ] **Monitor Launch**
  - [ ] Watch error logs (Sentry)
  - [ ] Monitor analytics (real-time)
  - [ ] Check payment success rate
  - [ ] Respond to customer issues
  - [ ] Monitor site performance

- [ ] **Post-Launch Tasks**
  - [ ] Set up customer support system
  - [ ] Create FAQ page
  - [ ] Plan content calendar
  - [ ] Schedule social media posts
  - [ ] Plan email campaigns

---

## Post-Launch Tasks

### Week 15+: Optimization & Growth

#### Immediate (Week 15-16)

- [ ] **Monitor & Fix Issues**
  - [ ] Daily error log review
  - [ ] Fix critical bugs immediately
  - [ ] Monitor customer complaints
  - [ ] Optimize slow pages

- [ ] **Gather User Feedback**
  - [ ] Add feedback widget
  - [ ] Send survey to early customers
  - [ ] Monitor support tickets
  - [ ] Analyze user behavior (GA4)

- [ ] **SEO Monitoring**
  - [ ] Monitor Google Search Console
  - [ ] Track keyword rankings
  - [ ] Analyze top-performing content
  - [ ] Fix crawl errors

#### Phase 2 Features (Weeks 17-24)

- [ ] **User Accounts**
  - [ ] Implement Supabase Auth
  - [ ] User dashboard
  - [ ] Order history
  - [ ] Download library
  - [ ] Profile management

- [ ] **Review System**
  - [ ] Add reviews collection to Payload
  - [ ] Review submission form
  - [ ] Review moderation
  - [ ] Display reviews on product pages
  - [ ] Star rating aggregation

- [ ] **Wishlist**
  - [ ] Wishlist functionality
  - [ ] Save for later
  - [ ] Share wishlist
  - [ ] Wishlist email reminders

- [ ] **Advanced Search**
  - [ ] Integrate Algolia or Meilisearch
  - [ ] Autocomplete suggestions
  - [ ] Faceted search
  - [ ] Search analytics

- [ ] **Discount System**
  - [ ] Coupon code creation
  - [ ] Discount types (percentage, fixed)
  - [ ] Usage limits
  - [ ] Expiration dates
  - [ ] Apply at checkout

- [ ] **Email Marketing**
  - [ ] Newsletter subscription
  - [ ] Welcome email series
  - [ ] Abandoned cart emails
  - [ ] New product announcements
  - [ ] Integrate with Mailchimp/ConvertKit

#### Phase 3 Features (Weeks 25+)

- [ ] **Multi-Language Support**
  - [ ] Implement i18n
  - [ ] Translate content
  - [ ] Language switcher
  - [ ] Localized URLs

- [ ] **Affiliate Program**
  - [ ] Affiliate dashboard
  - [ ] Unique referral links
  - [ ] Commission tracking
  - [ ] Payout system

- [ ] **Advanced Analytics**
  - [ ] Custom analytics dashboard
  - [ ] Conversion funnel analysis
  - [ ] Customer lifetime value
  - [ ] A/B testing

- [ ] **Subscription Model**
  - [ ] Monthly/annual plans
  - [ ] Premium template access
  - [ ] Subscription management
  - [ ] Stripe subscriptions

---

## Notes for Developer

### Important Reminders

1. **Environment Variables:** Always use environment variables for secrets. Never commit `.env.local` to git.

2. **Error Handling:** Always wrap async operations in try-catch blocks and provide user-friendly error messages.

3. **TypeScript:** Use strict mode and avoid `any` types. Define proper interfaces for all data structures.

4. **Performance:** Use React Server Components by default. Only use 'use client' when necessary for interactivity.

5. **Accessibility:** Always test with keyboard navigation and include proper ARIA labels.

6. **Testing:** Write tests as you go, not at the end. Test critical paths first (checkout, payments).

7. **Git Workflow:** 
   - Create feature branches
   - Write descriptive commit messages
   - Use pull requests for code review
   - Squash commits before merging

8. **Documentation:** Document all API endpoints, custom hooks, and complex logic.

### Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript check

# Database
npx supabase db push       # Push migrations
npx supabase db reset      # Reset database (dev only)

# Testing
npm run test               # Run tests
npm run test:e2e           # Run E2E tests
npm run test:watch         # Run tests in watch mode

# Deployment
git push origin main       # Auto-deploy (Vercel)
vercel --prod              # Manual deploy
```

### Common Issues & Solutions

**Issue:** Payload CMS not connecting to Supabase
- Solution: Check DATABASE_URL format, ensure SSL mode is correct

**Issue:** Stripe webhook not firing locally
- Solution: Use Stripe CLI to forward webhooks to localhost

**Issue:** Images not optimizing
- Solution: Ensure Next.js Image component is used, check next.config.js

**Issue:** Cart not persisting
- Solution: Check localStorage permissions, ensure Zustand persist is configured

**Issue:** 404 on product pages after build
- Solution: Ensure generateStaticParams is implemented correctly

---

## Progress Tracking

Use this checklist to track your progress:

- [ ] Phase 1: Setup & Foundation (Weeks 1-2)
- [ ] Phase 2: CMS & Collections (Weeks 3-4)
- [ ] Phase 3: Frontend Pages (Weeks 5-6)
- [ ] Phase 4: E-Commerce & Payments (Weeks 7-9)
- [ ] Phase 5: Content & SEO (Weeks 10-11)
- [ ] Phase 6: Polish & Launch (Weeks 12-14)

**Current Phase:** _____________  
**Completion:** ____ / 14 weeks

---

## Support & Resources

**Documentation:**
- Next.js: https://nextjs.org/docs
- Payload CMS: https://payloadcms.com/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

**Community:**
- Next.js Discord
- Payload CMS Discord
- Supabase Discord
- Stack Overflow

---

**Last Updated:** November 28, 2025  
**Document Version:** 1.0

Good luck with the development! 🚀

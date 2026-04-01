# 📚 Payload CMS Admin Guide

**Template Marketplace - Complete Admin Documentation**

Last Updated: November 28, 2025

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Collections Overview](#collections-overview)
3. [Managing Products](#managing-products)
4. [Managing Orders](#managing-orders)
5. [Managing Users](#managing-users)
6. [Managing Reviews](#managing-reviews)
7. [Managing Blog Posts](#managing-blog-posts)
8. [Managing Coupons](#managing-coupons)
9. [Site Settings](#site-settings)
10. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Accessing the Admin Panel

1. Navigate to `http://localhost:3000/admin` (or your production domain)
2. Log in with your admin credentials
3. You'll see the Payload CMS dashboard

### Admin Dashboard Overview

The admin panel is organized into groups:

- **E-Commerce**: Products, Orders, Reviews, Coupons
- **Content**: Posts (Blog)
- **Media**: Media files, Template files
- **Taxonomy**: Categories, Tags
- **Admin**: Users, Settings

---

## 📦 Collections Overview

### Collection Hierarchy

```
Users (Authentication)
├── Products
│   ├── Categories
│   ├── Tags
│   └── Files (Download files)
├── Orders
│   └── Related to Users & Products
├── Reviews
│   └── Related to Products & Orders
├── Coupons
│   └── Related to Products & Categories
├── Posts (Blog)
└── Media (Images)
```

---

## 🛍️ Managing Products

### Creating a New Product

1. Go to **Products** → **Create New**
2. Fill in required fields:

**Basic Information:**
- **Title**: Product name (e.g., "Modern CV Template")
- **Slug**: URL-friendly version (auto-generated)
- **Short Description**: Brief summary (150-200 chars)
- **Description**: Full product description (rich text)
- **Price**: Product price in USD
- **Compare at Price**: Optional original price (for showing discounts)

**Media:**
- **Preview Images**: Upload 1-10 product preview images
  - First image is the main preview
  - Recommended: 1200x900px or 16:9 ratio
  - Add descriptive alt text for SEO

**Files:**
- **Download File**: Upload the actual template file
  - Supported formats: .docx, .pptx, .xlsx, .pdf, .zip
  - Max size: 10MB (configurable)

**Organization:**
- **Category**: Select one category (required)
- **Tags**: Add multiple tags for filtering
- **File Format**: Specify format (e.g., "Microsoft Word .docx")

**Features:**
- Add bullet points highlighting key features
- Example: "Customizable colors", "ATS-friendly", "Print-ready"

**Visibility:**
- **Status**: Draft, Published, Archived
- **Featured**: Check to show on homepage
- **Allow Reviews**: Enable/disable reviews

**SEO:**
- **Meta Title**: Custom title for search engines
- **Meta Description**: 150-160 characters
- **Keywords**: Comma-separated keywords

3. Click **Create** to publish

### Managing Product Inventory

Products in this marketplace are digital, so no inventory management is needed. However, you can:

- **Archive** old products
- **Feature** top-selling products
- Monitor **statistics** (views, downloads, rating)

### Product Best Practices

✅ **DO:**
- Use high-quality preview images
- Write detailed, benefit-focused descriptions
- Add 5-8 key features
- Include relevant tags
- Set competitive pricing
- Enable reviews for social proof

❌ **DON'T:**
- Use low-resolution images
- Copy descriptions from competitors
- Overprice relative to market
- Forget to add download files
- Skip SEO fields

---

## 📊 Managing Orders

### Viewing Orders

1. Go to **Orders** collection
2. View order list with columns:
   - Order Number
   - Customer Email
   - Total Amount
   - Status
   - Date

### Order Details

Click on an order to view:

**Customer Information:**
- Name, email, phone
- Billing address

**Order Items:**
- Products purchased
- Quantities and prices
- Subtotals

**Payment Information:**
- Stripe session ID
- Payment status
- Total amount

**Download Information:**
- Download token
- Download URL
- Expiry date
- Download count

**Order Status:**
- **Pending**: Payment initiated but not confirmed
- **Processing**: Payment received, preparing download
- **Completed**: Download link sent successfully
- **Failed**: Payment failed
- **Refunded**: Order refunded
- **Cancelled**: Order cancelled

### Processing Refunds

1. Open the order
2. Change **Payment Status** to "Refunded"
3. Change **Order Status** to "Refunded"
4. Process refund in Stripe dashboard
5. Add note explaining refund reason

### Order Management Tips

- Monitor pending orders daily
- Check failed payments for issues
- Respond to customer inquiries within 24 hours
- Keep download links active for full 30 days
- Archive completed orders after 90 days

---

## 👥 Managing Users

### User Roles

**Admin:**
- Full access to all collections
- Can manage other users
- Can modify site settings

**Customer:**
- Can view own orders
- Can manage own profile
- Can write reviews

### Creating Admin Users

1. Go to **Users** → **Create New**
2. Fill in email and password
3. Set **Role** to "Admin"
4. Save

### Customer Management

**View Customer Details:**
- Profile information
- Order history
- Wishlist
- Statistics (total orders, total spent)

**Customer Statistics:**
- Total Orders: Number of completed purchases
- Total Spent: Lifetime value
- Last Order Date: Most recent purchase
- Account Status: Active, Inactive, Suspended

**Marketing Data:**
- Acquisition source (how they found us)
- Referral code (unique per customer)
- Referral tracking

### Best Practices

- Regularly review suspended accounts
- Monitor high-value customers
- Segment customers for marketing campaigns
- Respect privacy and data protection laws (GDPR)

---

## ⭐ Managing Reviews

### Review Workflow

1. Customer writes review on product page
2. Review status: **Pending**
3. Admin reviews and approves/rejects
4. Approved reviews appear on product page
5. Product rating auto-updates

### Approving Reviews

1. Go to **Reviews** collection
2. Filter by status: "Pending"
3. Click on review to read
4. Check for:
   - Appropriate language
   - Relevant content
   - No spam or promotional content
5. Change status to **Approved** or **Rejected**

### Managing Spam

Mark spam reviews with status "Spam" to track patterns.

### Responding to Reviews

1. Open the review
2. Scroll to **Seller Response** section
3. Write your response
4. Set "Responded At" date (auto-fills)
5. Save

**Response Best Practices:**
- Thank the reviewer
- Address specific concerns
- Be professional and helpful
- Keep it concise
- Respond within 48 hours

### Review Moderation Settings

Configure in **Settings** → **E-Commerce**:
- Enable/disable reviews
- Require approval before publishing
- Set verified purchase requirements

---

## 📝 Managing Blog Posts

### Creating a Blog Post

1. Go to **Posts** → **Create New**
2. Fill in required fields:

**Content:**
- **Title**: Post headline
- **Slug**: URL-friendly version
- **Excerpt**: Summary (150-200 chars)
- **Content**: Full post content (rich text editor)

**Media:**
- **Featured Image**: Main post image (1200x630px recommended)

**Organization:**
- **Category**: Select one (Tips & Tricks, Career Advice, etc.)
- **Tags**: Add relevant tags
- **Author**: Author name
- **Reading Time**: Estimated minutes to read

**Publishing:**
- **Status**: Draft, Published, Archived
- **Published Date**: Auto-fills when published

**SEO:**
- Meta title, description, keywords

3. Click **Create**

### Blog Categories

Pre-configured categories:
- **Tips & Tricks**: Practical advice
- **Career Advice**: Job search and career tips
- **Design Inspiration**: Creative ideas
- **Business**: Business document tips
- **Templates**: Template guides and tutorials
- **News**: Company news and updates

### Content Calendar

Plan content in advance:
- Create posts as **Draft**
- Schedule publication dates
- Monitor post performance (views)
- Update popular posts regularly

---

## 🎫 Managing Coupons

### Creating a Coupon

1. Go to **Coupons** → **Create New**
2. Configure coupon:

**Basic Settings:**
- **Code**: UPPERCASE code (e.g., SAVE20)
- **Description**: Internal note
- **Type**: Percentage, Fixed Amount, or Free Shipping
- **Value**: Discount amount/percentage

**Usage Limits:**
- **Total Usage Limit**: Max uses across all customers
- **Usage Limit Per User**: Max uses per customer
- **Usage Count**: Auto-tracked

**Validity:**
- **Valid From**: Start date
- **Valid Until**: Expiration date (auto-expires)

**Restrictions:**
- **Minimum Purchase**: Required order total
- **Applicable Products**: Specific products only
- **Applicable Categories**: Specific categories only
- **First-Time Customer Only**: New customers only
- **Exclude Sale Items**: No stacking with sales

**Status:**
- Active, Inactive, Expired

3. Click **Create**

### Coupon Types Explained

**Percentage Discount:**
- Example: SAVE20 = 20% off
- Value: 20 (represents 20%)

**Fixed Amount:**
- Example: FLAT10 = $10 off
- Value: 10 (represents $10)

**Free Shipping:**
- Example: FREESHIP
- No value needed

### Coupon Best Practices

✅ **DO:**
- Use memorable codes
- Set expiration dates
- Limit total uses
- Track campaign performance
- Test before launching

❌ **DON'T:**
- Create codes that are too complex
- Forget to set usage limits
- Stack discounts unintentionally
- Leave expired coupons active

### Marketing Campaigns

Track coupons by campaign:
- **Campaign Name**: "Black Friday 2024"
- **Internal Notes**: Strategy and goals
- Monitor usage and conversions

---

## ⚙️ Site Settings

Access global settings: **Settings** → **Site Settings**

### General Settings

- **Site Name**: Template Marketplace
- **Site Description**: Homepage meta description
- **Site URL**: Production domain
- **Logo**: Upload site logo
- **Favicon**: Upload favicon

### Contact Information

- Email, phone, physical address
- Displayed on contact page and emails

### Social Media

Add social media URLs:
- Facebook, Twitter, Instagram, LinkedIn, YouTube, Pinterest

### SEO Settings

- Default meta title and description
- Default keywords
- OG Image for social sharing
- Google Analytics ID (GA4)
- Google Search Console verification
- Facebook Pixel ID

### E-Commerce Settings

- **Default Currency**: USD, EUR, or GBP
- **Tax Rate**: Default tax percentage
- **Download Link Expiry**: Days before links expire (30 default)
- **Max Downloads**: Per purchase limit (10 default)
- **Enable Reviews**: Global review toggle
- **Require Review Approval**: Moderation toggle

### Email Settings

- From name and email
- Reply-to email
- Order confirmation subject template

### Maintenance Mode

- **Enable Maintenance Mode**: Show maintenance page
- **Maintenance Message**: Custom message
- **Allowed IPs**: IPs that can access during maintenance

### Feature Flags

Toggle features on/off:
- Blog
- Wishlist
- User accounts
- Newsletter signup
- Coupons

---

## 💡 Best Practices

### Daily Tasks

- [ ] Review pending orders
- [ ] Check for failed payments
- [ ] Moderate pending reviews
- [ ] Monitor customer support emails

### Weekly Tasks

- [ ] Upload new products
- [ ] Publish blog post
- [ ] Review analytics
- [ ] Update featured products
- [ ] Check coupon performance

### Monthly Tasks

- [ ] Analyze sales trends
- [ ] Update SEO metadata
- [ ] Review and archive old orders
- [ ] Clean up draft content
- [ ] Backup database
- [ ] Update site settings

### Content Guidelines

**Product Descriptions:**
- Focus on benefits, not just features
- Use bullet points for readability
- Include use cases and examples
- Address common objections
- Keep tone professional but friendly

**Blog Posts:**
- Write 800-1500 words
- Use headings (H2, H3) for structure
- Include images every 300-400 words
- Add actionable tips
- End with call-to-action
- Optimize for SEO

**Reviews:**
- Approve within 24-48 hours
- Respond to negative reviews professionally
- Thank customers for positive feedback
- Address specific concerns raised

### Security Best Practices

- Use strong admin passwords
- Enable two-factor authentication
- Regularly update Payload CMS
- Monitor failed login attempts
- Keep backups updated
- Limit admin user accounts
- Review user permissions quarterly

### Performance Optimization

- Compress images before uploading
- Use WebP format when possible
- Limit file sizes (images <500KB)
- Clean up unused media files monthly
- Archive old orders and posts

### SEO Best Practices

- Write unique meta descriptions
- Use descriptive alt text for images
- Create SEO-friendly URLs (slugs)
- Optimize for target keywords
- Build internal links
- Update content regularly
- Monitor search rankings

---

## 🆘 Common Issues & Solutions

### Issue: Order showing as Pending

**Solution:**
1. Check Stripe webhook logs
2. Verify webhook endpoint is configured
3. Manually update order status if payment confirmed in Stripe

### Issue: Download link expired

**Solution:**
1. Find order in Orders collection
2. Generate new download token
3. Email customer with new link

### Issue: Product not appearing on frontend

**Solution:**
1. Check product status (must be "Published")
2. Verify category is assigned
3. Clear cache if using caching plugin

### Issue: Review not showing on product page

**Solution:**
1. Check review status (must be "Approved")
2. Verify product is correct
3. Clear cache

### Issue: Coupon not working

**Solution:**
1. Check coupon status (must be "Active")
2. Verify validity dates
3. Check usage limits
4. Verify minimum purchase requirement
5. Ensure product/category restrictions match

---

## 📞 Support & Resources

### Documentation

- **Payload CMS Docs**: https://payloadcms.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stripe Docs**: https://stripe.com/docs

### Getting Help

- **Email**: admin@templatemarketplace.com
- **GitHub Issues**: Report bugs and feature requests

### Training Resources

- Payload CMS tutorial videos
- E-commerce best practices guides
- SEO optimization guides
- Content marketing resources

---

## 📈 Analytics & Reporting

### Key Metrics to Track

**Products:**
- Views per product
- Conversion rate (views → purchases)
- Top-selling products
- Revenue per product

**Orders:**
- Total orders per day/week/month
- Average order value
- Revenue trends
- Refund rate

**Users:**
- New user registrations
- Repeat customer rate
- Customer lifetime value
- User acquisition sources

**Blog:**
- Page views per post
- Average time on page
- Top-performing posts
- Traffic sources

**Reviews:**
- Average rating per product
- Review submission rate
- Response rate
- Helpful vote ratio

### Generating Reports

1. Use Payload CMS filters to segment data
2. Export collections to CSV
3. Use analytics dashboard (Google Analytics)
4. Create custom reports in admin panel

---

## 🔄 Workflows

### New Product Launch Workflow

1. **Preparation** (1 week before):
   - Create product in CMS (draft)
   - Upload all images and files
   - Write SEO-optimized description
   - Set pricing

2. **Pre-Launch** (3 days before):
   - Review product listing
   - Test download process
   - Create marketing materials
   - Schedule social media posts

3. **Launch Day**:
   - Change status to "Published"
   - Feature on homepage
   - Send newsletter announcement
   - Post on social media

4. **Post-Launch** (1 week after):
   - Monitor sales and views
   - Respond to questions
   - Adjust pricing if needed
   - Gather initial reviews

### Order Fulfillment Workflow

1. Customer completes checkout
2. Stripe webhook triggers
3. Order created in CMS (pending)
4. Payment confirmed → status: processing
5. Download token generated
6. Email sent with download link
7. Order status → completed
8. Monitor for download issues

### Review Moderation Workflow

1. Customer submits review
2. Review status: pending
3. Admin notification email
4. Admin reviews within 24 hours
5. Approve/reject decision
6. If approved: appears on product page
7. Product rating recalculated
8. Admin responds if needed

---

**End of Admin Guide**

For additional help, contact the development team or consult the Payload CMS documentation.

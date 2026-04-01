async function createBlogsForArtzdata() {
  // Login to Directus
  const loginRes = await fetch('http://209.38.216.215:8055/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vorlagen.de',
      password: 'SecureDirectus2024!'
    })
  });

  const loginData = await loginRes.json();
  const token = loginData.data?.access_token;

  if (!token) {
    console.log('Login failed:', loginData);
    return;
  }

  console.log('Logged in successfully\n');
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  // IMPORTANT: Update this after running directus-setup-artzdata.js
  // Check the site ID output from that script
  const SITE_ID = 6; // artzdata.de — update if different

  // 1. Create blog categories
  console.log('=== Creating Blog Categories ===');

  const blogCategories = [
    {
      name: 'Healthcare Marketing',
      slug: 'healthcare-marketing',
      description: 'Tips for marketing to healthcare professionals',
      display_order: 1,
      site: SITE_ID
    },
    {
      name: 'Email Lists',
      slug: 'email-lists',
      description: 'Guides about email lists and lead databases',
      display_order: 2,
      site: SITE_ID
    },
    {
      name: 'Medical Specialties',
      slug: 'medical-specialties',
      description: 'Content about dentists, physicians, pharmacists, etc.',
      display_order: 3,
      site: SITE_ID
    },
    {
      name: 'Data & Compliance',
      slug: 'data-compliance',
      description: 'GDPR, data protection, compliance topics',
      display_order: 4,
      site: SITE_ID
    },
    {
      name: 'Lead Generation',
      slug: 'lead-generation',
      description: 'B2B lead generation strategies for healthcare',
      display_order: 5,
      site: SITE_ID
    }
  ];

  const categoryIds = {};
  for (const cat of blogCategories) {
    const catRes = await fetch('http://209.38.216.215:8055/items/blog_categories', {
      method: 'POST',
      headers,
      body: JSON.stringify(cat)
    });
    const catData = await catRes.json();
    if (catData.errors) {
      console.log(`Category "${cat.name}" error:`, catData.errors[0]?.message);
    } else {
      console.log(`Created category: ${cat.name} (id: ${catData.data?.id})`);
      categoryIds[cat.slug] = catData.data?.id;
    }
  }

  // 2. Create sample blog posts
  console.log('\n=== Creating Sample Blog Posts ===');

  const posts = [
    {
      title: 'How to Build a Targeted Healthcare Email List in 2025',
      slug: 'build-targeted-healthcare-email-list-2025',
      excerpt: 'Learn the essential steps to create a high-quality, GDPR-compliant healthcare email list that drives real engagement with medical professionals.',
      content: `<h2>Why Healthcare Email Lists Matter</h2>
<p>Reaching healthcare professionals — doctors, dentists, pharmacists, and clinic administrators — requires precision. A well-built email list is the foundation of any successful B2B healthcare marketing campaign.</p>

<h2>Step 1: Define Your Target Audience</h2>
<p>Before acquiring or building a list, get specific about who you need to reach:</p>
<ul>
<li><strong>Specialty</strong> — Are you targeting general practitioners, dentists, or oncologists?</li>
<li><strong>Geography</strong> — Do you need contacts in specific regions or nationwide?</li>
<li><strong>Practice size</strong> — Solo practitioners vs. large hospital groups have different needs.</li>
<li><strong>Decision-making role</strong> — Doctors, office managers, or procurement teams?</li>
</ul>

<h2>Step 2: Source Verified Data</h2>
<p>Quality trumps quantity every time. A list of 500 verified physician emails will outperform 10,000 unverified addresses. Look for providers that offer:</p>
<ul>
<li>Email verification and bounce-rate guarantees</li>
<li>Regular data updates (at least quarterly)</li>
<li>Opt-in compliance documentation</li>
<li>Direct contact details, not generic info@ addresses</li>
</ul>

<h2>Step 3: Ensure GDPR Compliance</h2>
<p>If you're operating in or targeting the EU market, GDPR compliance is non-negotiable. Make sure your data provider can demonstrate lawful basis for processing, and always include clear unsubscribe mechanisms in your outreach.</p>

<h2>Step 4: Segment and Personalize</h2>
<p>Once you have your list, segment it by specialty, location, and practice type. Personalized emails to dentists about dental-specific products will always outperform generic healthcare blasts.</p>

<h2>Getting Started</h2>
<p>At Artzdata, we provide pre-built, verified healthcare email lists segmented by medical specialty. Each list is GDPR-compliant and updated regularly to ensure deliverability.</p>`,
      author: 'Artzdata Team',
      published_date: new Date().toISOString(),
      status: 'published',
      blog_category: categoryIds['email-lists'] || null,
      tags: JSON.stringify(['email lists', 'healthcare marketing', 'GDPR', 'lead generation']),
      read_time: 6,
      seo_title: 'How to Build a Targeted Healthcare Email List in 2025',
      seo_description: 'Step-by-step guide to building a GDPR-compliant healthcare email list. Learn how to target doctors, dentists, and pharmacists effectively.',
      seo_keywords: 'healthcare email list, doctor email list, medical email database, GDPR compliant',
      language: 'en',
      site: SITE_ID
    },
    {
      title: '5 Ways to Reach Dentists with B2B Marketing',
      slug: '5-ways-reach-dentists-b2b-marketing',
      excerpt: 'Dentists are a lucrative B2B segment but hard to reach. Here are five proven strategies to connect with dental professionals and grow your business.',
      content: `<h2>The Dental Market Opportunity</h2>
<p>With over 70,000 dental practices across Germany alone, the dental market represents a significant opportunity for B2B suppliers — from equipment manufacturers to software providers and dental supply companies.</p>

<h2>1. Use Verified Dentist Email Lists</h2>
<p>Cold outreach works when you have the right data. A verified dentist email list gives you direct access to practice owners and decision-makers. Look for lists that include practice name, owner name, email, phone, and specialty.</p>

<h2>2. Attend Dental Trade Shows</h2>
<p>Events like IDS (International Dental Show) in Cologne bring thousands of dental professionals together. Combine your email outreach with trade show presence for maximum impact.</p>

<h2>3. Create Dental-Specific Content</h2>
<p>Generic healthcare content won't cut it. Create blog posts, whitepapers, and case studies specifically addressing dental practice challenges — from patient management to equipment procurement.</p>

<h2>4. Partner with Dental Associations</h2>
<p>Dental chambers and professional associations in Germany can be valuable partners. Sponsorships and co-branded content lend credibility to your outreach.</p>

<h2>5. Leverage LinkedIn for Warm Outreach</h2>
<p>Combine your email campaigns with LinkedIn outreach. Many dentists and practice managers are active on the platform, and a multi-channel approach significantly improves response rates.</p>

<h2>Putting It All Together</h2>
<p>The most successful B2B dental marketing campaigns combine quality data with personalized, dental-specific messaging across multiple channels. Start with a verified dentist list, then layer on content and relationship-building tactics.</p>`,
      author: 'Artzdata Team',
      published_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published',
      blog_category: categoryIds['medical-specialties'] || null,
      tags: JSON.stringify(['dentists', 'B2B marketing', 'dental industry', 'lead generation']),
      read_time: 5,
      seo_title: '5 Ways to Reach Dentists with B2B Marketing | Artzdata',
      seo_description: 'Discover 5 proven B2B marketing strategies to reach dentists and dental practices. From email lists to trade shows and content marketing.',
      seo_keywords: 'dentist marketing, dental B2B, dentist email list, dental practice marketing',
      language: 'en',
      site: SITE_ID
    },
    {
      title: 'GDPR and Healthcare Data: What Marketers Need to Know',
      slug: 'gdpr-healthcare-data-marketers-guide',
      excerpt: 'Navigating GDPR when marketing to healthcare professionals can be complex. This guide breaks down the key rules and how to stay compliant.',
      content: `<h2>Healthcare Data Under GDPR</h2>
<p>The General Data Protection Regulation (GDPR) classifies health data as a "special category" of personal data, subject to additional protections. For B2B marketers targeting healthcare professionals, understanding these rules is essential.</p>

<h2>B2B vs. B2C: An Important Distinction</h2>
<p>Good news for B2B marketers: when you're contacting healthcare professionals in their professional capacity (at their practice email, about business-relevant products), the rules are more permissive than B2C marketing. The key legal basis is often "legitimate interest" rather than explicit consent.</p>

<h2>Key Compliance Requirements</h2>
<ul>
<li><strong>Transparency</strong> — Always identify who you are and why you're reaching out.</li>
<li><strong>Opt-out mechanism</strong> — Every email must include a clear unsubscribe option.</li>
<li><strong>Data minimization</strong> — Only collect and use data you actually need.</li>
<li><strong>Data accuracy</strong> — Keep your lists updated and remove bounced/invalid addresses.</li>
<li><strong>Documentation</strong> — Maintain records of your data sources and processing activities.</li>
</ul>

<h2>Working with Data Providers</h2>
<p>When purchasing healthcare email lists, verify that your provider:</p>
<ul>
<li>Can demonstrate the lawful basis for collecting the data</li>
<li>Provides data processing agreements (DPAs)</li>
<li>Updates their data regularly to maintain accuracy</li>
<li>Is transparent about their data sourcing methods</li>
</ul>

<h2>Practical Tips for Compliant Campaigns</h2>
<ol>
<li>Always include your company information and a physical address in emails.</li>
<li>Honor unsubscribe requests within 72 hours (ideally instantly).</li>
<li>Segment your lists to ensure relevance — irrelevant emails increase complaint rates.</li>
<li>Keep records of when and where each contact was sourced.</li>
<li>Review and clean your lists at least quarterly.</li>
</ol>

<h2>The Bottom Line</h2>
<p>GDPR compliance isn't just a legal requirement — it's good business practice. Clean, compliant data leads to better deliverability, higher engagement, and stronger relationships with healthcare professionals.</p>`,
      author: 'Artzdata Team',
      published_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published',
      blog_category: categoryIds['data-compliance'] || null,
      tags: JSON.stringify(['GDPR', 'compliance', 'healthcare data', 'data protection']),
      read_time: 7,
      seo_title: 'GDPR and Healthcare Data: A Marketer\'s Guide | Artzdata',
      seo_description: 'Essential GDPR compliance guide for B2B healthcare marketers. Learn how to legally use doctor and dentist email lists in your campaigns.',
      seo_keywords: 'GDPR healthcare, medical data compliance, healthcare email GDPR, data protection healthcare',
      language: 'en',
      site: SITE_ID
    }
  ];

  for (const post of posts) {
    const postRes = await fetch('http://209.38.216.215:8055/items/posts', {
      method: 'POST',
      headers,
      body: JSON.stringify(post)
    });
    const postData = await postRes.json();
    if (postData.errors) {
      console.log(`Post "${post.title}" error:`, postData.errors[0]?.message);
    } else {
      console.log(`Created post: ${post.title.substring(0, 50)}...`);
    }
  }

  // 3. Verify
  console.log('\n=== Verification ===');

  const catsRes = await fetch(`http://209.38.216.215:8055/items/blog_categories?filter[site][_eq]=${SITE_ID}`, { headers });
  const catsData = await catsRes.json();
  console.log(`Blog categories for artzdata.de: ${catsData.data?.length}`);
  catsData.data?.forEach(c => console.log(`  - ${c.name} (${c.slug})`));

  const postsRes = await fetch(`http://209.38.216.215:8055/items/posts?filter[site][_eq]=${SITE_ID}`, { headers });
  const postsData = await postsRes.json();
  console.log(`\nBlog posts for artzdata.de: ${postsData.data?.length}`);
  postsData.data?.forEach(p => console.log(`  - ${p.title.substring(0, 50)}...`));

  console.log('\n=== Done ===');
}

createBlogsForArtzdata().catch(console.error);

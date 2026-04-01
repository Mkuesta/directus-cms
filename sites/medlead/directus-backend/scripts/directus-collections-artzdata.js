async function createArztdataCollections() {
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

  // =============================================
  // 1. Create collection folder group "artzdata"
  // =============================================
  console.log('=== Creating Collection Folder: Artzdata ===');

  const folderRes = await fetch('http://209.38.216.215:8055/collections', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      collection: 'artzdata',
      meta: {
        collection: 'artzdata',
        icon: 'folder',
        note: 'Artzdata.de website collections',
        color: '#0EA5E9',
        hidden: false,
        singleton: false,
        group: null
      },
      schema: null // null schema = virtual folder
    })
  });
  const folderData = await folderRes.json();
  if (folderData.errors) {
    console.log('Folder error:', folderData.errors[0]?.message);
  } else {
    console.log('Created collection folder: artzdata');
  }

  // =============================================
  // 2. Create artzdata_blog_categories collection
  // =============================================
  console.log('\n=== Creating Collection: artzdata_blog_categories ===');

  const blogCatRes = await fetch('http://209.38.216.215:8055/collections', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      collection: 'artzdata_blog_categories',
      meta: {
        collection: 'artzdata_blog_categories',
        icon: 'label',
        note: 'Blog categories for Artzdata.de',
        hidden: false,
        singleton: false,
        group: 'artzdata'
      },
      schema: {
        name: 'artzdata_blog_categories'
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          meta: {
            interface: 'input',
            special: ['uuid'],
            hidden: true,
            readonly: true
          },
          schema: {
            is_primary_key: true,
            has_auto_increment: false
          }
        },
        {
          field: 'name',
          type: 'string',
          meta: {
            interface: 'input',
            note: 'Category name'
          },
          schema: {
            is_nullable: false,
            max_length: 255
          }
        },
        {
          field: 'slug',
          type: 'string',
          meta: {
            interface: 'input',
            note: 'URL-friendly slug'
          },
          schema: {
            is_nullable: false,
            max_length: 255,
            is_unique: true
          }
        },
        {
          field: 'description',
          type: 'text',
          meta: {
            interface: 'input-multiline',
            note: 'Category description'
          },
          schema: {
            is_nullable: true
          }
        },
        {
          field: 'color',
          type: 'string',
          meta: {
            interface: 'input',
            note: 'Category color hex'
          },
          schema: {
            is_nullable: true,
            max_length: 255
          }
        },
        {
          field: 'display_order',
          type: 'integer',
          meta: {
            interface: 'input',
            note: 'Sort order'
          },
          schema: {
            is_nullable: true,
            default_value: 0
          }
        },
        {
          field: 'featured',
          type: 'boolean',
          meta: {
            interface: 'boolean',
            note: 'Featured category'
          },
          schema: {
            is_nullable: true,
            default_value: false
          }
        }
      ]
    })
  });
  const blogCatData = await blogCatRes.json();
  if (blogCatData.errors) {
    console.log('Blog categories collection error:', blogCatData.errors[0]?.message);
  } else {
    console.log('Created collection: artzdata_blog_categories');
  }

  // =============================================
  // 3. Create artzdata_posts collection
  // =============================================
  console.log('\n=== Creating Collection: artzdata_posts ===');

  const postsRes = await fetch('http://209.38.216.215:8055/collections', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      collection: 'artzdata_posts',
      meta: {
        collection: 'artzdata_posts',
        icon: 'article',
        note: 'Blog posts for Artzdata.de',
        hidden: false,
        singleton: false,
        group: 'artzdata'
      },
      schema: {
        name: 'artzdata_posts'
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          meta: {
            interface: 'input',
            special: ['uuid'],
            hidden: true,
            readonly: true
          },
          schema: {
            is_primary_key: true,
            has_auto_increment: false
          }
        },
        {
          field: 'title',
          type: 'string',
          meta: { interface: 'input', note: 'Post title' },
          schema: { is_nullable: false, max_length: 255 }
        },
        {
          field: 'slug',
          type: 'string',
          meta: { interface: 'input', note: 'URL-friendly slug' },
          schema: { is_nullable: false, max_length: 255, is_unique: true }
        },
        {
          field: 'excerpt',
          type: 'text',
          meta: { interface: 'input-multiline', note: 'Short excerpt' },
          schema: { is_nullable: true }
        },
        {
          field: 'content',
          type: 'text',
          meta: { interface: 'input-rich-text-html', note: 'Full post content (HTML)' },
          schema: { is_nullable: true }
        },
        {
          field: 'author',
          type: 'string',
          meta: { interface: 'input', note: 'Author name' },
          schema: { is_nullable: true, max_length: 255 }
        },
        {
          field: 'published_date',
          type: 'timestamp',
          meta: { interface: 'datetime', note: 'Publication date' },
          schema: { is_nullable: true }
        },
        {
          field: 'status',
          type: 'string',
          meta: {
            interface: 'select-dropdown',
            note: 'Publication status',
            options: {
              choices: [
                { text: 'Draft', value: 'draft' },
                { text: 'Published', value: 'published' },
                { text: 'Archived', value: 'archived' }
              ]
            }
          },
          schema: { is_nullable: true, default_value: 'draft', max_length: 255 }
        },
        {
          field: 'category',
          type: 'string',
          meta: { interface: 'input', note: 'Blog category slug' },
          schema: { is_nullable: true, max_length: 255 }
        },
        {
          field: 'tags',
          type: 'json',
          meta: { interface: 'tags', special: ['cast-json'], note: 'Post tags' },
          schema: { is_nullable: true }
        },
        {
          field: 'read_time',
          type: 'integer',
          meta: { interface: 'input', note: 'Estimated read time in minutes' },
          schema: { is_nullable: true }
        },
        {
          field: 'seo_title',
          type: 'string',
          meta: { interface: 'input', note: 'SEO title' },
          schema: { is_nullable: true, max_length: 255 }
        },
        {
          field: 'seo_description',
          type: 'text',
          meta: { interface: 'input-multiline', note: 'SEO meta description' },
          schema: { is_nullable: true }
        },
        {
          field: 'seo_keywords',
          type: 'string',
          meta: { interface: 'input', note: 'SEO keywords (comma-separated)' },
          schema: { is_nullable: true, max_length: 500 }
        },
        {
          field: 'og_image',
          type: 'string',
          meta: { interface: 'input', note: 'Open Graph image URL' },
          schema: { is_nullable: true, max_length: 500 }
        },
        {
          field: 'featured_image',
          type: 'uuid',
          meta: { interface: 'file-image', special: ['file'], note: 'Featured image' },
          schema: { is_nullable: true }
        },
        {
          field: 'featured_image_url',
          type: 'string',
          meta: { interface: 'input', note: 'External featured image URL (fallback)' },
          schema: { is_nullable: true, max_length: 500 }
        },
        {
          field: 'author_image',
          type: 'uuid',
          meta: { interface: 'file-image', special: ['file'], note: 'Author avatar' },
          schema: { is_nullable: true }
        },
        {
          field: 'author_image_url',
          type: 'string',
          meta: { interface: 'input', note: 'External author image URL (fallback)' },
          schema: { is_nullable: true, max_length: 500 }
        },
        {
          field: 'language',
          type: 'string',
          meta: {
            interface: 'select-dropdown',
            note: 'Content language',
            options: {
              choices: [
                { text: 'English', value: 'en' },
                { text: 'German', value: 'de' }
              ]
            }
          },
          schema: { is_nullable: true, default_value: 'en', max_length: 10 }
        },
        {
          field: 'related_templates',
          type: 'json',
          meta: { interface: 'tags', special: ['cast-json'], note: 'Related template slugs' },
          schema: { is_nullable: true }
        },
        {
          field: 'scheduled_publish_date',
          type: 'dateTime',
          meta: { interface: 'datetime', note: 'Scheduled publish date' },
          schema: { is_nullable: true }
        }
      ]
    })
  });
  const postsData = await postsRes.json();
  if (postsData.errors) {
    console.log('Posts collection error:', postsData.errors[0]?.message);
  } else {
    console.log('Created collection: artzdata_posts');
  }

  // =============================================
  // 4. Set public read access for both collections
  // =============================================
  console.log('\n=== Setting Public Read Access ===');

  // Get the public policy/role
  const rolesRes = await fetch('http://209.38.216.215:8055/roles', { headers });
  const rolesData = await rolesRes.json();
  const publicRole = rolesData.data?.find(r => r.name === 'Public');

  // Get policies
  const policiesRes = await fetch('http://209.38.216.215:8055/policies', { headers });
  const policiesData = await policiesRes.json();

  // Try to find existing public access policy
  let publicPolicyId = null;
  if (policiesData.data) {
    const publicPolicy = policiesData.data.find(p =>
      p.name && (p.name.toLowerCase().includes('public') || p.name.toLowerCase().includes('read'))
    );
    if (publicPolicy) {
      publicPolicyId = publicPolicy.id;
      console.log('Found public policy:', publicPolicy.name, '(id:', publicPolicyId + ')');
    }
  }

  // Create read permissions for both collections
  for (const collection of ['artzdata_blog_categories', 'artzdata_posts']) {
    const permRes = await fetch('http://209.38.216.215:8055/permissions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection: collection,
        action: 'read',
        role: publicRole?.id || null,
        policy: publicPolicyId,
        fields: ['*'],
        permissions: {},
        validation: {}
      })
    });
    const permData = await permRes.json();
    if (permData.errors) {
      console.log(`Permission for ${collection} error:`, permData.errors[0]?.message);
    } else {
      console.log(`Set public read access for: ${collection}`);
    }
  }

  // =============================================
  // 5. Migrate data from shared collections
  // =============================================
  console.log('\n=== Migrating Data from Shared Collections ===');

  const SITE_ID = 6; // artzdata.de

  // Migrate blog categories
  const oldCatsRes = await fetch(`http://209.38.216.215:8055/items/blog_categories?filter[site][_eq]=${SITE_ID}`, { headers });
  const oldCats = await oldCatsRes.json();
  console.log(`Found ${oldCats.data?.length || 0} blog categories to migrate`);

  for (const cat of (oldCats.data || [])) {
    const newCatRes = await fetch('http://209.38.216.215:8055/items/artzdata_blog_categories', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        color: cat.color,
        display_order: cat.display_order,
        featured: cat.featured || false
      })
    });
    const newCat = await newCatRes.json();
    if (newCat.errors) {
      console.log(`  Migrate category "${cat.name}" error:`, newCat.errors[0]?.message);
    } else {
      console.log(`  Migrated category: ${cat.name} → id: ${newCat.data?.id}`);
    }
  }

  // Migrate posts
  const oldPostsRes = await fetch(`http://209.38.216.215:8055/items/posts?filter[site][_eq]=${SITE_ID}`, { headers });
  const oldPosts = await oldPostsRes.json();
  console.log(`\nFound ${oldPosts.data?.length || 0} posts to migrate`);

  for (const post of (oldPosts.data || [])) {
    const newPostRes = await fetch('http://209.38.216.215:8055/items/artzdata_posts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        published_date: post.published_date,
        status: post.status,
        category: post.category,
        tags: post.tags,
        read_time: post.read_time,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        seo_keywords: post.seo_keywords,
        language: post.language || 'en'
      })
    });
    const newPost = await newPostRes.json();
    if (newPost.errors) {
      console.log(`  Migrate post "${post.title?.substring(0, 40)}" error:`, newPost.errors[0]?.message);
    } else {
      console.log(`  Migrated post: ${post.title?.substring(0, 50)}...`);
    }
  }

  // =============================================
  // 6. Clean up old shared collection data
  // =============================================
  console.log('\n=== Cleaning Up Old Shared Collection Data ===');

  // Delete old blog categories for artzdata from shared collection
  for (const cat of (oldCats.data || [])) {
    await fetch(`http://209.38.216.215:8055/items/blog_categories/${cat.id}`, {
      method: 'DELETE',
      headers
    });
  }
  console.log(`Deleted ${oldCats.data?.length || 0} old blog categories from shared collection`);

  // Delete old posts for artzdata from shared collection
  for (const post of (oldPosts.data || [])) {
    await fetch(`http://209.38.216.215:8055/items/posts/${post.id}`, {
      method: 'DELETE',
      headers
    });
  }
  console.log(`Deleted ${oldPosts.data?.length || 0} old posts from shared collection`);

  // =============================================
  // 7. Verify
  // =============================================
  console.log('\n=== Verification ===');

  const newCatsRes = await fetch('http://209.38.216.215:8055/items/artzdata_blog_categories', { headers });
  const newCats = await newCatsRes.json();
  console.log(`artzdata_blog_categories: ${newCats.data?.length} items`);
  newCats.data?.forEach(c => console.log(`  - ${c.name} (${c.slug})`));

  const newPostsRes = await fetch('http://209.38.216.215:8055/items/artzdata_posts', { headers });
  const newPosts = await newPostsRes.json();
  console.log(`\nartzdata_posts: ${newPosts.data?.length} items`);
  newPosts.data?.forEach(p => console.log(`  - ${p.title?.substring(0, 50)}`));

  console.log('\n=== Done ===');
  console.log('Artzdata collection folder with artzdata_posts and artzdata_blog_categories created.');
  console.log('Data migrated from shared collections and cleaned up.');
}

createArztdataCollections().catch(console.error);

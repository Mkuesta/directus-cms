// Simple test script to verify Directus connection
const DIRECTUS_URL = 'http://209.38.216.215:8055';

async function testDirectusConnection() {
  console.log('Testing Directus connection...\n');

  // Test 1: Check if Directus server is accessible
  console.log('1. Testing server health:');
  try {
    const response = await fetch(`${DIRECTUS_URL}/server/health`);
    const data = await response.json();
    console.log('✅ Server is healthy:', data);
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return;
  }

  // Test 2: Try to fetch posts without authentication
  console.log('\n2. Testing resiliax_posts endpoint (public):');
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/resiliax_posts`);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Posts fetched successfully! Found ${data.data?.length || 0} posts`);
      if (data.data && data.data.length > 0) {
        console.log('First post:', {
          id: data.data[0].id,
          title: data.data[0].title,
          status: data.data[0].status,
        });
      }
    } else {
      console.error('❌ Failed to fetch posts:', {
        status: response.status,
        error: data.errors?.[0]?.message || 'Unknown error',
      });
    }
  } catch (error) {
    console.error('❌ Posts fetch failed:', error.message);
  }

  // Test 3: Try to fetch categories
  console.log('\n3. Testing resiliax_categories endpoint (public):');
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/resiliax_categories`);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Categories fetched successfully! Found ${data.data?.length || 0} categories`);
    } else {
      console.error('❌ Failed to fetch categories:', {
        status: response.status,
        error: data.errors?.[0]?.message || 'Unknown error',
      });
    }
  } catch (error) {
    console.error('❌ Categories fetch failed:', error.message);
  }
}

testDirectusConnection();

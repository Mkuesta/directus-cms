async function setupArtzdata() {
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

  // 1. Create new site "artzdata.de"
  console.log('=== Creating Site: artzdata.de ===');
  const siteRes = await fetch('http://209.38.216.215:8055/items/sites', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      identifier: 'artzdata',
      name: 'artzdata.de',
      domain: 'artzdata.de'
    })
  });
  const siteData = await siteRes.json();
  if (siteData.errors) {
    console.log('Site creation error:', siteData.errors[0]?.message);
  } else {
    console.log('Created site:', siteData.data?.name, '(id:', siteData.data?.id + ')');
  }
  const siteId = siteData.data?.id;

  // 2. Create file folders for artzdata.de
  console.log('\n=== Creating File Folders ===');

  // Main folder for artzdata.de
  const mainFolderRes = await fetch('http://209.38.216.215:8055/folders', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'artzdata.de'
    })
  });
  const mainFolder = await mainFolderRes.json();
  const mainFolderId = mainFolder.data?.id;
  if (mainFolder.errors) {
    console.log('Main folder error:', mainFolder.errors[0]?.message);
  } else {
    console.log('Created folder: artzdata.de (id:', mainFolderId + ')');
  }

  // Subfolders
  const subfolders = ['blogs', 'categories'];
  for (const name of subfolders) {
    const folderRes = await fetch('http://209.38.216.215:8055/folders', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: name,
        parent: mainFolderId
      })
    });
    const folder = await folderRes.json();
    if (folder.errors) {
      console.log(`Subfolder ${name} error:`, folder.errors[0]?.message);
    } else {
      console.log(`Created subfolder: ${name} (id: ${folder.data?.id})`);
    }
  }

  // 3. Verify final structure
  console.log('\n=== Final Verification ===');

  // Get all sites
  const sitesRes = await fetch('http://209.38.216.215:8055/items/sites', { headers });
  const sites = await sitesRes.json();
  console.log('\nSites:');
  sites.data?.forEach(s => console.log(`  - ${s.name} (id: ${s.id})`));

  // Get all folders
  const foldersRes = await fetch('http://209.38.216.215:8055/folders', { headers });
  const folders = await foldersRes.json();
  console.log('\nFile Folders:');
  const rootFolders = folders.data?.filter(f => !f.parent) || [];
  rootFolders.forEach(rf => {
    console.log(`  - ${rf.name}/`);
    const children = folders.data?.filter(f => f.parent === rf.id) || [];
    children.forEach(c => console.log(`      - ${c.name}/`));
  });

  console.log('\n=== Setup Complete ===');
  console.log(`Site "artzdata.de" created with id: ${siteId}`);
  console.log('\nIMPORTANT: Update CURRENT_SITE_ID in lib/directus/config.ts with this ID!');
}

setupArtzdata().catch(console.error);

/**
 * One-time fix: create a folder for the prefix and move all prefixed
 * collections into it.
 *
 * Usage:
 *   npx tsx src/fix-collection-folder.ts --url https://cms.example.com --token <admin-token> --prefix cms
 *   npx tsx src/fix-collection-folder.ts --url https://cms.example.com --token <admin-token> --prefix cms --dry-run
 */

function parseArgs(args: string[]) {
  const result: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        result.url = args[++i];
        break;
      case '--token':
        result.token = args[++i];
        break;
      case '--prefix':
        result.prefix = args[++i];
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
    }
  }
  return result;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const url = (parsed.url as string) || process.env.DIRECTUS_URL;
  const token = (parsed.token as string) || process.env.DIRECTUS_ADMIN_TOKEN;
  const prefix = parsed.prefix as string;
  const dryRun = !!parsed.dryRun;

  if (!url || !token || !prefix) {
    console.error('Usage: npx tsx src/fix-collection-folder.ts --url <url> --token <token> --prefix <prefix> [--dry-run]');
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  console.log(`\n${dryRun ? '[dry-run] ' : ''}Creating folder and grouping collections for prefix "${prefix}"...\n`);

  // Step 1: Create the folder (virtual collection with schema: null)
  if (dryRun) {
    console.log(`  [dry-run] Would create folder: ${prefix}`);
  } else {
    const folderRes = await fetch(`${url}/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection: prefix,
        meta: {
          collection: prefix,
          icon: 'folder',
          hidden: false,
          singleton: false,
        },
        schema: null,
      }),
    });

    if (folderRes.ok) {
      console.log(`  Created folder: ${prefix}`);
    } else if (folderRes.status === 409) {
      console.log(`  Folder already exists: ${prefix}`);
    } else {
      const data = await folderRes.json().catch(() => null);
      const msg = data?.errors?.[0]?.message || folderRes.statusText;
      console.error(`  Error creating folder (${folderRes.status}): ${msg}`);
      process.exit(1);
    }
  }

  // Step 2: Get all collections and find ones with the prefix
  const listRes = await fetch(`${url}/collections`, { headers });
  if (!listRes.ok) {
    console.error(`  Failed to list collections: ${listRes.status}`);
    process.exit(1);
  }

  const listData = await listRes.json();
  const collections = (listData.data || [])
    .filter((c: any) => c.collection.startsWith(`${prefix}_`) && c.meta?.group !== prefix)
    .map((c: any) => c.collection);

  if (collections.length === 0) {
    console.log('  All collections are already grouped.');
  } else {
    console.log(`  ${collections.length} collections to move into folder:\n`);
  }

  // Step 3: Patch each collection to set group
  for (const collection of collections) {
    if (dryRun) {
      console.log(`  [dry-run] Would move ${collection} → group: ${prefix}`);
      continue;
    }

    const res = await fetch(`${url}/collections/${collection}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ meta: { group: prefix } }),
    });

    if (res.ok) {
      console.log(`  Moved: ${collection} → ${prefix}/`);
    } else {
      const data = await res.json().catch(() => null);
      const msg = data?.errors?.[0]?.message || res.statusText;
      console.error(`  Error (${res.status}): ${collection} — ${msg}`);
    }
  }

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

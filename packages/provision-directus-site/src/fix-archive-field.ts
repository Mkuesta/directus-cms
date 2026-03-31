/**
 * One-time fix: clear archive_field/archive_value/unarchive_value on
 * collections that were provisioned with archive_field:'status' but
 * don't actually have a status field.
 *
 * Usage:
 *   npx tsx src/fix-archive-field.ts --url https://cms.example.com --token <admin-token> --prefix cms
 *   npx tsx src/fix-archive-field.ts --url https://cms.example.com --token <admin-token> --prefix cms --dry-run
 */

const COLLECTIONS_WITHOUT_STATUS = [
  'settings',
  'categories',
  'analytics_settings',
  'redirects',
  'gallery_items',
  'translations',
];

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
    console.error('Usage: npx tsx src/fix-archive-field.ts --url <url> --token <token> --prefix <prefix> [--dry-run]');
    process.exit(1);
  }

  const collections = COLLECTIONS_WITHOUT_STATUS.map((name) => `${prefix}_${name}`);

  console.log(`\nFixing archive_field for ${collections.length} collections${dryRun ? ' (dry run)' : ''}...\n`);

  for (const collection of collections) {
    if (dryRun) {
      console.log(`  [dry-run] Would PATCH /collections/${collection} → archive_field: null`);
      continue;
    }

    const res = await fetch(`${url}/collections/${collection}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: {
          archive_field: null,
          archive_value: null,
          unarchive_value: null,
        },
      }),
    });

    if (res.ok) {
      console.log(`  Patched: ${collection}`);
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

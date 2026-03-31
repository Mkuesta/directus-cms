import { provision } from './provisioner.js';
import { promptUser } from './prompts.js';
import type { ProvisionConfig, FeatureFlags } from './types.js';

function parseArgs(args: string[]): Partial<{
  url: string;
  token: string;
  prefix: string;
  seed: boolean;
  dryRun: boolean;
  all: boolean;
  help: boolean;
}> {
  const result: Record<string, any> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--url':
        result.url = args[++i];
        break;
      case '--token':
        result.token = args[++i];
        break;
      case '--prefix':
        result.prefix = args[++i];
        break;
      case '--seed':
        result.seed = true;
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
      case '--all':
        result.all = true;
        break;
      case '--help':
      case '-h':
        result.help = true;
        break;
    }
  }

  return result;
}

function printHelp() {
  console.log(`
Usage: provision-directus-site [options]

Options:
  --url <url>        Directus instance URL (or DIRECTUS_URL env var)
  --token <token>    Admin token (or DIRECTUS_ADMIN_TOKEN env var)
  --prefix <prefix>  Collection prefix (e.g., mysite_en)
  --seed             Insert sample data after provisioning
  --dry-run          Print what would be created without making changes
  --all              Enable all optional features
  --help, -h         Show this help

Interactive mode:
  Run without flags to be prompted for all options.

Examples:
  provision-directus-site --url https://cms.example.com --token abc123 --prefix mysite_en --seed
  provision-directus-site --dry-run --prefix test_site --all
`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  let config: ProvisionConfig;

  // If we have enough CLI args, skip interactive mode
  const url = parsed.url || process.env.DIRECTUS_URL;
  const token = parsed.token || process.env.DIRECTUS_ADMIN_TOKEN;

  if (url && token && parsed.prefix) {
    const allFeatures: FeatureFlags = {
      includeProducts: true,
      includeNavigation: true,
      includePages: true,
      includeForms: true,
      includeAnalytics: true,
      includeRedirects: true,
      includeMedia: true,
      includeBanners: true,
      includeI18n: true,
      includeNewsletter: true,
      includeNotifications: true,
    };

    const defaultFeatures: FeatureFlags = {
      includeProducts: false,
      includeNavigation: true,
      includePages: true,
      includeForms: true,
      includeAnalytics: true,
      includeRedirects: true,
      includeMedia: false,
      includeBanners: false,
      includeI18n: false,
    };

    config = {
      url,
      token,
      prefix: parsed.prefix,
      seed: parsed.seed || false,
      dryRun: parsed.dryRun || false,
      features: parsed.all ? allFeatures : defaultFeatures,
    };
  } else if (parsed.dryRun && parsed.prefix) {
    // Dry run mode doesn't require url/token
    config = {
      url: parsed.url || 'https://example.com',
      token: parsed.token || 'dry-run-token',
      prefix: parsed.prefix,
      seed: parsed.seed || false,
      dryRun: true,
      features: parsed.all ? {
        includeProducts: true, includeNavigation: true, includePages: true,
        includeForms: true, includeAnalytics: true, includeRedirects: true,
        includeMedia: true, includeBanners: true, includeI18n: true,
        includeNewsletter: true, includeNotifications: true,
      } : {
        includeProducts: false, includeNavigation: true, includePages: true,
        includeForms: true, includeAnalytics: true, includeRedirects: true,
        includeMedia: false, includeBanners: false, includeI18n: false,
      },
    };
  } else {
    // Interactive mode
    const prompted = await promptUser();
    config = {
      url: prompted.url,
      token: prompted.token,
      prefix: prompted.prefix,
      seed: prompted.seed,
      dryRun: parsed.dryRun || false,
      features: prompted.features,
    };
  }

  console.log(`\nProvisioning collections with prefix "${config.prefix}"${config.dryRun ? ' (dry run)' : ''}...\n`);

  const result = await provision(config);

  // Summary
  console.log('\n=== Summary ===');
  console.log(`  Collections created: ${result.collectionsCreated.length}`);
  console.log(`  Collections skipped: ${result.collectionsSkipped.length}`);
  console.log(`  Fields created: ${result.fieldsCreated}`);
  console.log(`  Fields skipped: ${result.fieldsSkipped}`);
  console.log(`  Relations created: ${result.relationsCreated}`);
  console.log(`  Relations skipped: ${result.relationsSkipped}`);
  console.log(`  Permissions created: ${result.permissionsCreated}`);
  if (config.seed) console.log(`  Items seeded: ${result.itemsSeeded}`);
  if (result.errors.length) {
    console.log(`  Errors: ${result.errors.length}`);
    for (const err of result.errors) {
      console.error(`    - ${err}`);
    }
  }
  console.log('');

  if (result.errors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

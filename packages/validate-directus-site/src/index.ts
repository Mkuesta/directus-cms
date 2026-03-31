import { validate } from './validate.js';
import { promptUser } from './prompts.js';
import { printResults } from './reporter.js';
import type { ValidateConfig, FeatureFlags } from './types.js';

function parseArgs(args: string[]): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--fix') {
      result.fix = true;
    } else if (arg === '--check-data') {
      result.checkData = true;
    } else if (arg === '--all') {
      result.all = true;
    } else if (arg === '--verbose' || arg === '-v') {
      result.verbose = true;
    } else if (arg === '--url' && args[i + 1]) {
      result.url = args[++i];
    } else if (arg === '--token' && args[i + 1]) {
      result.token = args[++i];
    } else if (arg === '--prefix' && args[i + 1]) {
      result.prefix = args[++i];
    } else if (arg === '--dir' && args[i + 1]) {
      result.dir = args[++i];
    }
  }
  return result;
}

function printHelp(): void {
  console.log(`
  validate-directus-site — Validate Directus instance for a CMS site

  Usage:
    validate-directus-site [options]

  Options:
    --url <url>       Directus instance URL
    --token <token>   Admin API token
    --prefix <prefix> Collection prefix
    --dir <path>      Project directory (for env var check)
    --fix             Auto-fix fixable issues (re-provisions)
    --check-data      Check data integrity (orphaned records)
    --all             Enable all features
    -v, --verbose     Show detailed check output
    -h, --help        Show this help

  Environment variables:
    DIRECTUS_URL          Default Directus URL
    DIRECTUS_ADMIN_TOKEN  Default admin token
`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  const url = (parsed.url as string) || process.env.DIRECTUS_URL;
  const token = (parsed.token as string) || process.env.DIRECTUS_ADMIN_TOKEN;

  let config: ValidateConfig;

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
      prefix: parsed.prefix as string,
      features: parsed.all ? allFeatures : defaultFeatures,
      fix: !!parsed.fix,
      dir: parsed.dir as string | undefined,
      checkData: !!parsed.checkData,
    };
  } else {
    config = await promptUser();
  }

  const result = await validate(config);
  printResults(result, !!parsed.verbose);

  // Exit with non-zero if there are failures
  if (result.failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

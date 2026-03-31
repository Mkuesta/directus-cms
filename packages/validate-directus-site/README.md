# validate-directus-site

CLI health check tool that validates whether your Directus instance is correctly configured for a CMS-powered Next.js site. Checks collections, fields, relations, permissions, settings, environment variables, and optional data integrity.

## Usage

```bash
# Interactive mode
node validate-directus-site/dist/index.js

# Non-interactive with flags
node validate-directus-site/dist/index.js \
  --url https://cms.drlogist.com \
  --token your-admin-token \
  --prefix mysite \
  --all

# With auto-fix
node validate-directus-site/dist/index.js \
  --url https://cms.drlogist.com \
  --token your-admin-token \
  --prefix mysite \
  --all \
  --fix
```

Or after linking:

```bash
npm link ./validate-directus-site
validate-directus-site --url https://cms.drlogist.com --token xxx --prefix mysite --all -v
```

## What It Checks

| Check | Description | Fixable |
|-------|-------------|---------|
| **Connection** | Can we reach the Directus instance? | No |
| **Collections** | Do all expected collections exist? | Yes (re-provisions) |
| **Fields** | Do collections have required fields with correct types? | Yes (re-provisions) |
| **Relations** | Are FK relations properly configured? | Yes (re-provisions) |
| **Permissions** | Does the Public role have read access? Does form_submissions have create? | Yes (re-provisions) |
| **Settings** | Is the settings singleton populated with a site_name? | No |
| **Environment Variables** | Does `.env.local` have required vars (not placeholders)? | No |
| **Data Integrity** | Orphaned category references? (optional, `--check-data`) | No |

## Output

```
=== Validation Results ===

  [PASS] Connection: Connected to https://cms.drlogist.com
  [PASS] Collections: All 14 expected collections exist
  [PASS] Fields: All critical fields present
  [PASS] Relations: All expected relations configured
  [WARN] Permissions: 2 permission(s) missing
  [PASS] Settings: Settings configured (site: My Site)
  [PASS] Environment Variables: All required env vars configured
  [PASS] Data Integrity: Skipped (use --check-data to enable)

--- Summary ---
  Passed: 6
  Warnings: 1
  Failed: 0
```

## Options

| Flag | Description |
|------|-------------|
| `--url <url>` | Directus instance URL |
| `--token <token>` | Admin API token |
| `--prefix <prefix>` | Collection prefix (e.g. `mysite`) |
| `--dir <path>` | Project directory for env var check |
| `--fix` | Auto-fix fixable issues by re-provisioning |
| `--check-data` | Run data integrity checks (orphaned records) |
| `--all` | Enable all feature checks (products, navigation, pages, etc.) |
| `-v, --verbose` | Show detailed per-check output |
| `-h, --help` | Show help |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DIRECTUS_URL` | Default Directus URL (used if `--url` not provided) |
| `DIRECTUS_ADMIN_TOKEN` | Default admin token (used if `--token` not provided) |

## Auto-Fix Mode

When `--fix` is passed, the tool will attempt to fix issues by running `provision-directus-site` against your Directus instance. This re-creates missing collections, fields, relations, and permissions.

```bash
validate-directus-site --url https://cms.drlogist.com --token xxx --prefix mysite --all --fix
```

Only runs once — if collections, fields, and permissions are all fixable, a single provision pass fixes all three.

## Programmatic Usage

```ts
import { validate } from 'validate-directus-site/lib';

const result = await validate({
  url: 'https://cms.drlogist.com',
  token: 'admin-token',
  prefix: 'mysite',
  features: {
    includeProducts: true,
    includeNavigation: true,
    includePages: true,
    includeForms: true,
    includeAnalytics: true,
    includeRedirects: true,
    includeMedia: false,
    includeBanners: false,
    includeI18n: false,
  },
  fix: false,
  dir: '/path/to/project',
  checkData: true,
});

console.log(result.passed, result.warned, result.failed);

for (const check of result.checks) {
  console.log(`${check.status}: ${check.name} — ${check.message}`);
}
```

### `ValidationResult`

| Field | Type | Description |
|-------|------|-------------|
| `checks` | `CheckResult[]` | Individual check results |
| `passed` | `number` | Count of passed checks |
| `warned` | `number` | Count of warnings |
| `failed` | `number` | Count of failures |
| `fixed` | `number` | Count of auto-fixed issues |

### `CheckResult`

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Check name (e.g. "Collections") |
| `status` | `'pass' \| 'warn' \| 'fail'` | Result status |
| `message` | `string` | Human-readable summary |
| `details` | `CheckDetail[]` | Per-item details |
| `fixable` | `boolean` | Whether `--fix` can resolve this |

## When to Use

- **After provisioning**: Verify everything was created correctly
- **Before deploying**: Ensure the Directus instance is ready
- **Debugging**: Find out why your site can't load data
- **CI/CD**: Add as a pre-deploy check

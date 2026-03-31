import type { ValidateConfig, CheckResult, ValidationResult } from './types.js';

/**
 * Attempt to auto-fix fixable issues by running provision for missing items.
 */
export async function fixIssues(
  config: ValidateConfig,
  results: ValidationResult,
): Promise<number> {
  if (!config.fix) return 0;

  const failedChecks = results.checks.filter((c) => c.status === 'fail' && c.fixable);
  if (failedChecks.length === 0) return 0;

  const provisionable = failedChecks.filter(
    (c) => c.name === 'Collections' || c.name === 'Fields' || c.name === 'Permissions',
  );

  if (provisionable.length === 0) return 0;

  try {
    const { provision } = await import('provision-directus-site/lib');
    await provision({
      url: config.url,
      token: config.token,
      prefix: config.prefix,
      seed: false,
      dryRun: false,
      features: config.features,
    });
    console.log(`  [FIXED] Re-provisioned to fix ${provisionable.map((c) => c.name).join(', ')} issues`);
    return provisionable.length;
  } catch (err) {
    console.error(`  [ERROR] Cannot auto-fix: ${err instanceof Error ? err.message : String(err)}`);
    return 0;
  }
}

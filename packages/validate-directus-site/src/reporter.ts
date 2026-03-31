import type { ValidationResult, CheckResult } from './types.js';

const PASS = '\x1b[32m[PASS]\x1b[0m';
const WARN = '\x1b[33m[WARN]\x1b[0m';
const FAIL = '\x1b[31m[FAIL]\x1b[0m';

function statusLabel(status: CheckResult['status']): string {
  switch (status) {
    case 'pass': return PASS;
    case 'warn': return WARN;
    case 'fail': return FAIL;
  }
}

export function printResults(result: ValidationResult, verbose: boolean = false): void {
  console.log('\n=== Validation Results ===\n');

  for (const check of result.checks) {
    console.log(`  ${statusLabel(check.status)} ${check.name}: ${check.message}`);

    if (verbose && check.details.length > 0) {
      for (const detail of check.details) {
        const prefix = detail.message.includes('MISSING') || detail.message.includes('Missing')
          ? '    ✗'
          : '    ✓';
        console.log(`${prefix} ${detail.message}`);
      }
    }
  }

  console.log('\n--- Summary ---');
  console.log(`  Passed: ${result.passed}`);
  console.log(`  Warnings: ${result.warned}`);
  console.log(`  Failed: ${result.failed}`);
  if (result.fixed > 0) {
    console.log(`  Fixed: ${result.fixed}`);
  }
  console.log('');
}

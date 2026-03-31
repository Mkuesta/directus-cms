import type { ValidateConfig, ValidationResult } from './types.js';
import { validateConnection } from './validators/connection.js';
import { validateCollections } from './validators/collections.js';
import { validateFields } from './validators/fields.js';
import { validateRelations } from './validators/relations.js';
import { validatePermissions } from './validators/permissions.js';
import { validateSettings } from './validators/settings.js';
import { validateEnvVars } from './validators/env-vars.js';
import { validateDataIntegrity } from './validators/data-integrity.js';
import { fixIssues } from './fixer.js';

export async function validate(config: ValidateConfig): Promise<ValidationResult> {
  const result: ValidationResult = {
    checks: [],
    passed: 0,
    warned: 0,
    failed: 0,
    fixed: 0,
  };

  // Step 1: Connection check (must pass to continue)
  const connCheck = await validateConnection(config);
  result.checks.push(connCheck);

  if (connCheck.status === 'fail') {
    result.failed = 1;
    return result;
  }

  // Step 2: Run all other validators
  const [collections, fields, relations, permissions, settings, dataIntegrity] = await Promise.all([
    validateCollections(config),
    validateFields(config),
    validateRelations(config),
    validatePermissions(config),
    validateSettings(config),
    validateDataIntegrity(config),
  ]);

  result.checks.push(collections, fields, relations, permissions, settings);

  // Env vars check (sync, only if dir provided)
  const envVars = validateEnvVars(config);
  result.checks.push(envVars);

  result.checks.push(dataIntegrity);

  // Count results
  for (const check of result.checks) {
    switch (check.status) {
      case 'pass': result.passed++; break;
      case 'warn': result.warned++; break;
      case 'fail': result.failed++; break;
    }
  }

  // Auto-fix if requested
  if (config.fix && result.failed > 0) {
    result.fixed = await fixIssues(config, result);
  }

  return result;
}

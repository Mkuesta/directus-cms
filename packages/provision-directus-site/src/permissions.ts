import type { ProvisionConfig, CollectionSchema } from './types.js';
import { createPermission } from './directus-api.js';

async function getPublicPolicyId(config: ProvisionConfig): Promise<string | null> {
  try {
    const res = await fetch(`${config.url}/policies`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const policies = data.data as any[];
    // Look for the built-in public policy ($t:public_label) first, then user-created "Public"
    const builtIn = policies.find((p) => p.name === '$t:public_label');
    if (builtIn) return builtIn.id;
    const userCreated = policies.find((p) => p.name.toLowerCase() === 'public');
    if (userCreated) return userCreated.id;
    return null;
  } catch {
    return null;
  }
}

export async function setupPermissions(
  config: ProvisionConfig,
  schemas: CollectionSchema[],
): Promise<{ created: number; errors: string[] }> {
  let created = 0;
  const errors: string[] = [];

  // Directus 11+ uses policy-based permissions; older versions use role: null
  const policyId = config.dryRun ? null : await getPublicPolicyId(config);
  const usePolicyApi = policyId !== null;

  if (!config.dryRun && !usePolicyApi) {
    console.log('  Warning: Could not find public policy, falling back to role-based permissions');
  }

  for (const schema of schemas) {
    // Public read permission for all collections
    const readPerm: Record<string, any> = {
      collection: schema.collection,
      action: 'read',
      fields: ['*'],
      permissions: {},
      validation: {},
    };

    if (usePolicyApi) {
      readPerm.policy = policyId;
    } else {
      readPerm.role = null;
    }

    const readResult = await createPermission(config, readPerm);
    if (readResult.created) {
      created++;
    } else if (readResult.error) {
      errors.push(readResult.error);
    }

    // Form submissions get create permission too
    if (schema.collection.endsWith('_form_submissions')) {
      const createPerm: Record<string, any> = {
        collection: schema.collection,
        action: 'create',
        fields: ['form', 'data', 'ip', 'user_agent', 'referrer', 'site', 'site_name'],
        permissions: {},
        validation: {},
      };

      if (usePolicyApi) {
        createPerm.policy = policyId;
      } else {
        createPerm.role = null;
      }

      const createResult = await createPermission(config, createPerm);
      if (createResult.created) {
        created++;
      } else if (createResult.error) {
        errors.push(createResult.error);
      }
    }
  }

  return { created, errors };
}

import type { SiteOptions } from 'create-directus-site/lib';
import type { ProvisionResult } from 'provision-directus-site/lib';

export type { SiteOptions, ProvisionResult };

export interface SetupOptions extends SiteOptions {
  directusAdminToken: string;
  directusStaticToken: string;
  seedData: boolean;
  deployToVercel: boolean;
  vercelProjectName: string;
  adminPassword: string;
  adminSecret: string;
}

export interface StepResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'skipped';
  message: string;
  details?: string[];
}

export interface SetupResult {
  steps: StepResult[];
  projectDir: string;
  provisionResult?: ProvisionResult;
  deployUrl?: string;
}

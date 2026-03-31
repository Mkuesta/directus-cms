import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { testConnection, provision } from 'provision-directus-site/lib';
import type { ProvisionConfig, FeatureFlags } from 'provision-directus-site/lib';
import { checkVercelCli, linkProject, setEnvVar, deploy } from 'deploy-directus-site/lib';
import type { EnvVar } from 'deploy-directus-site/lib';
import { scaffold } from './scaffold.js';
import { stepStart, stepDone } from './logger.js';
import type { SetupOptions, StepResult, SetupResult } from './types.js';

function toFeatureFlags(opts: SetupOptions): FeatureFlags {
  return {
    includeProducts: opts.includeProducts,
    includeNavigation: opts.includeNavigation,
    includePages: opts.includePages,
    includeForms: opts.includeForms,
    includeAnalytics: opts.includeAnalytics,
    includeRedirects: opts.includeRedirects,
    includeMedia: opts.includeMedia,
    includeBanners: opts.includeBanners,
    includeI18n: opts.includeI18n,
  };
}

export async function setup(options: SetupOptions): Promise<SetupResult> {
  const steps: StepResult[] = [];
  const projectDir = path.resolve(process.cwd(), options.siteSlug);
  let provisionResult;
  let deployUrl: string | undefined;

  // Step 1: Validate Directus connection
  stepStart('Validate Directus connection');
  const connected = await testConnection({
    url: options.directusUrl,
    token: options.directusAdminToken,
    prefix: options.collectionPrefix,
    seed: false,
    dryRun: false,
    features: toFeatureFlags(options),
  });
  if (connected) {
    const step: StepResult = { name: 'Validate connection', status: 'success', message: `Connected to ${options.directusUrl}` };
    steps.push(step);
    stepDone(step);
  } else {
    const step: StepResult = { name: 'Validate connection', status: 'error', message: `Cannot reach ${options.directusUrl}` };
    steps.push(step);
    stepDone(step);
    return { steps, projectDir };
  }

  // Step 2: Provision Directus collections
  stepStart('Provision Directus collections');
  try {
    const config: ProvisionConfig = {
      url: options.directusUrl,
      token: options.directusAdminToken,
      prefix: options.collectionPrefix,
      seed: options.seedData,
      dryRun: false,
      features: toFeatureFlags(options),
    };
    provisionResult = await provision(config);
    const hasErrors = provisionResult.errors.length > 0;
    const step: StepResult = {
      name: 'Provision collections',
      status: hasErrors ? 'warning' : 'success',
      message: `${provisionResult.collectionsCreated.length} collections, ${provisionResult.fieldsCreated} fields, ${provisionResult.relationsCreated} relations`,
      details: hasErrors ? provisionResult.errors.slice(0, 5) : undefined,
    };
    steps.push(step);
    stepDone(step);
  } catch (err) {
    const step: StepResult = { name: 'Provision collections', status: 'warning', message: `Failed: ${err instanceof Error ? err.message : String(err)}` };
    steps.push(step);
    stepDone(step);
  }

  // Step 3: Scaffold Next.js project
  stepStart('Scaffold Next.js project');
  if (fs.existsSync(projectDir)) {
    const step: StepResult = { name: 'Scaffold project', status: 'error', message: `Directory "${options.siteSlug}" already exists` };
    steps.push(step);
    stepDone(step);
    return { steps, projectDir, provisionResult };
  }
  try {
    scaffold(options, projectDir, {
      staticToken: options.directusStaticToken,
      adminPassword: options.adminPassword || undefined,
      adminSecret: options.adminSecret || undefined,
    });
    const step: StepResult = { name: 'Scaffold project', status: 'success', message: projectDir };
    steps.push(step);
    stepDone(step);
  } catch (err) {
    const step: StepResult = { name: 'Scaffold project', status: 'error', message: `Failed: ${err instanceof Error ? err.message : String(err)}` };
    steps.push(step);
    stepDone(step);
    return { steps, projectDir, provisionResult };
  }

  // Step 4: npm install
  stepStart('Install dependencies');
  try {
    execSync('npm install --legacy-peer-deps', { cwd: projectDir, stdio: 'pipe', timeout: 120_000 });
    const step: StepResult = { name: 'Install dependencies', status: 'success', message: 'npm install complete' };
    steps.push(step);
    stepDone(step);
  } catch (err) {
    const step: StepResult = { name: 'Install dependencies', status: 'warning', message: 'npm install failed — run manually' };
    steps.push(step);
    stepDone(step);
  }

  // Step 5: Deploy to Vercel
  if (options.deployToVercel) {
    stepStart('Deploy to Vercel');
    if (!checkVercelCli()) {
      const step: StepResult = { name: 'Deploy to Vercel', status: 'warning', message: 'Vercel CLI not found — install with: npm i -g vercel' };
      steps.push(step);
      stepDone(step);
    } else {
      try {
        linkProject(projectDir, options.vercelProjectName);

        // Set environment variables
        const envVars: EnvVar[] = [
          { key: 'NEXT_PUBLIC_DIRECTUS_URL', value: options.directusUrl, required: true },
          { key: 'DIRECTUS_STATIC_TOKEN', value: options.directusStaticToken, required: true },
        ];
        if (options.adminPassword) {
          envVars.push({ key: 'ADMIN_PASSWORD', value: options.adminPassword, required: true });
        }
        if (options.adminSecret) {
          envVars.push({ key: 'ADMIN_SECRET', value: options.adminSecret, required: true });
        }
        for (const ev of envVars) {
          setEnvVar(projectDir, ev, true);
        }

        deployUrl = deploy(projectDir);
        const step: StepResult = { name: 'Deploy to Vercel', status: 'success', message: deployUrl };
        steps.push(step);
        stepDone(step);
      } catch (err) {
        const step: StepResult = { name: 'Deploy to Vercel', status: 'warning', message: `Failed: ${err instanceof Error ? err.message : String(err)}` };
        steps.push(step);
        stepDone(step);
      }
    }
  } else {
    const step: StepResult = { name: 'Deploy to Vercel', status: 'skipped', message: 'Skipped' };
    steps.push(step);
    stepDone(step);
  }

  return { steps, projectDir, provisionResult, deployUrl };
}

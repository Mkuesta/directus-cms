import * as path from 'node:path';
import * as fs from 'node:fs';
import { checkVercelCli, linkProject, setEnvVar, deploy } from './vercel.js';
import { detectRequiredEnvVars, readEnvLocal, hasDirectusCmsDep } from './env-vars.js';
import { promptForEnvVars, promptForProjectName } from './prompts.js';
import type { EnvVar } from './types.js';

function parseArgs(args: string[]): Record<string, string | boolean> {
  const result: Record<string, any> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dir':
        result.dir = args[++i];
        break;
      case '--project-name':
        result.projectName = args[++i];
        break;
      case '--directus-url':
        result.directusUrl = args[++i];
        break;
      case '--directus-token':
        result.directusToken = args[++i];
        break;
      case '--admin-password':
        result.adminPassword = args[++i];
        break;
      case '--admin-secret':
        result.adminSecret = args[++i];
        break;
      case '--force':
        result.force = true;
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
Usage: deploy-directus-site [options]

Options:
  --dir <path>              Site directory (default: current directory)
  --project-name <name>     Vercel project name (default: directory name)
  --directus-url <url>      Directus URL
  --directus-token <token>  Directus static token
  --admin-password <pass>   Admin panel password
  --admin-secret <secret>   Admin JWT secret
  --force                   Overwrite existing env vars
  --help, -h                Show this help

Interactive mode:
  Run from inside a scaffolded site directory without flags to be prompted.

Examples:
  cd my-site && deploy-directus-site
  deploy-directus-site --dir ./my-site --directus-url https://cms.example.com --directus-token abc123
`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  // Step 1: Validate prerequisites
  console.log('\nDeploy Directus Site\n');

  if (!checkVercelCli()) {
    console.error('Error: Vercel CLI is not installed.');
    console.error('Install it with: npm install -g vercel');
    process.exit(1);
  }
  console.log('  Vercel CLI found');

  const dir = path.resolve(parsed.dir as string || process.cwd());

  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    console.error(`Error: No package.json found in ${dir}`);
    process.exit(1);
  }

  if (!hasDirectusCmsDep(dir)) {
    console.error('Error: This directory does not contain a @mkuesta/core dependency.');
    console.error('Run create-directus-site first to scaffold a project.');
    process.exit(1);
  }
  console.log(`  Valid Directus CMS project: ${dir}`);

  // Step 2: Collect env vars
  const requiredVars = detectRequiredEnvVars(dir);
  const envLocal = readEnvLocal(dir);

  // Apply CLI flags to prefill
  if (parsed.directusUrl) envLocal['NEXT_PUBLIC_DIRECTUS_URL'] = parsed.directusUrl as string;
  if (parsed.directusToken) envLocal['DIRECTUS_STATIC_TOKEN'] = parsed.directusToken as string;
  if (parsed.adminPassword) envLocal['ADMIN_PASSWORD'] = parsed.adminPassword as string;
  if (parsed.adminSecret) envLocal['ADMIN_SECRET'] = parsed.adminSecret as string;

  // Check if all values are available from CLI flags + env file
  const allPrefilled = requiredVars.every((v) => envLocal[v.key]);
  let envVars: EnvVar[];

  if (allPrefilled) {
    envVars = requiredVars.map((v) => ({ ...v, value: envLocal[v.key] }));
    console.log(`  ${envVars.length} env vars collected from .env.local / CLI flags`);
  } else {
    envVars = await promptForEnvVars(requiredVars, envLocal);
  }

  // Step 3: Determine project name
  const defaultProjectName = path.basename(dir);
  const projectName = (parsed.projectName as string) || (allPrefilled ? defaultProjectName : await promptForProjectName(defaultProjectName));

  // Step 4: Link project
  console.log('\n--- Vercel Setup ---');
  linkProject(dir, projectName);

  // Step 5: Set env vars
  console.log('\n--- Environment Variables ---');
  const force = !!parsed.force;
  const setVars: string[] = [];
  for (const envVar of envVars) {
    const set = setEnvVar(dir, envVar, force);
    if (set) setVars.push(envVar.key);
  }

  // Step 6: Deploy
  console.log('\n--- Deploy ---');
  const url = deploy(dir);

  // Step 7: Print summary
  console.log('\n=== Deployment Complete ===');
  console.log(`  Project: ${projectName}`);
  console.log(`  URL: ${url}`);
  console.log(`  Env vars set: ${setVars.length}`);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

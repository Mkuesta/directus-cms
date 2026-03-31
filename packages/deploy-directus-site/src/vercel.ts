import { execSync } from 'node:child_process';
import type { EnvVar } from './types.js';

function run(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err: any) {
    throw new Error(`Command failed: ${cmd}\n${err.stderr || err.message}`);
  }
}

export function checkVercelCli(): boolean {
  try {
    execSync('vercel --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return true;
  } catch {
    return false;
  }
}

export function linkProject(dir: string, projectName: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
    throw new Error(`Invalid project name: "${projectName}". Only alphanumeric, hyphens, and underscores are allowed.`);
  }
  console.log('  Linking Vercel project...');
  try {
    run(`vercel link --yes --project ${projectName}`, dir);
    console.log(`  Linked to project: ${projectName}`);
  } catch {
    // Project may not exist yet, create it
    console.log('  Project not found, creating...');
    run(`vercel link --yes`, dir);
    console.log('  Project created and linked');
  }
}

export function setEnvVar(dir: string, envVar: EnvVar, force: boolean): boolean {
  const { key, value } = envVar;

  // Check if env var already exists
  if (!force) {
    try {
      const existing = run(`vercel env ls`, dir);
      if (existing.includes(key)) {
        console.log(`  Skipped (exists): ${key}`);
        return false;
      }
    } catch {
      // If listing fails, proceed with setting
    }
  }

  try {
    // Set for production and preview environments — pass value via stdin to avoid shell injection
    execSync(`vercel env add ${key} production preview`, {
      cwd: dir,
      encoding: 'utf-8',
      input: value,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(`  Set: ${key}`);
    return true;
  } catch (err: any) {
    // Env var may already exist
    if (err.stderr?.includes('already exists') || err.stderr?.includes('already been added')) {
      if (force) {
        try {
          run(`vercel env rm ${key} production preview --yes`, dir);
          execSync(`vercel env add ${key} production preview`, {
            cwd: dir,
            encoding: 'utf-8',
            input: value,
            stdio: ['pipe', 'pipe', 'pipe'],
          });
          console.log(`  Updated: ${key}`);
          return true;
        } catch {
          console.error(`  Failed to update: ${key}`);
          return false;
        }
      }
      console.log(`  Skipped (exists): ${key}`);
      return false;
    }
    console.error(`  Failed to set: ${key} - ${err.message}`);
    return false;
  }
}

export function deploy(dir: string): string {
  console.log('  Deploying to production...');
  const output = run('vercel --prod --yes', dir);
  // Extract URL from output (last line is usually the URL)
  const lines = output.split('\n');
  const url = lines[lines.length - 1] || '';
  return url;
}

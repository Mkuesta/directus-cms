import * as readline from 'node:readline';
import type { EnvVar } from './types.js';

function ask(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

export async function promptForEnvVars(
  envVars: EnvVar[],
  prefilled: Record<string, string>,
): Promise<EnvVar[]> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log('\n--- Environment Variables ---');
    const result: EnvVar[] = [];

    for (const envVar of envVars) {
      const existing = prefilled[envVar.key];
      const value = await ask(rl, `${envVar.key}`, existing || undefined);

      if (!value && envVar.required) {
        console.error(`Error: ${envVar.key} is required`);
        process.exit(1);
      }

      result.push({ ...envVar, value });
    }

    return result;
  } finally {
    rl.close();
  }
}

export async function promptForProjectName(defaultName: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await ask(rl, 'Vercel project name', defaultName);
  } finally {
    rl.close();
  }
}

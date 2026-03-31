import { askSetup } from './prompts.js';
import { setup } from './orchestrator.js';
import { printSummary } from './logger.js';

async function main() {
  console.log('\n  Setup Directus Site\n');
  const options = await askSetup();
  const result = await setup(options);
  printSummary(result);
  process.exit(result.steps.some(s => s.status === 'error') ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

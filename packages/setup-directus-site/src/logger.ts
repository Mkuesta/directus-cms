import type { SetupResult, StepResult } from './types.js';

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const STATUS_ICON: Record<StepResult['status'], string> = {
  success: `${GREEN}✓${RESET}`,
  warning: `${YELLOW}⚠${RESET}`,
  error: `${RED}✗${RESET}`,
  skipped: `${DIM}–${RESET}`,
};

export function stepStart(name: string) {
  process.stdout.write(`\n${CYAN}▸${RESET} ${name}...`);
}

export function stepDone(result: StepResult) {
  process.stdout.write(`\r${STATUS_ICON[result.status]} ${result.name}: ${result.message}\n`);
  if (result.details?.length) {
    for (const d of result.details) {
      console.log(`  ${DIM}${d}${RESET}`);
    }
  }
}

export function printSummary(result: SetupResult) {
  console.log(`\n${BOLD}${'─'.repeat(50)}${RESET}`);
  console.log(`${BOLD}  Setup Complete${RESET}\n`);

  for (const step of result.steps) {
    console.log(`  ${STATUS_ICON[step.status]} ${step.name}: ${step.message}`);
  }

  console.log('');

  if (result.provisionResult) {
    const pr = result.provisionResult;
    console.log(`  ${DIM}Collections: ${pr.collectionsCreated.length} created, ${pr.collectionsSkipped.length} skipped${RESET}`);
    console.log(`  ${DIM}Fields: ${pr.fieldsCreated} created, ${pr.fieldsSkipped} skipped${RESET}`);
    console.log(`  ${DIM}Relations: ${pr.relationsCreated} created, ${pr.relationsSkipped} skipped${RESET}`);
    if (pr.itemsSeeded > 0) {
      console.log(`  ${DIM}Seed data: ${pr.itemsSeeded} items${RESET}`);
    }
    if (pr.errors.length > 0) {
      console.log(`  ${YELLOW}Provisioning warnings: ${pr.errors.length}${RESET}`);
    }
    console.log('');
  }

  if (result.deployUrl) {
    console.log(`  ${GREEN}Deployed:${RESET} ${result.deployUrl}`);
  }

  console.log(`  ${GREEN}Project:${RESET}  ${result.projectDir}`);

  const hasErrors = result.steps.some(s => s.status === 'error');
  if (!hasErrors && !result.deployUrl) {
    console.log(`\n  ${BOLD}Next steps:${RESET}`);
    console.log(`    cd ${result.projectDir}`);
    console.log('    npm run dev\n');
  } else {
    console.log('');
  }
}

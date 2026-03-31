import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-'));
}

export function removeTmpDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

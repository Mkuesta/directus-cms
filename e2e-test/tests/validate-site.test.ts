import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { validateEnvVars } from '../../validate-directus-site/src/validators/env-vars.js';
import type { ValidateConfig } from '../../validate-directus-site/src/types.js';
import { createTmpDir, removeTmpDir } from '../../directus-cms-testing/src/cleanup.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = createTmpDir();
});

afterEach(() => {
  removeTmpDir(tmpDir);
});

function writeEnv(content: string) {
  fs.writeFileSync(path.join(tmpDir, '.env.local'), content);
}

function makeConfig(overrides?: Partial<ValidateConfig>): ValidateConfig {
  return {
    url: 'https://example.com',
    token: 'test-token',
    prefix: 'test',
    features: {
      includeProducts: false,
      includeNavigation: true,
      includePages: true,
      includeForms: true,
      includeAnalytics: true,
      includeRedirects: true,
      includeMedia: false,
      includeBanners: false,
      includeI18n: false,
    },
    fix: false,
    dir: tmpDir,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateEnvVars
// ---------------------------------------------------------------------------

describe('validateEnvVars', () => {
  it('returns warn status when no dir specified', () => {
    const config = makeConfig({ dir: undefined });
    const result = validateEnvVars(config);
    expect(result.status).toBe('warn');
    expect(result.name).toBe('Environment Variables');
    expect(result.message).toContain('No project directory specified');
  });

  it('returns fail when .env.local does not exist', () => {
    // tmpDir exists but has no .env.local file
    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('fail');
    expect(result.message).toContain('.env.local not found');
  });

  it('returns pass when all required vars are set with real values', () => {
    writeEnv([
      'NEXT_PUBLIC_DIRECTUS_URL=https://my-directus.example.com',
      'DIRECTUS_STATIC_TOKEN=abcdef123456',
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('pass');
    expect(result.message).toBe('All required env vars configured');
    expect(result.details).toHaveLength(2);
    expect(result.details[0].message).toContain('is set');
    expect(result.details[1].message).toContain('is set');
  });

  it('returns fail when required vars are missing', () => {
    writeEnv([
      '# Only some vars',
      'SOME_OTHER_VAR=hello',
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('fail');
    expect(result.message).toContain('2 env var issue(s)');
    expect(result.details).toHaveLength(2);
    expect(result.details[0].message).toContain('NEXT_PUBLIC_DIRECTUS_URL is not set');
    expect(result.details[1].message).toContain('DIRECTUS_STATIC_TOKEN is not set');
  });

  it('returns fail when vars have placeholder values', () => {
    writeEnv([
      'NEXT_PUBLIC_DIRECTUS_URL=your-directus-url',
      'DIRECTUS_STATIC_TOKEN=your-directus-token-here',
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('fail');
    expect(result.message).toContain('2 env var issue(s)');
    expect(result.details[0].message).toContain('placeholder');
    expect(result.details[1].message).toContain('placeholder');
  });

  it('returns fail when one var is set and one is missing', () => {
    writeEnv([
      'NEXT_PUBLIC_DIRECTUS_URL=https://real-directus.example.com',
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('fail');
    expect(result.message).toContain('1 env var issue(s)');
    // First var should pass
    expect(result.details[0].message).toContain('NEXT_PUBLIC_DIRECTUS_URL is set');
    // Second var should fail
    expect(result.details[1].message).toContain('DIRECTUS_STATIC_TOKEN is not set');
  });

  it('correctly parses double-quoted values', () => {
    writeEnv([
      'NEXT_PUBLIC_DIRECTUS_URL="https://my-directus.example.com"',
      'DIRECTUS_STATIC_TOKEN="abcdef123456"',
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('pass');
  });

  it('correctly parses single-quoted values', () => {
    writeEnv([
      "NEXT_PUBLIC_DIRECTUS_URL='https://my-directus.example.com'",
      "DIRECTUS_STATIC_TOKEN='abcdef123456'",
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('pass');
  });

  it('ignores comments and blank lines', () => {
    writeEnv([
      '# This is a comment',
      '',
      '  # Another comment',
      '',
      'NEXT_PUBLIC_DIRECTUS_URL=https://my-directus.example.com',
      '',
      '# Token below',
      'DIRECTUS_STATIC_TOKEN=abcdef123456',
      '',
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('pass');
  });

  it('detects https://example.com as a placeholder value', () => {
    writeEnv([
      'NEXT_PUBLIC_DIRECTUS_URL=https://example.com',
      'DIRECTUS_STATIC_TOKEN=abcdef123456',
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    // https://example.com is not in the placeholder list, so it should pass
    // The placeholders are 'your-directus-url' and 'https://example.com'
    // Wait - 'https://example.com' IS in the placeholder list for NEXT_PUBLIC_DIRECTUS_URL
    expect(result.status).toBe('fail');
    expect(result.details[0].message).toContain('placeholder');
  });

  it('returns fixable as false', () => {
    writeEnv('NEXT_PUBLIC_DIRECTUS_URL=https://real.example.com\nDIRECTUS_STATIC_TOKEN=real-token');
    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.fixable).toBe(false);
  });

  it('detects your-token as placeholder for DIRECTUS_STATIC_TOKEN', () => {
    writeEnv([
      'NEXT_PUBLIC_DIRECTUS_URL=https://real-directus.example.com',
      'DIRECTUS_STATIC_TOKEN=your-token',
    ].join('\n'));

    const config = makeConfig();
    const result = validateEnvVars(config);
    expect(result.status).toBe('fail');
    expect(result.details[1].message).toContain('placeholder');
  });
});

// ---------------------------------------------------------------------------
// validate function shape
// ---------------------------------------------------------------------------

describe('validate function', () => {
  it('is an exported async function', async () => {
    const { validate } = await import('../../validate-directus-site/src/validate.js');
    expect(typeof validate).toBe('function');
  });

  it('exports the expected types', async () => {
    // Verify the types module exports the expected interfaces by importing them
    const types = await import('../../validate-directus-site/src/types.js');
    // The module should be importable without error
    expect(types).toBeDefined();
  });

  it('validateEnvVars returns a CheckResult with the expected shape', () => {
    const config = makeConfig();
    const result = validateEnvVars(config);

    // Verify the shape matches CheckResult
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('details');
    expect(result).toHaveProperty('fixable');
    expect(typeof result.name).toBe('string');
    expect(['pass', 'warn', 'fail']).toContain(result.status);
    expect(typeof result.message).toBe('string');
    expect(Array.isArray(result.details)).toBe(true);
    expect(typeof result.fixable).toBe('boolean');
  });
});

import { describe, it, expect } from 'vitest';
import {
  generateAuthConfig,
  generateAuthCallbackRoute,
  generatePackageJson,
  generateEnvLocal,
} from '../../create-directus-site/src/generators.js';
import { getSchemas } from '../../provision-directus-site/src/schemas/index.js';
import { createCoreOnlySiteOptions, createCoreOnlyFeatures } from './helpers/fixtures.js';
import {
  createMockAuthConfig,
  createUserProfile,
  createDirectusUserProfile,
} from '../../directus-cms-testing/src/index.js';

describe('@directus-cms/auth', () => {
  describe('provisioning schema', () => {
    it('includeAuth adds user_profiles collection', () => {
      const features = { ...createCoreOnlyFeatures(), includeAuth: true };
      const schemas = getSchemas('test', features);
      const names = schemas.map((s) => s.collection);
      expect(names).toContain('test_user_profiles');
    });

    it('user_profiles schema has required fields', () => {
      const features = { ...createCoreOnlyFeatures(), includeAuth: true };
      const schemas = getSchemas('test', features);
      const profileSchema = schemas.find((s) => s.collection === 'test_user_profiles');
      expect(profileSchema).toBeDefined();
      const fieldNames = profileSchema!.fields.map((f) => f.field);
      expect(fieldNames).toContain('supabase_uid');
      expect(fieldNames).toContain('email');
      expect(fieldNames).toContain('display_name');
      expect(fieldNames).toContain('role');
      expect(fieldNames).toContain('avatar_url');
      expect(fieldNames).toContain('preferences');
    });
  });

  describe('scaffolding', () => {
    it('generateAuthConfig produces non-empty output', () => {
      const opts = createCoreOnlySiteOptions({ includeAuth: true });
      const output = generateAuthConfig(opts);
      expect(output.length).toBeGreaterThan(0);
      expect(output).toContain('@directus-cms/auth');
      expect(output).toContain('createAuthClient');
    });

    it('generateAuthCallbackRoute exports GET', () => {
      const output = generateAuthCallbackRoute();
      expect(output).toContain('export const GET');
    });

    it('generateEnvLocal with auth includes Supabase env vars', () => {
      const env = generateEnvLocal(createCoreOnlySiteOptions({ includeAuth: true }));
      expect(env).toContain('NEXT_PUBLIC_SUPABASE_URL=');
      expect(env).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
      expect(env).toContain('SUPABASE_SERVICE_ROLE_KEY=');
    });

    it('generatePackageJson with auth adds @directus-cms/auth', () => {
      const json = JSON.parse(generatePackageJson(createCoreOnlySiteOptions({ includeAuth: true })));
      expect(json.dependencies).toHaveProperty('@directus-cms/auth');
    });
  });

  describe('testing utilities', () => {
    it('createMockAuthConfig returns valid config', () => {
      const config = createMockAuthConfig();
      expect(config.collections.userProfiles).toBe('test_user_profiles');
      expect(config.supabaseUrl).toBeTruthy();
      expect(config.supabaseAnonKey).toBeTruthy();
    });

    it('createUserProfile returns camelCase fixture', () => {
      const profile = createUserProfile();
      expect(profile.supabaseUid).toMatch(/^supabase-uid-\d+$/);
      expect(profile.email).toContain('@example.com');
      expect(profile.role).toBe('user');
    });

    it('createDirectusUserProfile returns snake_case fixture', () => {
      const profile = createDirectusUserProfile();
      expect(profile.supabase_uid).toMatch(/^supabase-uid-\d+$/);
      expect(profile.email).toContain('@example.com');
      expect(profile.role).toBe('user');
    });
  });
});

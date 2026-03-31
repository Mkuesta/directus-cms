import { describe, it, expect } from 'vitest';
import {
  generateEmailConfig,
  generateEmailApiRoute,
  generatePackageJson,
  generateEnvLocal,
} from '../../create-directus-site/src/generators.js';
import { getSchemas } from '../../provision-directus-site/src/schemas/index.js';
import { createCoreOnlySiteOptions, createCoreOnlyFeatures } from './helpers/fixtures.js';
import {
  createMockEmailConfig,
  createEmailTemplate,
  createDirectusEmailTemplate,
} from '../../directus-cms-testing/src/index.js';

describe('@directus-cms/email', () => {
  describe('provisioning schema', () => {
    it('includeEmail adds email_templates and email_log collections', () => {
      const features = { ...createCoreOnlyFeatures(), includeEmail: true };
      const schemas = getSchemas('test', features);
      const names = schemas.map((s) => s.collection);
      expect(names).toContain('test_email_templates');
      expect(names).toContain('test_email_log');
    });

    it('email_templates schema has required fields', () => {
      const features = { ...createCoreOnlyFeatures(), includeEmail: true };
      const schemas = getSchemas('test', features);
      const templateSchema = schemas.find((s) => s.collection === 'test_email_templates');
      expect(templateSchema).toBeDefined();
      const fieldNames = templateSchema!.fields.map((f) => f.field);
      expect(fieldNames).toContain('slug');
      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('subject');
      expect(fieldNames).toContain('html_body');
      expect(fieldNames).toContain('status');
      expect(fieldNames).toContain('variables');
    });

    it('email_log schema has required fields', () => {
      const features = { ...createCoreOnlyFeatures(), includeEmail: true };
      const schemas = getSchemas('test', features);
      const logSchema = schemas.find((s) => s.collection === 'test_email_log');
      expect(logSchema).toBeDefined();
      const fieldNames = logSchema!.fields.map((f) => f.field);
      expect(fieldNames).toContain('to_email');
      expect(fieldNames).toContain('from_email');
      expect(fieldNames).toContain('subject');
      expect(fieldNames).toContain('status');
      expect(fieldNames).toContain('resend_id');
    });
  });

  describe('scaffolding', () => {
    it('generateEmailConfig produces non-empty output', () => {
      const opts = createCoreOnlySiteOptions({ includeEmail: true });
      const output = generateEmailConfig(opts);
      expect(output.length).toBeGreaterThan(0);
      expect(output).toContain('@directus-cms/email');
      expect(output).toContain('createEmailClient');
    });

    it('generateEmailApiRoute exports POST', () => {
      const output = generateEmailApiRoute();
      expect(output).toContain('export const POST');
    });

    it('generateEnvLocal with email includes RESEND_API_KEY and EMAIL_FROM', () => {
      const env = generateEnvLocal(createCoreOnlySiteOptions({ includeEmail: true }));
      expect(env).toContain('RESEND_API_KEY=');
      expect(env).toContain('EMAIL_FROM=');
    });

    it('generatePackageJson with email adds @directus-cms/email', () => {
      const json = JSON.parse(generatePackageJson(createCoreOnlySiteOptions({ includeEmail: true })));
      expect(json.dependencies).toHaveProperty('@directus-cms/email');
    });
  });

  describe('testing utilities', () => {
    it('createMockEmailConfig returns valid config', () => {
      const config = createMockEmailConfig();
      expect(config.collections.templates).toBe('test_email_templates');
      expect(config.collections.log).toBe('test_email_log');
      expect(config.resendApiKey).toBeTruthy();
      expect(config.fromEmail).toBeTruthy();
    });

    it('createEmailTemplate returns camelCase fixture', () => {
      const template = createEmailTemplate();
      expect(template.slug).toMatch(/^template-\d+$/);
      expect(template.htmlBody).toBeTruthy();
      expect(template.subject).toBeTruthy();
    });

    it('createDirectusEmailTemplate returns snake_case fixture', () => {
      const template = createDirectusEmailTemplate();
      expect(template.slug).toMatch(/^template-\d+$/);
      expect(template.html_body).toBeTruthy();
      expect(template.subject).toBeTruthy();
    });
  });
});

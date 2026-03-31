import { describe, it, expect } from 'vitest';
import {
  generateStripeConfig,
  generateStripeCheckoutRoute,
  generateStripeWebhookRoute,
  generatePackageJson,
  generateEnvLocal,
} from '../../create-directus-site/src/generators.js';
import { getSchemas } from '../../provision-directus-site/src/schemas/index.js';
import { createCoreOnlySiteOptions, createCoreOnlyFeatures } from './helpers/fixtures.js';
import {
  createMockStripeConfig,
  createOrder,
  createDirectusOrder,
} from '../../directus-cms-testing/src/index.js';

describe('@directus-cms/stripe', () => {
  describe('provisioning schema', () => {
    it('includeStripe adds orders collection', () => {
      const features = { ...createCoreOnlyFeatures(), includeStripe: true };
      const schemas = getSchemas('test', features);
      const names = schemas.map((s) => s.collection);
      expect(names).toContain('test_orders');
    });

    it('orders schema has required fields', () => {
      const features = { ...createCoreOnlyFeatures(), includeStripe: true };
      const schemas = getSchemas('test', features);
      const orderSchema = schemas.find((s) => s.collection === 'test_orders');
      expect(orderSchema).toBeDefined();
      const fieldNames = orderSchema!.fields.map((f) => f.field);
      expect(fieldNames).toContain('stripe_session_id');
      expect(fieldNames).toContain('stripe_payment_intent');
      expect(fieldNames).toContain('customer_email');
      expect(fieldNames).toContain('status');
      expect(fieldNames).toContain('line_items');
      expect(fieldNames).toContain('subtotal');
      expect(fieldNames).toContain('tax');
      expect(fieldNames).toContain('total');
      expect(fieldNames).toContain('currency');
    });
  });

  describe('scaffolding', () => {
    it('generateStripeConfig produces non-empty output', () => {
      const opts = createCoreOnlySiteOptions({ includeStripe: true, includeProducts: true });
      const output = generateStripeConfig(opts);
      expect(output.length).toBeGreaterThan(0);
      expect(output).toContain('@directus-cms/stripe');
      expect(output).toContain('createStripeClient');
    });

    it('generateStripeCheckoutRoute exports POST', () => {
      const output = generateStripeCheckoutRoute();
      expect(output).toContain('export const POST');
    });

    it('generateStripeWebhookRoute exports POST', () => {
      const output = generateStripeWebhookRoute();
      expect(output).toContain('export const POST');
    });

    it('generateEnvLocal with stripe includes Stripe env vars', () => {
      const env = generateEnvLocal(createCoreOnlySiteOptions({ includeStripe: true }));
      expect(env).toContain('STRIPE_SECRET_KEY=');
      expect(env).toContain('STRIPE_WEBHOOK_SECRET=');
      expect(env).toContain('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=');
    });

    it('generatePackageJson with stripe adds @directus-cms/stripe', () => {
      const json = JSON.parse(generatePackageJson(createCoreOnlySiteOptions({ includeStripe: true })));
      expect(json.dependencies).toHaveProperty('@directus-cms/stripe');
    });
  });

  describe('testing utilities', () => {
    it('createMockStripeConfig returns valid config', () => {
      const config = createMockStripeConfig();
      expect(config.collections.orders).toBe('test_orders');
      expect(config.collections.products).toBe('test_products');
      expect(config.stripeSecretKey).toBeTruthy();
      expect(config.stripeWebhookSecret).toBeTruthy();
      expect(config.currency).toBe('eur');
    });

    it('createOrder returns camelCase fixture', () => {
      const order = createOrder();
      expect(order.stripeSessionId).toMatch(/^cs_test_\d+$/);
      expect(order.customerEmail).toContain('@example.com');
      expect(order.status).toBe('paid');
      expect(order.lineItems).toHaveLength(1);
    });

    it('createDirectusOrder returns snake_case fixture', () => {
      const order = createDirectusOrder();
      expect(order.stripe_session_id).toMatch(/^cs_test_\d+$/);
      expect(order.customer_email).toContain('@example.com');
      expect(order.status).toBe('paid');
      expect(order.line_items).toHaveLength(1);
    });
  });
});

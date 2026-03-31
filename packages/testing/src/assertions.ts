import { expect } from 'vitest';

/**
 * Assert that an HTML string contains a valid JSON-LD script tag
 * with the expected Schema.org @type and optional properties.
 */
export function expectJsonLd(
  html: string,
  expectedType: string,
  expectedProps?: Record<string, any>,
): void {
  const match = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  expect(match, `Expected JSON-LD script tag in HTML`).toBeTruthy();

  const jsonLd = JSON.parse(match![1]);
  expect(jsonLd['@type']).toBe(expectedType);

  if (expectedProps) {
    for (const [key, value] of Object.entries(expectedProps)) {
      expect(jsonLd[key]).toEqual(value);
    }
  }
}

/**
 * Assert that a rendered React element (as HTML string) contains
 * valid JSON-LD with the expected type and properties.
 */
export function expectJsonLdFromElement(
  element: any,
  expectedType: string,
  expectedProps?: Record<string, any>,
): void {
  // For React Server Components rendered to string
  const html = typeof element === 'string' ? element : String(element);
  expectJsonLd(html, expectedType, expectedProps);
}

import { describe, it, expect } from 'vitest';
import { createSeoClient } from '../../directus-cms-seo/src/index.js';
import {
  generateBreadcrumbList,
  generateOrganization,
  generateWebSite,
  generateHowTo,
  generateEvent,
  generateFAQPage,
  generateLocalBusiness,
  generateVideoObject,
  generateArticle,
  buildSchemaGraph,
} from '../../directus-cms-seo/src/schemas.js';
import { generateMetaTags, generateCanonicalUrl } from '../../directus-cms-seo/src/meta-tags.js';
import { buildBreadcrumbs } from '../../directus-cms-seo/src/breadcrumbs.js';
import type { SeoConfig } from '../../directus-cms-seo/src/types.js';

// ---------------------------------------------------------------------------
// Shared config fixtures
// ---------------------------------------------------------------------------
function createBaseConfig(): SeoConfig {
  return {
    baseUrl: 'https://example.com',
    siteName: 'Example Site',
  };
}

function createFullConfig(): SeoConfig {
  return {
    baseUrl: 'https://example.com',
    siteName: 'Example Site',
    defaultOgImage: 'https://example.com/og.jpg',
    twitterHandle: 'examplesite',
    trailingSlash: false,
    organization: {
      name: 'Example Inc.',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
      sameAs: ['https://twitter.com/example', 'https://linkedin.com/company/example'],
      email: 'info@example.com',
      telephone: '+1-555-0100',
      legalName: 'Example Inc. LLC',
      description: 'A leading example company.',
    },
  };
}

// ---------------------------------------------------------------------------
// createSeoClient
// ---------------------------------------------------------------------------
describe('createSeoClient', () => {
  it('returns client with all methods bound', () => {
    const config = createBaseConfig();
    const client = createSeoClient(config);

    expect(typeof client.generateBreadcrumbList).toBe('function');
    expect(typeof client.generateOrganization).toBe('function');
    expect(typeof client.generateWebSite).toBe('function');
    expect(typeof client.generateHowTo).toBe('function');
    expect(typeof client.generateEvent).toBe('function');
    expect(typeof client.generateFAQPage).toBe('function');
    expect(typeof client.generateArticle).toBe('function');
    expect(typeof client.buildSchemaGraph).toBe('function');
    expect(typeof client.generateLocalBusiness).toBe('function');
    expect(typeof client.generateVideoObject).toBe('function');
    expect(typeof client.generateMetaTags).toBe('function');
    expect(typeof client.generateCanonicalUrl).toBe('function');
  });

  it('config is accessible on client', () => {
    const config = createBaseConfig();
    const client = createSeoClient(config);
    expect(client.config).toBe(config);
    expect(client.config.siteName).toBe('Example Site');
    expect(client.config.baseUrl).toBe('https://example.com');
  });

  it('client methods use the bound config', () => {
    const config = createBaseConfig();
    const client = createSeoClient(config);

    const org = client.generateOrganization();
    expect(org.name).toBe('Example Site');
    expect(org.url).toBe('https://example.com');
  });
});

// ---------------------------------------------------------------------------
// generateBreadcrumbList
// ---------------------------------------------------------------------------
describe('generateBreadcrumbList', () => {
  it('returns valid BreadcrumbList schema with @context and @type', () => {
    const config = createBaseConfig();
    const result = generateBreadcrumbList(config, [
      { name: 'Home', url: '/' },
    ]);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('BreadcrumbList');
    expect(result.itemListElement).toBeDefined();
  });

  it('items have correct position numbers (1-indexed)', () => {
    const config = createBaseConfig();
    const result = generateBreadcrumbList(config, [
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: 'Post', url: '/blog/my-post' },
    ]);

    const items = result.itemListElement as any[];
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
    expect(items[2].position).toBe(3);
  });

  it('relative URLs are prepended with baseUrl', () => {
    const config = createBaseConfig();
    const result = generateBreadcrumbList(config, [
      { name: 'Blog', url: '/blog' },
    ]);

    const items = result.itemListElement as any[];
    expect(items[0].item).toBe('https://example.com/blog');
  });

  it('absolute URLs are used as-is', () => {
    const config = createBaseConfig();
    const result = generateBreadcrumbList(config, [
      { name: 'External', url: 'https://other.com/page' },
    ]);

    const items = result.itemListElement as any[];
    expect(items[0].item).toBe('https://other.com/page');
  });

  it('items have @type ListItem and correct name', () => {
    const config = createBaseConfig();
    const result = generateBreadcrumbList(config, [
      { name: 'Products', url: '/products' },
    ]);

    const items = result.itemListElement as any[];
    expect(items[0]['@type']).toBe('ListItem');
    expect(items[0].name).toBe('Products');
  });
});

// ---------------------------------------------------------------------------
// generateOrganization
// ---------------------------------------------------------------------------
describe('generateOrganization', () => {
  it('returns basic org with just siteName when no org config', () => {
    const config = createBaseConfig();
    const result = generateOrganization(config);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Organization');
    expect(result.name).toBe('Example Site');
    expect(result.url).toBe('https://example.com');
  });

  it('includes logo, sameAs, email, telephone when provided', () => {
    const config = createFullConfig();
    const result = generateOrganization(config);

    expect(result.name).toBe('Example Inc.');
    expect(result.logo).toBe('https://example.com/logo.png');
    expect(result.sameAs).toEqual([
      'https://twitter.com/example',
      'https://linkedin.com/company/example',
    ]);
    expect(result.email).toBe('info@example.com');
    expect(result.telephone).toBe('+1-555-0100');
  });

  it('includes legalName and description when provided', () => {
    const config = createFullConfig();
    const result = generateOrganization(config);

    expect(result.legalName).toBe('Example Inc. LLC');
    expect(result.description).toBe('A leading example company.');
  });

  it('uses org url or falls back to baseUrl', () => {
    const configWithOrgUrl = createFullConfig();
    const result1 = generateOrganization(configWithOrgUrl);
    expect(result1.url).toBe('https://example.com');

    const configWithoutOrgUrl: SeoConfig = {
      ...createBaseConfig(),
      organization: { name: 'Test Org' },
    };
    const result2 = generateOrganization(configWithoutOrgUrl);
    expect(result2.url).toBe('https://example.com');
  });

  it('omits optional fields when not provided in organization', () => {
    const config: SeoConfig = {
      ...createBaseConfig(),
      organization: { name: 'Minimal Org' },
    };
    const result = generateOrganization(config);

    expect(result.logo).toBeUndefined();
    expect(result.sameAs).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.telephone).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// generateWebSite
// ---------------------------------------------------------------------------
describe('generateWebSite', () => {
  it('returns WebSite schema with name and url', () => {
    const config = createBaseConfig();
    const result = generateWebSite(config);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('WebSite');
    expect(result.name).toBe('Example Site');
    expect(result.url).toBe('https://example.com');
  });

  it('includes SearchAction when searchUrl provided', () => {
    const config = createBaseConfig();
    const result = generateWebSite(config, 'https://example.com/search?q={search_term_string}');

    expect(result.potentialAction).toBeDefined();
    const action = result.potentialAction as any;
    expect(action['@type']).toBe('SearchAction');
    expect(action.target['@type']).toBe('EntryPoint');
    expect(action.target.urlTemplate).toBe('https://example.com/search?q={search_term_string}');
    expect(action['query-input']).toBe('required name=search_term_string');
  });

  it('omits potentialAction when no searchUrl', () => {
    const config = createBaseConfig();
    const result = generateWebSite(config);
    expect(result.potentialAction).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// generateHowTo
// ---------------------------------------------------------------------------
describe('generateHowTo', () => {
  it('returns HowTo with name and numbered steps', () => {
    const result = generateHowTo({
      name: 'How to Deploy a Site',
      steps: [
        { name: 'Install dependencies', text: 'Run npm install' },
        { name: 'Build the project', text: 'Run npm run build' },
        { name: 'Deploy', text: 'Run npm run deploy' },
      ],
    });

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('HowTo');
    expect(result.name).toBe('How to Deploy a Site');

    const steps = result.step as any[];
    expect(steps).toHaveLength(3);
    expect(steps[0]['@type']).toBe('HowToStep');
    expect(steps[0].position).toBe(1);
    expect(steps[0].name).toBe('Install dependencies');
    expect(steps[0].text).toBe('Run npm install');
    expect(steps[1].position).toBe(2);
    expect(steps[2].position).toBe(3);
  });

  it('includes description, totalTime, estimatedCost when provided', () => {
    const result = generateHowTo({
      name: 'How to Bake Bread',
      description: 'A simple bread recipe',
      totalTime: 'PT3H',
      estimatedCost: { currency: 'USD', value: '5' },
      steps: [
        { name: 'Mix ingredients', text: 'Combine flour, water, yeast' },
      ],
    });

    expect(result.description).toBe('A simple bread recipe');
    expect(result.totalTime).toBe('PT3H');
    expect(result.estimatedCost).toEqual({
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '5',
    });
  });

  it('includes image on steps when provided', () => {
    const result = generateHowTo({
      name: 'Guide',
      steps: [
        { name: 'Step 1', text: 'Do this', image: 'https://example.com/step1.jpg' },
      ],
    });

    const steps = result.step as any[];
    expect(steps[0].image).toBe('https://example.com/step1.jpg');
  });

  it('omits optional fields when not provided', () => {
    const result = generateHowTo({
      name: 'Simple Guide',
      steps: [{ name: 'Step', text: 'Do it' }],
    });

    expect(result.description).toBeUndefined();
    expect(result.totalTime).toBeUndefined();
    expect(result.estimatedCost).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// generateEvent
// ---------------------------------------------------------------------------
describe('generateEvent', () => {
  it('returns Event with name and startDate', () => {
    const config = createBaseConfig();
    const result = generateEvent(config, {
      name: 'Tech Conference 2026',
      startDate: '2026-06-15',
    });

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Event');
    expect(result.name).toBe('Tech Conference 2026');
    expect(result.startDate).toBe('2026-06-15');
  });

  it('includes organizer from config', () => {
    const config = createBaseConfig();
    const result = generateEvent(config, {
      name: 'Event',
      startDate: '2026-01-01',
    });

    const organizer = result.organizer as any;
    expect(organizer['@type']).toBe('Organization');
    expect(organizer.name).toBe('Example Site');
    expect(organizer.url).toBe('https://example.com');
  });

  it('includes location, performer, offers when provided', () => {
    const config = createBaseConfig();
    const result = generateEvent(config, {
      name: 'Music Festival',
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      description: 'Annual music festival',
      image: 'https://example.com/festival.jpg',
      location: { name: 'Central Park', address: '5th Ave, New York' },
      performer: 'The Band',
      offers: [
        { price: '50', currency: 'USD', url: 'https://tickets.com', availability: 'InStock' },
      ],
    });

    expect(result.endDate).toBe('2026-07-03');
    expect(result.description).toBe('Annual music festival');
    expect(result.image).toBe('https://example.com/festival.jpg');

    const location = result.location as any;
    expect(location['@type']).toBe('Place');
    expect(location.name).toBe('Central Park');
    expect(location.address).toBe('5th Ave, New York');

    const performer = result.performer as any;
    expect(performer['@type']).toBe('Person');
    expect(performer.name).toBe('The Band');

    const offers = result.offers as any[];
    expect(offers).toHaveLength(1);
    expect(offers[0]['@type']).toBe('Offer');
    expect(offers[0].price).toBe('50');
    expect(offers[0].priceCurrency).toBe('USD');
    expect(offers[0].url).toBe('https://tickets.com');
    expect(offers[0].availability).toBe('https://schema.org/InStock');
  });

  it('omits optional fields when not provided', () => {
    const config = createBaseConfig();
    const result = generateEvent(config, {
      name: 'Simple Event',
      startDate: '2026-01-01',
    });

    expect(result.endDate).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.image).toBeUndefined();
    expect(result.location).toBeUndefined();
    expect(result.performer).toBeUndefined();
    expect(result.offers).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// generateFAQPage
// ---------------------------------------------------------------------------
describe('generateFAQPage', () => {
  it('returns FAQPage with Question/Answer entities', () => {
    const result = generateFAQPage({
      questions: [
        { question: 'What is this?', answer: 'This is a test.' },
      ],
    });

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('FAQPage');

    const entities = result.mainEntity as any[];
    expect(entities).toHaveLength(1);
    expect(entities[0]['@type']).toBe('Question');
    expect(entities[0].name).toBe('What is this?');
    expect(entities[0].acceptedAnswer['@type']).toBe('Answer');
    expect(entities[0].acceptedAnswer.text).toBe('This is a test.');
  });

  it('handles multiple questions', () => {
    const result = generateFAQPage({
      questions: [
        { question: 'Q1?', answer: 'A1' },
        { question: 'Q2?', answer: 'A2' },
        { question: 'Q3?', answer: 'A3' },
      ],
    });

    const entities = result.mainEntity as any[];
    expect(entities).toHaveLength(3);
    expect(entities[0].name).toBe('Q1?');
    expect(entities[1].name).toBe('Q2?');
    expect(entities[2].name).toBe('Q3?');
  });
});

// ---------------------------------------------------------------------------
// generateLocalBusiness
// ---------------------------------------------------------------------------
describe('generateLocalBusiness', () => {
  it('returns LocalBusiness with defaults from config', () => {
    const config = createBaseConfig();
    const result = generateLocalBusiness(config);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('LocalBusiness');
    expect(result.name).toBe('Example Site');
    expect(result.url).toBe('https://example.com');
  });

  it('includes address, geo, telephone when provided', () => {
    const config = createBaseConfig();
    const result = generateLocalBusiness(config, {
      address: {
        streetAddress: '123 Main St',
        addressLocality: 'Springfield',
        addressRegion: 'IL',
        postalCode: '62701',
        addressCountry: 'US',
      },
      geo: { latitude: 39.7817, longitude: -89.6501 },
      telephone: '+1-555-0123',
    });

    const address = result.address as any;
    expect(address['@type']).toBe('PostalAddress');
    expect(address.streetAddress).toBe('123 Main St');
    expect(address.addressLocality).toBe('Springfield');
    expect(address.addressRegion).toBe('IL');
    expect(address.postalCode).toBe('62701');
    expect(address.addressCountry).toBe('US');

    const geo = result.geo as any;
    expect(geo['@type']).toBe('GeoCoordinates');
    expect(geo.latitude).toBe(39.7817);
    expect(geo.longitude).toBe(-89.6501);

    expect(result.telephone).toBe('+1-555-0123');
  });

  it('uses custom type and name when provided', () => {
    const config = createBaseConfig();
    const result = generateLocalBusiness(config, {
      type: 'Restaurant',
      name: 'Joe\'s Diner',
    });

    expect(result['@type']).toBe('Restaurant');
    expect(result.name).toBe('Joe\'s Diner');
  });

  it('falls back to org telephone from config when not in data', () => {
    const config = createFullConfig();
    const result = generateLocalBusiness(config);

    expect(result.telephone).toBe('+1-555-0100');
  });

  it('includes openingHours, priceRange, image when provided', () => {
    const config = createBaseConfig();
    const result = generateLocalBusiness(config, {
      openingHours: ['Mo-Fr 09:00-17:00'],
      priceRange: '$$',
      image: 'https://example.com/shop.jpg',
    });

    expect(result.openingHours).toEqual(['Mo-Fr 09:00-17:00']);
    expect(result.priceRange).toBe('$$');
    expect(result.image).toBe('https://example.com/shop.jpg');
  });
});

// ---------------------------------------------------------------------------
// generateVideoObject
// ---------------------------------------------------------------------------
describe('generateVideoObject', () => {
  it('returns VideoObject with required fields', () => {
    const result = generateVideoObject({
      name: 'Tutorial Video',
      description: 'Learn how to use the tool',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      uploadDate: '2026-01-15',
    });

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('VideoObject');
    expect(result.name).toBe('Tutorial Video');
    expect(result.description).toBe('Learn how to use the tool');
    expect(result.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    expect(result.uploadDate).toBe('2026-01-15');
  });

  it('includes optional contentUrl, embedUrl, duration', () => {
    const result = generateVideoObject({
      name: 'Demo',
      description: 'Product demo',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      uploadDate: '2026-01-15',
      contentUrl: 'https://example.com/video.mp4',
      embedUrl: 'https://youtube.com/embed/abc123',
      duration: 'PT5M30S',
    });

    expect(result.contentUrl).toBe('https://example.com/video.mp4');
    expect(result.embedUrl).toBe('https://youtube.com/embed/abc123');
    expect(result.duration).toBe('PT5M30S');
  });

  it('omits optional fields when not provided', () => {
    const result = generateVideoObject({
      name: 'Video',
      description: 'Desc',
      thumbnailUrl: 'https://example.com/t.jpg',
      uploadDate: '2026-01-01',
    });

    expect(result.contentUrl).toBeUndefined();
    expect(result.embedUrl).toBeUndefined();
    expect(result.duration).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// generateMetaTags
// ---------------------------------------------------------------------------
describe('generateMetaTags', () => {
  it('returns title in result', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, { title: 'My Page Title' });
    expect(result.title).toBe('My Page Title');
  });

  it('includes description and keywords when provided', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, {
      title: 'Test',
      description: 'A test page',
      keywords: 'test, vitest, seo',
    });

    expect(result.description).toBe('A test page');
    expect(result.keywords).toBe('test, vitest, seo');
  });

  it('sets robots to noindex when noIndex is true', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, {
      title: 'Hidden Page',
      noIndex: true,
    });

    expect(result.robots).toBe('noindex, nofollow');
  });

  it('does not set robots when noIndex is false or absent', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, { title: 'Public' });
    expect(result.robots).toBeUndefined();
  });

  it('generates canonical URL from canonicalPath', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, {
      title: 'Blog Post',
      canonicalPath: '/blog/my-post',
    });

    expect(result.alternates?.canonical).toBe('https://example.com/blog/my-post');
  });

  it('generates OpenGraph tags with siteName', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, {
      title: 'OG Test',
      description: 'Testing OG',
      canonicalPath: '/test',
    });

    expect(result.openGraph).toBeDefined();
    expect(result.openGraph!.title).toBe('OG Test');
    expect(result.openGraph!.siteName).toBe('Example Site');
    expect(result.openGraph!.description).toBe('Testing OG');
    expect(result.openGraph!.url).toBe('https://example.com/test');
    expect(result.openGraph!.type).toBe('website');
  });

  it('includes OG images from ogImage or defaultOgImage', () => {
    const configWithDefault = createFullConfig();
    const result1 = generateMetaTags(configWithDefault, { title: 'Test' });
    expect(result1.openGraph!.images![0].url).toBe('https://example.com/og.jpg');

    const result2 = generateMetaTags(configWithDefault, {
      title: 'Test',
      ogImage: 'https://example.com/custom.jpg',
    });
    expect(result2.openGraph!.images![0].url).toBe('https://example.com/custom.jpg');
  });

  it('uses custom ogType when provided', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, {
      title: 'Article',
      ogType: 'article',
    });

    expect(result.openGraph!.type).toBe('article');
  });

  it('generates Twitter card with creator handle', () => {
    const config = createFullConfig();
    const result = generateMetaTags(config, {
      title: 'Twitter Test',
      description: 'Testing Twitter card',
    });

    expect(result.twitter).toBeDefined();
    expect(result.twitter!.card).toBe('summary_large_image');
    expect(result.twitter!.title).toBe('Twitter Test');
    expect(result.twitter!.description).toBe('Testing Twitter card');
    expect(result.twitter!.creator).toBe('@examplesite');
  });

  it('strips leading @ from twitterHandle to avoid double @', () => {
    const config: SeoConfig = {
      ...createBaseConfig(),
      twitterHandle: '@already_prefixed',
    };
    const result = generateMetaTags(config, { title: 'Test' });
    expect(result.twitter!.creator).toBe('@already_prefixed');
  });

  it('handles alternateLanguages', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, {
      title: 'Multi-lang',
      alternateLanguages: [
        { locale: 'es', url: 'https://example.com/es/page' },
        { locale: 'fr', url: 'https://example.com/fr/page' },
      ],
    });

    expect(result.alternates).toBeDefined();
    expect(result.alternates!.languages).toBeDefined();
    expect(result.alternates!.languages!['es']).toBe('https://example.com/es/page');
    expect(result.alternates!.languages!['fr']).toBe('https://example.com/fr/page');
  });

  it('includes Twitter images from ogImage or defaultOgImage', () => {
    const config = createFullConfig();
    const result = generateMetaTags(config, { title: 'Test' });
    expect(result.twitter!.images![0]).toBe('https://example.com/og.jpg');
  });

  it('omits Twitter creator when twitterHandle not in config', () => {
    const config = createBaseConfig();
    const result = generateMetaTags(config, { title: 'Test' });
    expect(result.twitter!.creator).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// generateCanonicalUrl
// ---------------------------------------------------------------------------
describe('generateCanonicalUrl', () => {
  it('constructs URL from baseUrl + path', () => {
    const config = createBaseConfig();
    const result = generateCanonicalUrl(config, '/blog/my-post');
    expect(result).toBe('https://example.com/blog/my-post');
  });

  it('prepends slash when path does not start with one', () => {
    const config = createBaseConfig();
    const result = generateCanonicalUrl(config, 'blog/my-post');
    expect(result).toBe('https://example.com/blog/my-post');
  });

  it('adds trailing slash when config.trailingSlash is true', () => {
    const config: SeoConfig = { ...createBaseConfig(), trailingSlash: true };
    const result = generateCanonicalUrl(config, '/blog/my-post');
    expect(result).toBe('https://example.com/blog/my-post/');
  });

  it('removes trailing slash when config.trailingSlash is false', () => {
    const config: SeoConfig = { ...createBaseConfig(), trailingSlash: false };
    const result = generateCanonicalUrl(config, '/blog/my-post/');
    expect(result).toBe('https://example.com/blog/my-post');
  });

  it('does not remove trailing slash from root path', () => {
    const config: SeoConfig = { ...createBaseConfig(), trailingSlash: false };
    const result = generateCanonicalUrl(config, '/');
    expect(result).toBe('https://example.com/');
  });

  it('appends query params when provided', () => {
    const config = createBaseConfig();
    const result = generateCanonicalUrl(config, '/search', { q: 'hello', page: '2' });
    expect(result).toContain('https://example.com/search?');
    expect(result).toContain('q=hello');
    expect(result).toContain('page=2');
  });

  it('does not add ? when params is empty object', () => {
    const config = createBaseConfig();
    const result = generateCanonicalUrl(config, '/blog');
    expect(result).toBe('https://example.com/blog');
  });

  it('trailing slash + query params work together', () => {
    const config: SeoConfig = { ...createBaseConfig(), trailingSlash: true };
    const result = generateCanonicalUrl(config, '/search', { q: 'test' });
    expect(result).toBe('https://example.com/search/?q=test');
  });
});

// ---------------------------------------------------------------------------
// buildBreadcrumbs
// ---------------------------------------------------------------------------
describe('buildBreadcrumbs', () => {
  it('includes Home as first item by default', () => {
    const result = buildBreadcrumbs('https://example.com', [
      { label: 'Blog', path: '/blog' },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Home');
    expect(result[0].url).toBe('https://example.com');
  });

  it('builds cumulative paths from segments', () => {
    const result = buildBreadcrumbs('https://example.com', [
      { label: 'Blog', path: '/blog' },
      { label: 'Category', path: '/tech' },
      { label: 'Post', path: '/my-post' },
    ]);

    expect(result).toHaveLength(4); // Home + 3 segments
    expect(result[1].name).toBe('Blog');
    expect(result[1].url).toBe('https://example.com/blog');
    expect(result[2].name).toBe('Category');
    expect(result[2].url).toBe('https://example.com/blog/tech');
    expect(result[3].name).toBe('Post');
    expect(result[3].url).toBe('https://example.com/blog/tech/my-post');
  });

  it('omits Home when includeHome is false', () => {
    const result = buildBreadcrumbs(
      'https://example.com',
      [{ label: 'Blog', path: '/blog' }],
      false,
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Blog');
    expect(result[0].url).toBe('https://example.com/blog');
  });

  it('handles segments without leading slash', () => {
    const result = buildBreadcrumbs('https://example.com', [
      { label: 'Blog', path: 'blog' },
      { label: 'Post', path: 'my-post' },
    ]);

    expect(result[1].url).toBe('https://example.com/blog');
    expect(result[2].url).toBe('https://example.com/blog/my-post');
  });

  it('returns only Home for empty segments', () => {
    const result = buildBreadcrumbs('https://example.com', []);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Home');
    expect(result[0].url).toBe('https://example.com');
  });

  it('returns empty array when no segments and includeHome is false', () => {
    const result = buildBreadcrumbs('https://example.com', [], false);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// generateArticle
// ---------------------------------------------------------------------------
describe('generateArticle', () => {
  it('generates BlogPosting schema with required fields', () => {
    const config = createFullConfig();
    const result = generateArticle(config, {
      headline: 'Test Article',
      url: '/blog/test',
      datePublished: '2024-01-15',
      authorName: 'Jane Doe',
    });

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('BlogPosting');
    expect(result.headline).toBe('Test Article');
    expect(result.url).toBe('https://example.com/blog/test');
    expect(result.datePublished).toBe('2024-01-15');
    expect(result.author).toEqual({ '@type': 'Person', name: 'Jane Doe' });
    expect((result.publisher as any).name).toBe('Example Inc.');
    expect((result.publisher as any).logo.url).toBe('https://example.com/logo.png');
  });

  it('includes optional fields when provided', () => {
    const config = createBaseConfig();
    const result = generateArticle(config, {
      headline: 'Full Article',
      url: 'https://example.com/blog/full',
      datePublished: '2024-01-15',
      dateModified: '2024-02-01',
      authorName: 'Corp Author',
      authorType: 'Organization',
      image: 'https://example.com/img.jpg',
      section: 'Technology',
      wordCount: 1500,
    });

    expect(result.dateModified).toBe('2024-02-01');
    expect(result.author).toEqual({ '@type': 'Organization', name: 'Corp Author' });
    expect(result.image).toBe('https://example.com/img.jpg');
    expect(result.articleSection).toBe('Technology');
    expect(result.wordCount).toBe(1500);
  });

  it('uses siteName as fallback publisher', () => {
    const config = createBaseConfig();
    const result = generateArticle(config, {
      headline: 'Test',
      url: '/test',
      datePublished: '2024-01-01',
      authorName: 'Author',
    });

    expect((result.publisher as any).name).toBe('Example Site');
  });
});

// ---------------------------------------------------------------------------
// buildSchemaGraph
// ---------------------------------------------------------------------------
describe('buildSchemaGraph', () => {
  it('wraps schemas in @graph with single @context', () => {
    const breadcrumbs = generateBreadcrumbList(createBaseConfig(), [
      { name: 'Home', url: '/' },
    ]);
    const article = generateArticle(createBaseConfig(), {
      headline: 'Test',
      url: '/test',
      datePublished: '2024-01-01',
      authorName: 'Author',
    });

    const graph = buildSchemaGraph(breadcrumbs, article);

    expect(graph['@context']).toBe('https://schema.org');
    expect(Array.isArray(graph['@graph'])).toBe(true);

    const items = graph['@graph'] as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    // No nested @context
    items.forEach((item) => {
      expect(item).not.toHaveProperty('@context');
    });
    expect(items[0]['@type']).toBe('BreadcrumbList');
    expect(items[1]['@type']).toBe('BlogPosting');
  });

  it('handles single schema', () => {
    const org = generateOrganization(createBaseConfig());
    const graph = buildSchemaGraph(org);

    expect((graph['@graph'] as any[]).length).toBe(1);
    expect((graph['@graph'] as any[])[0]['@type']).toBe('Organization');
  });
});

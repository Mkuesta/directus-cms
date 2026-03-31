import type { SeoConfig, SeoClient } from './types.js';
import * as schemas from './schemas.js';
import { generateMetaTags, generateCanonicalUrl } from './meta-tags.js';

export function createSeoClient(config: SeoConfig): SeoClient {
  return {
    config,
    generateBreadcrumbList: (items) => schemas.generateBreadcrumbList(config, items),
    generateOrganization: () => schemas.generateOrganization(config),
    generateWebSite: (searchUrl) => schemas.generateWebSite(config, searchUrl),
    generateHowTo: (data) => schemas.generateHowTo(data),
    generateEvent: (data) => schemas.generateEvent(config, data),
    generateFAQPage: (data) => schemas.generateFAQPage(data),
    generateLocalBusiness: (data) => schemas.generateLocalBusiness(config, data),
    generateVideoObject: (data) => schemas.generateVideoObject(data),
    generateArticle: (data) => schemas.generateArticle(config, data),
    generateProduct: (data) => schemas.generateProduct(config, data),
    buildSchemaGraph: (...s) => schemas.buildSchemaGraph(...s),
    generateMetaTags: (input) => generateMetaTags(config, input),
    generateCanonicalUrl: (path, params) => generateCanonicalUrl(config, path, params),
  };
}

// Re-export types
export type {
  SeoConfig,
  SeoClient,
  OrganizationData,
  BreadcrumbItem,
  HowToData,
  EventData,
  FAQData,
  LocalBusinessData,
  VideoData,
  ArticleData,
  ProductData,
  MetaTagInput,
  MetaTagResult,
} from './types.js';

// Re-export standalone functions
export {
  generateBreadcrumbList,
  generateOrganization,
  generateWebSite,
  generateHowTo,
  generateEvent,
  generateFAQPage,
  generateLocalBusiness,
  generateVideoObject,
  generateArticle,
  generateProduct,
  buildSchemaGraph,
} from './schemas.js';
export { generateMetaTags, generateCanonicalUrl } from './meta-tags.js';
export { buildBreadcrumbs } from './breadcrumbs.js';

// Re-export components
export { JsonLd } from './components/JsonLd.js';
export { MetaTags } from './components/MetaTags.js';

export interface SeoConfig {
  /** Site's canonical base URL used for building absolute URLs (e.g. "https://example.com") */
  baseUrl: string;
  /** Display name of the site, used in OpenGraph and structured data */
  siteName: string;
  /** Default OpenGraph image URL used when no page-specific image is provided */
  defaultOgImage?: string;
  /** Organization data for Schema.org Organization structured data */
  organization?: OrganizationData;
  /** Twitter/X handle for twitter:creator meta tag (e.g. "@mysite") */
  twitterHandle?: string;
  /** Whether generated URLs should include a trailing slash */
  trailingSlash?: boolean;
}

export interface SeoClient {
  /** The bound SEO configuration */
  config: SeoConfig;
  /** Generate a Schema.org BreadcrumbList JSON-LD object from navigation items */
  generateBreadcrumbList: (items: BreadcrumbItem[]) => Record<string, unknown>;
  /** Generate a Schema.org Organization JSON-LD object from the config's organization data */
  generateOrganization: () => Record<string, unknown>;
  /** Generate a Schema.org WebSite JSON-LD object, optionally with a SearchAction URL */
  generateWebSite: (searchUrl?: string) => Record<string, unknown>;
  /** Generate a Schema.org HowTo JSON-LD object from step-by-step instructions */
  generateHowTo: (data: HowToData) => Record<string, unknown>;
  /** Generate a Schema.org Event JSON-LD object with location, performer, and offer details */
  generateEvent: (data: EventData) => Record<string, unknown>;
  /** Generate a Schema.org FAQPage JSON-LD object from question/answer pairs */
  generateFAQPage: (data: FAQData) => Record<string, unknown>;
  /** Generate a Schema.org LocalBusiness JSON-LD object, using organization fallbacks when data is omitted */
  generateLocalBusiness: (data?: LocalBusinessData) => Record<string, unknown>;
  /** Generate a Schema.org VideoObject JSON-LD object with embed/content URLs and duration */
  generateVideoObject: (data: VideoData) => Record<string, unknown>;
  /** Generate a Schema.org BlogPosting/Article JSON-LD object */
  generateArticle: (data: ArticleData) => Record<string, unknown>;
  /** Generate a Schema.org Product JSON-LD object with Offer, Brand, and optional AggregateRating */
  generateProduct: (data: ProductData) => Record<string, unknown>;
  /** Combine multiple Schema.org objects into a single @graph envelope */
  buildSchemaGraph: (...schemas: Record<string, unknown>[]) => Record<string, unknown>;
  /** Generate a complete set of meta tags including OpenGraph, Twitter Card, and canonical URL */
  generateMetaTags: (input: MetaTagInput) => MetaTagResult;
  /** Build an absolute canonical URL from a path and optional query parameters */
  generateCanonicalUrl: (path: string, params?: Record<string, string>) => string;
}

export interface OrganizationData {
  /** Organization name as displayed in structured data */
  name: string;
  /** Organization's website URL (defaults to baseUrl if omitted) */
  url?: string;
  /** URL to the organization's logo image */
  logo?: string;
  /** Social profile URLs for Schema.org sameAs property (e.g. LinkedIn, Facebook) */
  sameAs?: string[];
  /** Organization contact email address */
  email?: string;
  /** Organization contact phone number */
  telephone?: string;
  /** Registered legal name of the organization */
  legalName?: string;
  /** Short description of the organization for structured data */
  description?: string;
}

export interface BreadcrumbItem {
  /** Display label for this breadcrumb step */
  name: string;
  /** Absolute or relative URL for this breadcrumb step */
  url: string;
}

export interface HowToData {
  /** Title of the how-to guide */
  name: string;
  /** Brief description of what this guide teaches */
  description?: string;
  /** Total time to complete in ISO 8601 duration format (e.g. "PT30M") */
  totalTime?: string;
  /** Estimated cost to complete the guide */
  estimatedCost?: { currency: string; value: string };
  /** Ordered list of steps, each with a name, instruction text, and optional image URL */
  steps: Array<{ name: string; text: string; image?: string }>;
}

export interface EventData {
  /** Name of the event */
  name: string;
  /** Event start date/time in ISO 8601 format */
  startDate: string;
  /** Event end date/time in ISO 8601 format */
  endDate?: string;
  /** Venue or location where the event takes place */
  location?: { name: string; address?: string };
  /** Description of the event for structured data */
  description?: string;
  /** URL to an image representing the event */
  image?: string;
  /** Name of the performer or speaker */
  performer?: string;
  /** Ticket or registration offers with pricing and availability */
  offers?: Array<{ price: string; currency: string; url?: string; availability?: string }>;
}

export interface FAQData {
  /** List of question/answer pairs to render as a Schema.org FAQPage */
  questions: Array<{ question: string; answer: string }>;
}

export interface LocalBusinessData {
  /** Schema.org business subtype (e.g. 'Restaurant', 'Store'); defaults to 'LocalBusiness' */
  type?: string;
  /** Business name; falls back to organization name from SeoConfig if omitted */
  name?: string;
  /** Physical address of the business as a PostalAddress */
  address?: { streetAddress?: string; addressLocality?: string; addressRegion?: string; postalCode?: string; addressCountry?: string };
  /** Geographic coordinates for the business location */
  geo?: { latitude: number; longitude: number };
  /** Business phone number */
  telephone?: string;
  /** Opening hours in Schema.org format (e.g. ["Mo-Fr 09:00-17:00"]) */
  openingHours?: string[];
  /** Price range indicator (e.g. "$$", "$10-$50") */
  priceRange?: string;
  /** URL to an image of the business */
  image?: string;
}

export interface VideoData {
  /** Title of the video */
  name: string;
  /** Description of the video content */
  description: string;
  /** URL to the video thumbnail image */
  thumbnailUrl: string;
  /** ISO 8601 date when the video was uploaded */
  uploadDate: string;
  /** Direct URL to the video file (e.g. MP4 URL) */
  contentUrl?: string;
  /** Embeddable player URL (e.g. YouTube embed URL) */
  embedUrl?: string;
  /** Video duration in ISO 8601 format (e.g. "PT5M30S") */
  duration?: string;
}

export interface ArticleData {
  /** Headline / title of the article */
  headline: string;
  /** Short description or excerpt */
  description?: string;
  /** Canonical URL of the article */
  url: string;
  /** ISO 8601 publish date */
  datePublished: string;
  /** ISO 8601 last-modified date */
  dateModified?: string;
  /** Author name */
  authorName: string;
  /** Author type — defaults to 'Person' */
  authorType?: 'Person' | 'Organization';
  /** Primary image URL */
  image?: string;
  /** Article section / category (e.g. "Technology") */
  section?: string;
  /** Word count of the article body */
  wordCount?: number;
  /** Publisher organization name (falls back to SeoConfig.siteName) */
  publisherName?: string;
  /** Publisher logo URL (falls back to SeoConfig.organization.logo) */
  publisherLogo?: string;
}

export interface ProductData {
  /** Product name / title */
  name: string;
  /** Product description for structured data */
  description: string;
  /** Canonical URL of the product page */
  url: string;
  /** Product image URL(s) */
  image?: string | string[];
  /** Stock-keeping unit identifier */
  sku?: string;
  /** Product category name */
  category?: string;
  /** Price amount (numeric) */
  price: number;
  /** ISO 4217 currency code (e.g. 'USD', 'EUR') */
  currency: string;
  /** Schema.org availability URL (defaults to InStock) */
  availability?: string;
  /** Brand name */
  brand?: string;
  /** Seller organization name */
  seller?: string;
  /** Schema.org item condition URL (defaults to NewCondition) */
  condition?: string;
  /** Aggregate rating value (1-5) */
  rating?: number;
  /** Total number of reviews */
  reviewCount?: number;
}

export interface MetaTagInput {
  /** Page title used for <title> and og:title */
  title: string;
  /** Meta description for search engine snippets and og:description */
  description?: string;
  /** Comma-separated keywords for the keywords meta tag */
  keywords?: string;
  /** Path portion of the canonical URL (combined with baseUrl to form the full canonical) */
  canonicalPath?: string;
  /** OpenGraph image URL; falls back to defaultOgImage from SeoConfig */
  ogImage?: string;
  /** OpenGraph type (e.g. 'article', 'website'); defaults to 'website' */
  ogType?: string;
  /** When true, sets robots meta to 'noindex, nofollow' */
  noIndex?: boolean;
  /** Alternate language versions for hreflang link tags */
  alternateLanguages?: Array<{ locale: string; url: string }>;
}

export interface MetaTagResult {
  /** Resolved page title for the <title> tag */
  title: string;
  /** Meta description content */
  description?: string;
  /** Keywords meta tag content */
  keywords?: string;
  /** Robots directive string (e.g. 'noindex, nofollow') */
  robots?: string;
  /** Canonical and alternate language link metadata */
  alternates?: {
    /** Absolute canonical URL for this page */
    canonical?: string;
    /** Map of locale codes to their alternate URLs for hreflang tags */
    languages?: Record<string, string>;
  };
  /** OpenGraph metadata for social sharing previews */
  openGraph?: {
    /** OpenGraph title */
    title: string;
    /** OpenGraph description */
    description?: string;
    /** Absolute URL of the page */
    url?: string;
    /** Site name for og:site_name */
    siteName: string;
    /** OpenGraph images with URL and optional alt text */
    images?: Array<{ url: string; alt?: string }>;
    /** OpenGraph content type (e.g. 'article', 'website') */
    type?: string;
  };
  /** Twitter Card metadata for tweet previews */
  twitter?: {
    /** Twitter Card type (e.g. 'summary_large_image') */
    card: string;
    /** Title displayed in the Twitter Card */
    title: string;
    /** Description displayed in the Twitter Card */
    description?: string;
    /** Image URLs for the Twitter Card */
    images?: string[];
    /** Twitter handle of the content creator */
    creator?: string;
  };
}

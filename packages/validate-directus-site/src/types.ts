export interface ValidateConfig {
  /** Directus instance URL to validate against (e.g. "https://cms.example.com") */
  url: string;
  /** Directus API token with read access to collections and schema */
  token: string;
  /** Collection name prefix used by this site (e.g. "mysite") */
  prefix: string;
  /** Feature flags controlling which package collections to validate */
  features: FeatureFlags;
  /** When true, attempt to auto-fix issues (e.g. create missing collections/fields) */
  fix: boolean;
  /** Working directory for file-based checks; defaults to cwd */
  dir?: string;
  /** When true, also validate that collections contain expected seed data */
  checkData?: boolean;
}

export interface FeatureFlags {
  /** Validate product catalog collections and fields */
  includeProducts: boolean;
  /** Validate navigation menu collections and fields */
  includeNavigation: boolean;
  /** Validate dynamic pages collections and fields */
  includePages: boolean;
  /** Validate form submission collections and fields */
  includeForms: boolean;
  /** Validate analytics/tracking settings collections */
  includeAnalytics: boolean;
  /** Validate URL redirect collections and fields */
  includeRedirects: boolean;
  /** Validate media/gallery collections and fields */
  includeMedia: boolean;
  /** Validate announcement banner collections and fields */
  includeBanners: boolean;
  /** Validate internationalization/translation collections and fields */
  includeI18n: boolean;
  /** Validate tag collections and fields (optional, newer feature) */
  includeTags?: boolean;
  /** Validate Stripe order collections and fields */
  includeStripe?: boolean;
  /** Validate user authentication/profile collections and fields */
  includeAuth?: boolean;
  /** Validate email template and log collections and fields */
  includeEmail?: boolean;
  /** Validate newsletter subscriber collections and fields */
  includeNewsletter?: boolean;
  /** Validate notification template collections and fields */
  includeNotifications?: boolean;
}

export interface CheckDetail {
  /** Directus field name that was checked (if applicable) */
  field?: string;
  /** Expected value or state for this field */
  expected?: string;
  /** Actual value or state found during validation */
  actual?: string;
  /** Human-readable description of the detail or issue */
  message: string;
}

export interface CheckResult {
  /** Identifier for this check (e.g. 'posts_collection', 'navigation_fields') */
  name: string;
  /** Outcome of the check: pass, warn (non-blocking), or fail (blocking) */
  status: 'pass' | 'warn' | 'fail';
  /** Summary description of the check result */
  message: string;
  /** Granular details about individual field or schema checks */
  details: CheckDetail[];
  /** Whether this issue can be auto-fixed when the fix flag is enabled */
  fixable: boolean;
}

export interface ValidationResult {
  /** All check results from the validation run */
  checks: CheckResult[];
  /** Number of checks that passed */
  passed: number;
  /** Number of checks that produced warnings */
  warned: number;
  /** Number of checks that failed */
  failed: number;
  /** Number of issues that were auto-fixed (when fix mode is enabled) */
  fixed: number;
}

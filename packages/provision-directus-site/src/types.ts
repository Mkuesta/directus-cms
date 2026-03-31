export interface ProvisionConfig {
  url: string;
  token: string;
  prefix: string;
  seed: boolean;
  dryRun: boolean;
  features: FeatureFlags;
}

export interface FeatureFlags {
  includeProducts: boolean;
  includeNavigation: boolean;
  includePages: boolean;
  includeForms: boolean;
  includeAnalytics: boolean;
  includeRedirects: boolean;
  includeMedia: boolean;
  includeBanners: boolean;
  includeI18n: boolean;
  includeTags?: boolean;
  includeStripe?: boolean;
  includeAuth?: boolean;
  includeEmail?: boolean;
  includeNewsletter?: boolean;
  includeNotifications?: boolean;
}

export interface FieldDef {
  field: string;
  type: string;
  meta?: Record<string, any>;
  schema?: Record<string, any> | null;
}

export interface RelationDef {
  collection: string;
  field: string;
  related_collection: string | null;
  meta?: Record<string, any> | null;
  schema?: Record<string, any> | null;
}

export type CollectionGroup = 'content' | 'config' | 'data';

export interface CollectionSchema {
  collection: string;
  singleton?: boolean;
  group?: CollectionGroup;
  fields: FieldDef[];
  relations?: RelationDef[];
}

export interface ProvisionResult {
  collectionsCreated: string[];
  collectionsSkipped: string[];
  fieldsCreated: number;
  fieldsSkipped: number;
  relationsCreated: number;
  relationsSkipped: number;
  permissionsCreated: number;
  itemsSeeded: number;
  errors: string[];
}

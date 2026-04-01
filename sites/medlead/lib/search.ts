import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createSearchClient } from '@mkuesta/search';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const search = createSearchClient({
  directus,
  directusUrl: DIRECTUS_URL,
  siteId: CURRENT_SITE_ID,
  collections: [
    {
      collection: COLLECTIONS.posts,
      type: 'post',
      searchFields: ['title', 'content', 'excerpt'],
      resultFields: ['id', 'title', 'slug', 'excerpt', 'featured_image', 'date_published', 'status'],
      titleField: 'title',
      slugField: 'slug',
      excerptField: 'excerpt',
      imageField: 'featured_image',
      baseFilter: { status: { _eq: 'published' } },
      urlPrefix: '/blog',
    },
  ],
  defaultLimit: 25,
});

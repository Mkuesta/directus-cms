import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createTagClient } from '@mkuesta/tags';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const tags = createTagClient({
  directus,
  directusUrl: DIRECTUS_URL,
  collections: {
    posts: COLLECTIONS.posts,
  },
});

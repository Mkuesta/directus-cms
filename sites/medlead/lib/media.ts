import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createMediaClient } from '@mkuesta/media';
import { DIRECTUS_URL, DIRECTUS_TOKEN } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const media = createMediaClient({
  directus,
  directusUrl: DIRECTUS_URL,
  collections: {},
});

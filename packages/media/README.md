# @directus-cms/media

Responsive image helpers and gallery management from Directus for Next.js sites. Wraps Directus image transform API with srcSet generation, blur placeholders, and gallery collections.

## Setup

```ts
// lib/media.ts
import { createMediaClient } from '@directus-cms/media';
import { directus, COLLECTION_PREFIX } from './cms';

export const media = createMediaClient({
  directus,
  collections: {
    galleries: `${COLLECTION_PREFIX}_galleries`,       // optional
    galleryItems: `${COLLECTION_PREFIX}_gallery_items`, // optional
  },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
```

## Usage

### Image URL with Transforms

```ts
const url = media.getImageUrl('file-id', { width: 800, format: 'webp', quality: 80 });
// → "https://cms.example.com/assets/file-id?width=800&format=webp&quality=80"
```

### Responsive srcSet

```ts
const srcSet = media.getSrcSet('file-id', [320, 640, 1024, 1920], { format: 'webp' });
// → [{ url: "...?width=320&format=webp", width: 320, descriptor: "320w" }, ...]
```

### Full Responsive Image Object

```ts
const img = media.getResponsiveImage('file-id', {
  widths: [320, 640, 1024, 1920],
  sizes: '(max-width: 768px) 100vw, 50vw',
  transform: { format: 'webp', quality: 80 },
});
// → { src, srcSet, sizes, blurDataUrl }

// Use with Next.js <img> or custom component:
<img src={img.src} srcSet={img.srcSet} sizes={img.sizes} />
```

### Blur Placeholder

```ts
const blur = media.getBlurDataUrl('file-id');
// → "https://cms.example.com/assets/file-id?width=20&quality=20&format=webp&fit=cover"
```

### Galleries

Requires `galleries` and `galleryItems` collections in Directus.

```ts
const gallery = await media.getGallery('team-photos');
// → { id, title, slug, description, images: [{ url, title, width, height, sort }] }

const all = await media.getGalleries();
```

#### Gallery Collections

**`{prefix}_galleries`**: `id`, `title`, `slug`, `description`, `status`, `site`

**`{prefix}_gallery_items`**: `id`, `gallery` (M2O), `image` (File), `title`, `description`, `sort`

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `getImageUrl(fileId, transform?)` | `string` | Directus asset URL with transforms |
| `getSrcSet(fileId, widths?, options?)` | `SrcSetEntry[]` | srcSet entries |
| `getResponsiveImage(fileId, options?)` | `ResponsiveImage` | Full responsive image data |
| `getBlurDataUrl(fileId)` | `string` | Tiny blur placeholder URL |
| `getGallery(slug)` | `Promise<Gallery \| null>` | Gallery with images |
| `getGalleries()` | `Promise<Gallery[]>` | All galleries |

Default widths: `[320, 640, 768, 1024, 1280, 1536, 1920]`

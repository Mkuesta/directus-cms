import type { PreviewConfig, PreviewClient } from './types.js';
import { getPreviewPost, getPreviewProduct, getPreviewPage, getScheduledContent, publishScheduledContent } from './preview.js';
import { generateToken, verifyToken } from './token.js';

export function createPreviewClient(config: PreviewConfig): PreviewClient {
  const tokenExpiry = (config.tokenExpiry ?? 3600) * 1000;

  return {
    config,
    getPreviewPost: (slug) => getPreviewPost(config, slug),
    getPreviewProduct: (slug) => getPreviewProduct(config, slug),
    getPreviewPage: (slug) => getPreviewPage(config, slug),
    generatePreviewUrl: async (path) => {
      const expiresAt = Date.now() + tokenExpiry;
      const token = await generateToken(config.previewSecret, path, expiresAt);
      return `/api/preview?path=${encodeURIComponent(path)}&token=${encodeURIComponent(token)}`;
    },
    verifyPreviewToken: (token) => verifyToken(config.previewSecret, '/', token),
    getScheduledContent: () => getScheduledContent(config),
    publishScheduledContent: () => publishScheduledContent(config),
  };
}

export type {
  PreviewConfig,
  PreviewClient,
  PreviewCollections,
  PreviewItem,
  ScheduledItem,
  PublishResult,
} from './types.js';

export { getPreviewPost, getPreviewProduct, getPreviewPage } from './preview.js';
export { createPreviewApiHandler, createExitPreviewHandler } from './api-handler.js';
export { getScheduledContent, publishScheduledContent } from './preview.js';
export { generateToken as generatePreviewToken, verifyToken as verifyPreviewToken } from './token.js';

export { PreviewBanner } from './components/PreviewBanner.js';

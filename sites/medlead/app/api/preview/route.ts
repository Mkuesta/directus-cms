import { createPreviewApiHandler } from '@mkuesta/preview';
import { preview } from '@/lib/preview';

const handler = createPreviewApiHandler(preview.config);

export async function GET(request: Request) {
  return handler(request);
}

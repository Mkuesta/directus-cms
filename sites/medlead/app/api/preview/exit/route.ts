import { createExitPreviewHandler } from '@mkuesta/preview';
import { preview } from '@/lib/preview';

const handler = createExitPreviewHandler(preview.config);

export async function GET(request: Request) {
  return handler(request);
}

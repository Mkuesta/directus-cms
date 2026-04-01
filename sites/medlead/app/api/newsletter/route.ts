import { newsletter } from '@/lib/newsletter';

const handler = newsletter.createApiHandler();

export async function POST(request: Request) {
  return handler(request);
}

export async function GET(request: Request) {
  return handler(request);
}

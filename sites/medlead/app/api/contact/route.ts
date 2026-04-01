import { forms } from '@/lib/forms';

const handler = forms.createApiHandler();

export async function POST(request: Request) {
  return handler(request);
}

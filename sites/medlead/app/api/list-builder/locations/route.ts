import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase();
    const type = searchParams.get('type');

    const { data: providers, error } = await supabaseAdmin
      .from('providers')
      .select('practice_city, practice_state, practice_zip');

    if (error) {
      console.error('Error fetching locations:', error);
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }

    const cityMap = new Map<string, { count: number; state: string }>();
    const zipMap = new Map<string, { count: number; city: string }>();

    providers?.forEach((p: any) => {
      if (p.practice_city) {
        const key = `${p.practice_city}|${p.practice_state || ''}`;
        const current = cityMap.get(key) || { count: 0, state: p.practice_state || '' };
        cityMap.set(key, { count: current.count + 1, state: p.practice_state || '' });
      }
      if (p.practice_zip) {
        const current = zipMap.get(p.practice_zip) || { count: 0, city: p.practice_city || '' };
        zipMap.set(p.practice_zip, { count: current.count + 1, city: p.practice_city || '' });
      }
    });

    const cities = Array.from(cityMap.entries())
      .map(([key, { count, state }]) => {
        const [name] = key.split('|');
        return {
          id: `city:${name}`,
          name: state ? `${name}, ${state}` : name,
          type: 'city' as const,
          count,
        };
      })
      .sort((a, b) => b.count - a.count);

    const zipCodes = Array.from(zipMap.entries())
      .map(([code, { count, city }]) => ({
        id: `zip:${code}`,
        name: city ? `${code} ${city}` : code,
        type: 'zip' as const,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    type LocationItem = { id: string; name: string; type: 'city' | 'zip'; count: number };
    let locations: LocationItem[] = [...cities];
    if (type === 'city') locations = cities;
    else if (type === 'zip') locations = zipCodes;

    if (search) {
      locations = locations.filter((loc) => loc.name.toLowerCase().includes(search));
    }

    const limit = type === 'zip' ? 100 : 50;
    locations = locations.slice(0, limit);

    return NextResponse.json({ locations, total: providers?.length || 0 });
  } catch (error) {
    console.error('Locations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

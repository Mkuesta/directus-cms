import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: specialties, error } = await supabaseAdmin
      .from('specialties')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching specialties:', error);
      return NextResponse.json({ error: 'Failed to fetch specialties' }, { status: 500 });
    }

    // Use provider_count from specialties table (pre-computed)
    const countMap = new Map<string, number>();
    specialties?.forEach((s: any) => {
      if (s.provider_count > 0) countMap.set(s.slug, s.provider_count);
    });

    // Build hierarchy
    const parents = specialties?.filter(s => !s.parent_id) || [];
    const children = specialties?.filter(s => s.parent_id) || [];

    const result = parents.map(parent => {
      const subs = children
        .filter(c => c.parent_id === parent.id)
        .map(sub => ({
          id: sub.name,
          name: sub.name,
          slug: sub.name,
          count: sub.provider_count || 0,
        }));

      return {
        id: parent.name,
        name: parent.name,
        slug: parent.name,
        count: parent.provider_count || 0,
        subcategories: subs,
      };
    });

    const total = result.reduce((sum, s) => {
      return sum + s.count + s.subcategories.reduce((ss, c) => ss + c.count, 0);
    }, 0);

    return NextResponse.json({ specialties: result, total });
  } catch (error) {
    console.error('Specialties API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

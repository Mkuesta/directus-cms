import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

interface FilterConfig {
  specialties: string[];
  states: string[];
  locations: string[];
  radiusSearch: { zip: string; radiusMiles: number } | null;
  providerTypes: string[];
  facilityTypes: string[];
  practiceSizes: string[];
  dataRequirements: {
    emailVerified: boolean;
    phoneVerified: boolean;
    npiVerified: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const filters: FilterConfig = await request.json();

    let query = supabaseAdmin.from('providers').select('npi', { count: 'exact', head: true });

    if (filters.specialties?.length > 0) {
      query = query.in('primary_taxonomy_desc', filters.specialties);
    }
    if (filters.states?.length > 0) {
      query = query.in('practice_state', filters.states);
    }
    if (filters.radiusSearch?.zip && filters.radiusSearch.radiusMiles > 0) {
      const { data: nearbyZips } = await supabaseAdmin
        .rpc('get_zip_codes_in_radius', {
          center_zip: filters.radiusSearch.zip,
          radius_miles: filters.radiusSearch.radiusMiles,
        });
      if (nearbyZips?.length > 0) {
        const zips = nearbyZips.map((row: { zip: string }) => row.zip);
        query = query.in('practice_zip', zips);
      }
    }
    if (filters.locations?.length > 0) {
      const cities: string[] = [];
      const zips: string[] = [];
      filters.locations.forEach((loc) => {
        if (loc.startsWith('city:')) {
          const city = loc.replace('city:', '').replace(/[^a-zA-Z\s\-'.]/g, '');
          if (city.length > 0 && city.length <= 100) cities.push(city);
        } else if (loc.startsWith('zip:')) {
          const zip = loc.replace('zip:', '').replace(/[^0-9]/g, '');
          if (zip.length === 5) zips.push(zip);
        }
      });
      if (cities.length > 0 && zips.length > 0) {
        query = query.or(`practice_city.in.(${cities.map(c => `"${c}"`).join(',')}),practice_zip.in.(${zips.join(',')})`);
      } else if (cities.length > 0) {
        query = query.in('practice_city', cities);
      } else if (zips.length > 0) {
        query = query.in('practice_zip', zips);
      }
    }
    // providerTypes, facilityTypes, practiceSizes not in NPI schema — skip
    if (filters.dataRequirements) {
      if (filters.dataRequirements.emailVerified) query = query.not('email', 'is', null);
      if (filters.dataRequirements.npiVerified) query = query.not('npi', 'is', null);
    }

    const { count, error: countError } = await query;
    if (countError) {
      console.error('Error counting providers:', countError);
      return NextResponse.json({ error: 'Failed to count providers' }, { status: 500 });
    }

    const leadCount = count || 0;

    const defaultTiers = [
      { min: 1, max: 100, price: 0.45, label: 'Starter' },
      { min: 101, max: 500, price: 0.35, label: 'Standard' },
      { min: 501, max: 2000, price: 0.25, label: 'Business' },
      { min: 2001, max: 10000, price: 0.18, label: 'Premium' },
      { min: 10001, max: null, price: 0.12, label: 'Enterprise' },
    ];

    let formattedTiers = defaultTiers;
    const { data: tiers, error: tiersError } = await supabaseAdmin
      .from('pricing_tiers')
      .select('*')
      .eq('is_active', true);

    if (!tiersError && tiers?.length > 0) {
      const first = tiers[0];
      if ('min_leads' in first && 'price_per_lead' in first) {
        formattedTiers = tiers
          .sort((a, b) => a.min_leads - b.min_leads)
          .map((t) => ({
            min: t.min_leads,
            max: t.max_leads,
            price: parseFloat(t.price_per_lead),
            label: t.name || 'Standard',
          }));
      }
    }

    let pricePerLead = 0.35;
    let tierName = 'Standard';
    for (const tier of formattedTiers) {
      if (leadCount >= tier.min && (tier.max === null || leadCount <= tier.max)) {
        pricePerLead = tier.price;
        tierName = tier.label;
        break;
      }
    }

    const totalPrice = Math.round(leadCount * pricePerLead * 100) / 100;

    return NextResponse.json({
      count: leadCount,
      pricePerLead,
      totalPrice,
      tier: tierName,
      tiers: formattedTiers,
    });
  } catch (error) {
    console.error('Count API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

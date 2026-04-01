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

function maskEmail(email: string | null): string {
  if (!email) return '***@***.com';
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.com';
  const maskedLocal = local.charAt(0) + '***';
  const domainParts = domain.split('.');
  const maskedDomain = domainParts[0].charAt(0) + '***.' + (domainParts[1] || 'com');
  return `${maskedLocal}@${maskedDomain}`;
}

function maskPhone(phone: string | null): string {
  if (!phone) return '(***) ***-****';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '(***) ***-****';
  return `(${cleaned.slice(0, 3)}) ***-****`;
}

function maskName(first: string | null, last: string | null): string {
  const f = first || '';
  const l = last || '';
  if (!f && !l) return 'J. S***';
  return `${f.charAt(0) || '?'}. ${l.charAt(0) || '?'}***`;
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const filters: FilterConfig = await request.json();

    let query = supabaseAdmin
      .from('providers')
      .select(`
        npi, first_name, last_name, credential,
        primary_taxonomy_desc, sex, org_name,
        practice_city, practice_state, practice_zip, practice_phone,
        email
      `)
      .limit(10);

    if (filters.specialties?.length > 0) query = query.in('primary_taxonomy_desc', filters.specialties);
    if (filters.states?.length > 0) query = query.in('practice_state', filters.states);
    if (filters.radiusSearch?.zip && filters.radiusSearch.radiusMiles > 0) {
      const { data: nearbyZips } = await supabaseAdmin
        .rpc('get_zip_codes_in_radius', {
          center_zip: filters.radiusSearch.zip,
          radius_miles: filters.radiusSearch.radiusMiles,
        });
      if (nearbyZips?.length > 0) {
        query = query.in('practice_zip', nearbyZips.map((r: { zip: string }) => r.zip));
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

    const { data: providers, error } = await query;
    if (error) {
      console.error('Error fetching preview:', error);
      return NextResponse.json({ error: 'Failed to fetch preview data' }, { status: 500 });
    }

    const preview = providers?.map((p: any) => ({
      id: p.npi,
      providerName: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'N/A',
      contactName: maskName(p.first_name, p.last_name),
      credential: p.credential || '',
      specialty: p.primary_taxonomy_desc || 'General',
      providerType: 'physician',
      facilityType: '',
      city: p.practice_city || 'N/A',
      state: p.practice_state || 'N/A',
      email: maskEmail(p.email),
      phone: maskPhone(p.practice_phone),
      emailVerified: !!p.email,
      phoneVerified: !!p.practice_phone,
      npiVerified: true,
      practiceSize: '',
    })) || [];

    return NextResponse.json({ preview, count: preview.length, isLimited: true });
  } catch (error) {
    console.error('Preview API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@proposaldrop.com';

async function getAdminUser(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  if (data.user.email !== ADMIN_EMAIL) return null;
  return data.user;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = Math.min(100, parseInt(searchParams.get('per_page') || '50'));
  const plan = searchParams.get('plan');

  try {
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (plan) {
      query = query.eq('plan', plan);
    }

    const { data: profiles, error, count } = await query;
    if (error) throw error;

    // Get proposal counts per user
    const userIds = (profiles || []).map((p) => p.id);
    const proposalCounts: Record<string, number> = {};

    if (userIds.length > 0) {
      const { data: proposalData } = await supabaseAdmin
        .from('proposals')
        .select('user_id')
        .in('user_id', userIds);

      (proposalData || []).forEach((p) => {
        proposalCounts[p.user_id] = (proposalCounts[p.user_id] || 0) + 1;
      });
    }

    const users = (profiles || []).map((profile) => ({
      ...profile,
      proposal_count: proposalCounts[profile.id] || 0,
    }));

    return NextResponse.json({
      users,
      total: count ?? 0,
      page,
      per_page: perPage,
    });
  } catch (err) {
    console.error('Admin users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

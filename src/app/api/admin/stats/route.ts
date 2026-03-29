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

  try {
    // Total users
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Total proposals
    const { count: totalProposals } = await supabaseAdmin
      .from('proposals')
      .select('*', { count: 'exact', head: true });

    // Accepted proposals
    const { count: acceptedProposals } = await supabaseAdmin
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted');

    // Active subscriptions (pro or team plan)
    const { count: activeSubs } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('plan', ['pro', 'team']);

    // Pro users count for MRR estimate
    const { count: proUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('plan', 'pro');

    const { count: teamUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('plan', 'team');

    // Rough MRR estimate
    const mrr = ((proUsers ?? 0) * 29) + ((teamUsers ?? 0) * 79);

    // Proposals this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: proposalsThisMonth } = await supabaseAdmin
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    return NextResponse.json({
      total_users: totalUsers ?? 0,
      total_proposals: totalProposals ?? 0,
      accepted_proposals: acceptedProposals ?? 0,
      active_subscriptions: activeSubs ?? 0,
      mrr,
      proposals_this_month: proposalsThisMonth ?? 0,
      conversion_rate:
        (totalProposals ?? 0) > 0
          ? Math.round(((acceptedProposals ?? 0) / (totalProposals ?? 1)) * 1000) / 10
          : 0,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

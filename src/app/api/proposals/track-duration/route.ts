import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposal_id, duration_seconds } = body;

    if (!proposal_id || typeof duration_seconds !== 'number') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Update the most recent view entry for this proposal with duration
    const { data: views } = await supabaseAdmin
      .from('proposal_views')
      .select('id')
      .eq('proposal_id', proposal_id)
      .order('viewed_at', { ascending: false })
      .limit(1);

    if (views && views.length > 0) {
      await supabaseAdmin
        .from('proposal_views')
        .update({ duration_seconds: Math.round(duration_seconds) })
        .eq('id', views[0].id)
        .is('duration_seconds', null); // only update if not already set
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

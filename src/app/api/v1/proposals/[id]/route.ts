import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateTotal } from '@/lib/utils';
import type { LineItem } from '@/types/index';

async function getAuthUser(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// GET /api/v1/proposals/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('proposals')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proposaldrop.com';
  return NextResponse.json({
    proposal: {
      ...data,
      share_url: data.token ? `${appUrl}/p/${data.token}` : null,
    },
  });
}

// PUT /api/v1/proposals/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('proposals')
    .select('id, user_id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      title,
      client_name,
      client_email,
      client_company,
      description,
      line_items,
      terms,
      notes,
      status,
    } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (client_name !== undefined) updateData.client_name = client_name?.trim() || null;
    if (client_email !== undefined) updateData.client_email = client_email?.trim() || null;
    if (client_company !== undefined) updateData.client_company = client_company?.trim() || null;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (terms !== undefined) updateData.terms = terms?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (status !== undefined) updateData.status = status;

    if (line_items !== undefined) {
      const enrichedItems: LineItem[] = (line_items as LineItem[]).map((item) => ({
        ...item,
        id: item.id || Math.random().toString(36).slice(2),
        amount: (item.qty || 0) * (item.rate || 0),
      }));
      updateData.line_items = enrichedItems;
      updateData.total_amount = calculateTotal(enrichedItems);
    }

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proposaldrop.com';
    return NextResponse.json({
      proposal: {
        ...data,
        share_url: data.token ? `${appUrl}/p/${data.token}` : null,
      },
    });
  } catch (err) {
    console.error('PUT /api/v1/proposals/:id error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/v1/proposals/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin
    .from('proposals')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Not found or delete failed' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Proposal deleted successfully' });
}

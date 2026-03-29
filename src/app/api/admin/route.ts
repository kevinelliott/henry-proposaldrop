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

  return NextResponse.json({
    name: 'ProposalDrop Admin API',
    version: '1.0.0',
    endpoints: [
      'GET /api/admin/stats',
      'GET /api/admin/users',
    ],
  });
}

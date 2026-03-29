import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Session exchange error:', exchangeError.message);
        return NextResponse.redirect(
          `${baseUrl}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data.user) {
        // Upsert profile on first login
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              email: data.user.email ?? null,
              company_name: data.user.user_metadata?.company_name ?? null,
              plan: 'free',
            },
            { onConflict: 'id', ignoreDuplicates: true }
          );

        if (profileError) {
          // Non-fatal — log but continue
          console.error('Profile upsert error:', profileError.message);
        }

        // Redirect to intended destination
        const redirectUrl = next.startsWith('/') ? `${baseUrl}${next}` : next;
        return NextResponse.redirect(redirectUrl);
      }
    } catch (err) {
      console.error('Callback handler error:', err);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${baseUrl}/login?error=Authentication+failed`);
}

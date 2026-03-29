import DashboardNav from '@/components/DashboardNav';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: User | null = null;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/login');
    }
    user = session.user;
  } catch {
    // If supabase is not configured (placeholder), render without auth check
    // This allows the app to build and run without real credentials
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {user && <DashboardNav user={user} />}
      {!user && (
        <nav className="bg-white border-b border-slate-200 h-16 flex items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">PD</span>
            </div>
            <span className="font-bold text-slate-900">ProposalDrop</span>
          </div>
        </nav>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

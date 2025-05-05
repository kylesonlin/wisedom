import { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = cookies() as unknown as { get: (name: string) => { value: string } | undefined };
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient userId={userId || ''} />
    </Suspense>
  );
} 
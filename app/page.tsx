import React from 'react';
import MainLayout from '../components/MainLayout';
import AIActionSuggestions from '../components/widgets/AIActionSuggestions';
import ActionItems from '../components/widgets/ActionItems';
import Birthdays from '../components/widgets/Birthdays';
import RelationshipStrength from '../components/widgets/RelationshipStrength';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  const user = session?.user;

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Please log in to view your dashboard</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          {/* AI Action Suggestions Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <AIActionSuggestions userId={user.id} />
          </div>
          {/* Action Items Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <ActionItems userId={user.id} />
          </div>
        </div>
        <div className="col-span-1">
          {/* Birthdays Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <Birthdays userId={user.id} />
          </div>
          {/* Relationship Strength Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <RelationshipStrength userId={user.id} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
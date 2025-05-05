"use client";
import React, { useState, useEffect } from 'react';
import SidePanel from './SidePanel';
import { useRouter } from 'next/router';
import { createClient, User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sideOpen, setSideOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/login');
      else setUser(data.user);
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="flex items-center">
          <button
            className="mr-4 md:hidden"
            onClick={() => setSideOpen(!sideOpen)}
            aria-label="Open navigation"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-xl tracking-tight text-primary">RelationshipOS</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              )}
              <span className="text-sm font-medium text-gray-700">{user.user_metadata?.name || user.email}</span>
            </>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          )}
        </div>
      </header>
      {/* Side Panel */}
      <SidePanel open={sideOpen} setOpen={setSideOpen} />
      {/* Main Content */}
      <main className="flex-1 p-4 md:ml-64 transition-all duration-200">
        {children}
      </main>
    </div>
  );
} 
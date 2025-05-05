import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to /import
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/import');
    });
  }, [router]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' && window.location.origin
          ? `${window.location.origin}/import`
          : 'https://app.wisedom.ai/import',
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to RelationshipOS</h1>
        <button
          onClick={handleSignIn}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
} 
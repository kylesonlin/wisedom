'use client';
export const dynamic = "force-dynamic";
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError('Failed to sign in with Google');
        console.error('Sign in error:', result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SignInContent() {
  const { data: session, status } = useSession({
    required: false,
  });
  // TEMP: Show session and status for debugging
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Debug Auth State
        </h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{JSON.stringify({ session, status }, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
} 
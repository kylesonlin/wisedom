'use client';

// Note: Ensure that next-auth/react is installed and its types are available.
import { useSession, signIn } from 'next-auth/react';
import DashboardClient from './Udashboardclient';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="text-center text-3xl font-extrabold text-gray-900">Welcome to Wisedom</h1>
            <p className="mt-2 text-center text-sm text-gray-600">Please sign in to access Mission Control.</p>
            <div className="mt-8">
              <button
                onClick={() => signIn('google')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardClient userId={session.user.id} />;
} 
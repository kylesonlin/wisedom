import { Suspense } from 'react';
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification';
import { getSession } from '@/utils/auth';
import { redirect } from 'next/navigation';

export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect('/auth/signin');
  }

  if (!session.requiresTwoFactor) {
    redirect(searchParams.callbackUrl || '/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <TwoFactorVerification
          onSuccess={() => {
            if (searchParams.callbackUrl) {
              redirect(searchParams.callbackUrl);
            } else {
              redirect('/dashboard');
            }
          }}
          onCancel={() => {
            redirect('/auth/signin');
          }}
        />
      </Suspense>
    </div>
  );
} 
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification';

interface ExtendedSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  requiresTwoFactor?: boolean;
}

export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = (await getServerSession()) as ExtendedSession | null;

  if (!session) {
    redirect('/auth/signin');
  }

  if (!session.requiresTwoFactor) {
    redirect(searchParams.callbackUrl || '/dashboard');
  }

  return <TwoFactorVerification />;
} 
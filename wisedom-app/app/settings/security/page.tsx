import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { getSession } from '@/utils/auth';
import { redirect } from 'next/navigation';

export default async function SecuritySettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Security Settings</h1>
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
          <p className="text-gray-600 mb-6">
            Add an extra layer of security to your account by enabling two-factor authentication.
            You'll need to enter a code from your authenticator app each time you sign in.
          </p>
          <Suspense fallback={<div>Loading...</div>}>
            <TwoFactorSetup />
          </Suspense>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Password</h2>
          <p className="text-gray-600 mb-6">
            Change your password to keep your account secure.
          </p>
          <Button variant="outline" onClick={() => {}}>
            Change Password
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
          <p className="text-gray-600 mb-6">
            View and manage your active sessions across different devices.
          </p>
          <Button variant="outline" onClick={() => {}}>
            View Active Sessions
          </Button>
        </Card>
      </div>
    </div>
  );
} 
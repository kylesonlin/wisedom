'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';

interface TwoFactorVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TwoFactorVerification({ onSuccess, onCancel }: TwoFactorVerificationProps) {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackupCode, setShowBackupCode] = useState(false);

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
      <p className="text-gray-600 mb-4">
        {showBackupCode
          ? 'Enter one of your backup codes to access your account.'
          : 'Enter the 6-digit code from your authenticator app.'}
      </p>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder={showBackupCode ? "Enter backup code" : "Enter 6-digit code"}
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          maxLength={showBackupCode ? 12 : 6}
          className="text-center text-2xl tracking-widest"
        />
        <div className="flex flex-col gap-2">
          <Button
            onClick={verifyCode}
            disabled={loading || (showBackupCode ? verificationCode.length !== 12 : verificationCode.length !== 6)}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowBackupCode(!showBackupCode)}
            className="w-full"
          >
            {showBackupCode ? 'Use authenticator app' : 'Use backup code'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
} 
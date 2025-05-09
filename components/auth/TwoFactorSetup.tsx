import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const router = useRouter();
  const [step, setStep] = useState<'initial' | 'verify' | 'backup'>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const startSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSetupData(data);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setBackupCodes(data.backupCodes);
      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    router.refresh();
  };

  if (step === 'initial') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-6">
          Enhance your account security by enabling two-factor authentication.
          You'll need to scan a QR code with your authenticator app.
        </p>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={startSetup}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Setup...
            </>
          ) : (
            'Start Setup'
          )}
        </Button>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        <p className="text-gray-600 mb-4">
          Scan this QR code with your authenticator app, then enter the code below.
        </p>
        {setupData && (
          <div className="flex justify-center mb-6">
            <QRCodeSVG value={setupData.qrCode} size={200} />
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          <Button
            onClick={verifyCode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Backup Codes</h2>
      <p className="text-gray-600 mb-4">
        Save these backup codes in a secure place. You can use them to access your account
        if you lose your authenticator device.
      </p>
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <ul className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <li key={index} className="font-mono text-sm">
              {code}
            </li>
          ))}
        </ul>
      </div>
      <Button
        onClick={handleComplete}
        className="w-full"
      >
        Complete Setup
      </Button>
    </Card>
  );
} 
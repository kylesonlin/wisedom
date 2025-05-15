'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validateForm } from '@/utils/formValidation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const validationResult = validateForm(
        { email },
        {
          email: { required: true },
        }
      );

      if (!validationResult.isValid) {
        setError(Object.values(validationResult.errors)[0]);
        return;
      }

      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="mb-6 text-center text-2xl font-bold">Forgot Password</h1>
        {success ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              If an account exists with that email, you will receive a password reset link.
            </p>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full"
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              aria-label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-error={error}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm">
          <p>
            Remember your password?{' '}
            <a
              href="/auth/signin"
              className="text-primary hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
} 
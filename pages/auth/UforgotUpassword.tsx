"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Ubutton';
import { Input } from '../../components/ui/Uinput';
import { Card } from '../../components/ui/Ucard';
import { validateForm } from '../../utils/formValidation';

export default function ForgotPassword() {
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

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6">
          <h1 className="mb-6 text-center text-2xl font-bold">Check Your Email</h1>
          <p className="mb-4 text-center text-muted-foreground">
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
          <Button
            className="w-full"
            onClick={() => router.push('/auth/signin')}
          >
            Return to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="mb-6 text-center text-2xl font-bold">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            error={error}
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
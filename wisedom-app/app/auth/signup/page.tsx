'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validateForm } from '@/utils/formValidation';

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const validationResult = validateForm(
        { email, password, name },
        {
          email: { required: true },
          password: { required: true, minLength: 6 },
          name: { required: true },
        }
      );

      if (!validationResult.isValid) {
        setError(Object.values(validationResult.errors)[0]);
        return;
      }

      await signup(email, password, name);
      router.push('/auth/verify-email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            aria-label="Name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            aria-label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-error={error}
          />
          <Input
            aria-label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            aria-label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <p>
            Already have an account?{' '}
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
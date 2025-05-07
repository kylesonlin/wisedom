import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      // TODO: Implement actual login logic here
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      setState({ user, loading: false, error: null });
      router.push('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('An error occurred'),
      }));
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      // TODO: Implement actual logout logic here
      await fetch('/api/auth/logout', { method: 'POST' });
      setState({ user: null, loading: false, error: null });
      router.push('/login');
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('An error occurred'),
      }));
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      // TODO: Implement actual auth check logic here
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      const user = await response.json();
      setState({ user, loading: false, error: null });
    } catch (error) {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    checkAuth,
  };
} 
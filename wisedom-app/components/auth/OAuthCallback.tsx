import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import { Loader2 } from 'lucide-react';

export function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      if (!searchParams) {
        throw new Error('Search params not available');
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const provider = searchParams.get('provider');

      if (!code || !state || !provider) {
        throw new Error('Missing required parameters');
      }

      // Verify state parameter
      const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Clear state from session storage
      sessionStorage.removeItem(`oauth_state_${provider}`);

      const supabase = getSupabaseClient();

      // Get provider details
      const { data: providerData, error: providerError } = await supabase
        .from('oauth_providers')
        .select('*')
        .eq('name', provider)
        .single();

      if (providerError) throw providerError;

      // Exchange code for token
      const response = await fetch(providerData.token_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: providerData.client_id,
          client_secret: providerData.client_secret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: providerData.redirect_uri
        })
      });

      if (!response.ok) throw new Error('Failed to exchange code for token');

      const data = await response.json();

      // Store token
      const { error: tokenError } = await supabase
        .from('oauth_tokens')
        .upsert({
          provider_id: providerData.id,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
          scope: data.scope.split(' ')
        });

      if (tokenError) throw tokenError;

      toast({
        title: 'Success',
        description: `Connected to ${provider} successfully`
      });

      // Redirect to integrations page
      router.push('/integrations');
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast({
        title: 'Error',
        description: 'Failed to complete OAuth flow',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-6 max-w-md w-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Completing Connection</h2>
          <p className="text-gray-600 mb-4">Please wait while we complete the OAuth flow...</p>
          <Progress value={loading ? undefined : 100} className="h-2" />
        </div>
      </Card>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { oauthProviderSchema, oauthTokenSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';
import { Mail, Calendar, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

type OAuthProvider = z.infer<typeof oauthProviderSchema>;
type OAuthToken = z.infer<typeof oauthTokenSchema>;

export function OAuthIntegration() {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [tokens, setTokens] = useState<OAuthToken[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Load providers
      const { data: providersData, error: providersError } = await supabase
        .from('oauth_providers')
        .select('*');

      if (providersError) throw providersError;
      setProviders(providersData || []);

      // Load tokens
      const { data: tokensData, error: tokensError } = await supabase
        .from('oauth_tokens')
        .select('*');

      if (tokensError) throw tokensError;
      setTokens(tokensData || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load OAuth data',
        variant: 'destructive'
      });
      console.error('Error loading OAuth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: OAuthProvider) => {
    try {
      // Generate state parameter for CSRF protection
      const state = Math.random().toString(36).substring(7);
      
      // Store state in session storage
      sessionStorage.setItem(`oauth_state_${provider.name}`, state);

      // Construct authorization URL
      const params = new URLSearchParams({
        client_id: provider.client_id,
        redirect_uri: provider.redirect_uri,
        response_type: 'code',
        scope: provider.scope.join(' '),
        state,
        access_type: 'offline',
        prompt: 'consent'
      });

      // Redirect to authorization URL
      window.location.href = `${provider.auth_url}?${params.toString()}`;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate OAuth flow',
        variant: 'destructive'
      });
      console.error('Error initiating OAuth flow:', error);
    }
  };

  const handleDisconnect = async (provider: OAuthProvider) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Delete token
      const { error } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('provider_id', provider.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Disconnected from ${provider.name}`
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect OAuth provider',
        variant: 'destructive'
      });
      console.error('Error disconnecting OAuth provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (token: OAuthToken) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Get provider
      const { data: provider, error: providerError } = await supabase
        .from('oauth_providers')
        .select('*')
        .eq('id', token.provider_id)
        .single();

      if (providerError) throw providerError;

      // Refresh token
      const response = await fetch(provider.token_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: provider.client_id,
          client_secret: provider.client_secret,
          grant_type: 'refresh_token',
          refresh_token: token.refresh_token || ''
        })
      });

      if (!response.ok) throw new Error('Failed to refresh token');

      const data = await response.json();

      // Update token
      const { error: updateError } = await supabase
        .from('oauth_tokens')
        .update({
          access_token: data.access_token,
          token_type: data.token_type,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
          scope: data.scope.split(' ')
        })
        .eq('id', token.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Token refreshed successfully'
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh token',
        variant: 'destructive'
      });
      console.error('Error refreshing token:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTokenForProvider = (provider: OAuthProvider) => {
    return tokens.find(token => token.provider_id === provider.id);
  };

  const isTokenExpired = (token: OAuthToken) => {
    return new Date(token.expires_at) <= new Date();
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">OAuth Integrations</h2>
          <Button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {providers.map(provider => {
            const token = getTokenForProvider(provider);
            const isExpired = token && isTokenExpired(token);

            return (
              <Card key={provider.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {provider.name === 'gmail' ? (
                      <Mail className="h-6 w-6 text-blue-500" />
                    ) : (
                      <Calendar className="h-6 w-6 text-green-500" />
                    )}
                    <div>
                      <h3 className="font-medium capitalize">{provider.name}</h3>
                      <p className="text-sm text-gray-500">
                        {token ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {token ? (
                      <>
                        <Badge
                          variant={isExpired ? 'destructive' : 'default'}
                          className="flex items-center gap-1"
                        >
                          {isExpired ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {isExpired ? 'Expired' : 'Active'}
                        </Badge>
                        {isExpired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefresh(token)}
                            disabled={loading}
                          >
                            Refresh
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDisconnect(provider)}
                          disabled={loading}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleConnect(provider)}
                        disabled={loading}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
} 
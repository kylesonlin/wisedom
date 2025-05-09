import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OAuthCallback } from '../OAuthCallback';
import { renderWithProviders } from '@/utils/test-utils';
import { getSupabaseClient } from '@/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock the Supabase client
jest.mock('@/utils/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('OAuthCallback', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSearchParams = new URLSearchParams({
    code: 'test-code',
    state: 'test-state',
    provider: 'gmail',
  });

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    data: {
      token_url: 'https://oauth2.googleapis.com/token',
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
    },
    error: null,
  };

  beforeEach(() => {
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    jest.clearAllMocks();
    sessionStorage.setItem('oauth_state', 'test-state');
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<OAuthCallback />);
    expect(screen.getByText('Processing OAuth callback...')).toBeInTheDocument();
  });

  it('handles successful OAuth callback', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
      }),
    });

    renderWithProviders(<OAuthCallback />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('oauth_tokens');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          provider_id: 'gmail',
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
        })
      );
      expect(mockRouter.push).toHaveBeenCalledWith('/integrations');
    });
  });

  it('handles missing parameters', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    renderWithProviders(<OAuthCallback />);

    await waitFor(() => {
      expect(screen.getByText('Invalid OAuth callback parameters')).toBeInTheDocument();
    });
  });

  it('handles invalid state parameter', async () => {
    sessionStorage.setItem('oauth_state', 'different-state');
    renderWithProviders(<OAuthCallback />);

    await waitFor(() => {
      expect(screen.getByText('Invalid state parameter')).toBeInTheDocument();
    });
  });

  it('handles provider not found', async () => {
    mockSupabase.data = null;
    renderWithProviders(<OAuthCallback />);

    await waitFor(() => {
      expect(screen.getByText('OAuth provider not found')).toBeInTheDocument();
    });
  });

  it('handles token exchange error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Token exchange failed'));
    renderWithProviders(<OAuthCallback />);

    await waitFor(() => {
      expect(screen.getByText('Failed to exchange token')).toBeInTheDocument();
    });
  });

  it('handles token storage error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
      }),
    });

    mockSupabase.insert.mockResolvedValue({ error: new Error('Failed to store token') });
    renderWithProviders(<OAuthCallback />);

    await waitFor(() => {
      expect(screen.getByText('Failed to store OAuth token')).toBeInTheDocument();
    });
  });
}); 
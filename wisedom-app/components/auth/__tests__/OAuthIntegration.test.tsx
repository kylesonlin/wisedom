import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OAuthIntegration } from '../OAuthIntegration';
import { renderWithProviders } from '@/utils/test-utils';
import { getSupabaseClient } from '@/utils/supabase';

// Mock the Supabase client
jest.mock('@/utils/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('OAuthIntegration', () => {
  const mockProviders = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: 'mail',
      description: 'Connect your Gmail account',
      is_connected: false,
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: 'calendar',
      description: 'Connect your Calendar',
      is_connected: true,
    },
  ];

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    data: mockProviders,
    error: null,
  };

  beforeEach(() => {
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  it('renders OAuth providers correctly', async () => {
    renderWithProviders(<OAuthIntegration />);

    // Check if providers are rendered
    expect(screen.getByText('Gmail')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Connect your Gmail account')).toBeInTheDocument();
    expect(screen.getByText('Connect your Calendar')).toBeInTheDocument();
  });

  it('shows correct connection status', async () => {
    renderWithProviders(<OAuthIntegration />);

    // Check connection status
    expect(screen.getByText('Not Connected')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('handles connect button click', async () => {
    const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<OAuthIntegration />);

    // Click connect button for Gmail
    const connectButton = screen.getAllByText('Connect')[0];
    fireEvent.click(connectButton);

    // Check if window.open was called with correct URL
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/oauth/gmail'),
      '_self'
    );

    mockWindowOpen.mockRestore();
  });

  it('handles disconnect button click', async () => {
    mockSupabase.from.mockReturnValue({
      delete: jest.fn().mockResolvedValue({ error: null }),
    });

    renderWithProviders(<OAuthIntegration />);

    // Click disconnect button for Calendar
    const disconnectButton = screen.getByText('Disconnect');
    fireEvent.click(disconnectButton);

    // Check if Supabase delete was called
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('oauth_tokens');
    });
  });

  it('handles refresh button click', async () => {
    mockSupabase.from.mockReturnValue({
      update: jest.fn().mockResolvedValue({ error: null }),
    });

    renderWithProviders(<OAuthIntegration />);

    // Click refresh button
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Check if Supabase update was called
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('oauth_tokens');
    });
  });

  it('handles error states', async () => {
    mockSupabase.error = new Error('Failed to fetch providers');
    renderWithProviders(<OAuthIntegration />);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load OAuth providers')).toBeInTheDocument();
    });
  });
}); 
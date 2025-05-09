import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardHeader } from './DashboardHeader';
import { useSidebar } from './DashboardSidebar';

// Mock the UI components
jest.mock('@/components/ui', () => require('./__mocks__/ui'));

// Mock the useSidebar hook
jest.mock('./DashboardSidebar', () => ({
  useSidebar: jest.fn(),
}));

describe('DashboardHeader', () => {
  const mockToggleWidget = jest.fn();
  const mockOpenFeedback = jest.fn();
  const mockToggleSidebar = jest.fn();
  const defaultVisibleWidgets = {
    network: true,
    projects: true,
    'ai-insights': false,
    contacts: true,
    tasks: false,
    events: true,
    activity: false,
  };

  beforeEach(() => {
    (useSidebar as jest.Mock).mockReturnValue({ toggleSidebar: mockToggleSidebar });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const openSettingsMenu = async () => {
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await act(async () => {
      fireEvent.click(settingsButton);
    });
    await waitFor(() => {
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });
  };

  it('renders all main components', () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    // Check for main elements
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows notification count', () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    const notificationCount = screen.getByText('5');
    expect(notificationCount).toBeInTheDocument();
    expect(notificationCount).toHaveClass('bg-dashboard-primary', 'text-white');
  });

  it('toggles widgets correctly', async () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    // Open settings dropdown
    await openSettingsMenu();

    // Toggle network widget
    const networkWidget = screen.getByText(/network overview/i);
    await act(async () => {
      fireEvent.click(networkWidget);
    });
    expect(mockToggleWidget).toHaveBeenCalledWith('network');

    // Toggle AI insights widget
    const aiWidget = screen.getByText(/ai insights/i);
    await act(async () => {
      fireEvent.click(aiWidget);
    });
    expect(mockToggleWidget).toHaveBeenCalledWith('ai-insights');
  });

  it('opens feedback dialog', async () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    // Open settings dropdown
    await openSettingsMenu();

    // Click feedback button
    const feedbackButton = screen.getByText(/send feedback/i);
    await act(async () => {
      fireEvent.click(feedbackButton);
    });
    expect(mockOpenFeedback).toHaveBeenCalled();
  });

  it('toggles sidebar on mobile', () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    expect(mockToggleSidebar).toHaveBeenCalled();
  });

  it('shows correct widget checkmarks', async () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    // Open settings dropdown
    await openSettingsMenu();

    // Check visible widgets have checkmarks
    expect(screen.getByText(/network overview ✓/i)).toBeInTheDocument();
    expect(screen.getByText(/project progress ✓/i)).toBeInTheDocument();
    expect(screen.getByText(/^ai insights$/i)).toBeInTheDocument(); // No checkmark
  });

  it('handles search input', () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  it('maintains accessibility standards', () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    // Check for ARIA labels
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
}); 
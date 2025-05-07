import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from './DashboardHeader';
import { useSidebar } from './DashboardSidebar';

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
    expect(screen.getByRole('button', { name: /user/i })).toBeInTheDocument();
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

  it('toggles widgets correctly', () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    // Open settings dropdown
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    // Toggle network widget
    fireEvent.click(screen.getByText(/network overview/i));
    expect(mockToggleWidget).toHaveBeenCalledWith('network');

    // Toggle AI insights widget
    fireEvent.click(screen.getByText(/ai insights/i));
    expect(mockToggleWidget).toHaveBeenCalledWith('ai-insights');
  });

  it('opens feedback dialog', () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    // Open settings dropdown
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    // Click feedback button
    fireEvent.click(screen.getByText(/send feedback/i));
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

  it('shows correct widget checkmarks', () => {
    render(
      <DashboardHeader
        onToggleWidget={mockToggleWidget}
        visibleWidgets={defaultVisibleWidgets}
        onOpenFeedback={mockOpenFeedback}
      />
    );

    // Open settings dropdown
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    // Check visible widgets have checkmarks
    expect(screen.getByText(/network overview ✓/i)).toBeInTheDocument();
    expect(screen.getByText(/project progress ✓/i)).toBeInTheDocument();
    expect(screen.getByText(/ai insights$/i)).toBeInTheDocument(); // No checkmark
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
    expect(screen.getByRole('button', { name: /user/i })).toBeInTheDocument();
  });
}); 
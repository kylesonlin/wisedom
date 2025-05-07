import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import { ThemeProvider } from '../ThemeProvider';
import { useUser } from '@supabase/auth-helpers-react';
import { useWidgets } from '../../../hooks/useWidgets';

// Mock the hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn(),
}));

jest.mock('../../../hooks/useWidgets', () => ({
  useWidgets: jest.fn(),
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('DashboardLayout Integration', () => {
  const mockUser = { id: 'test-user-id' };
  const mockWidgets = [
    {
      id: 'network-overview',
      title: 'Network Overview',
      component: () => <div>Network Overview</div>,
      enabled: true,
      order: 0,
    },
    {
      id: 'contact-card',
      title: 'Contact Card',
      component: () => <div>Contact Card</div>,
      enabled: true,
      order: 1,
    },
  ];

  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue(mockUser);
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: mockWidgets,
      loading: false,
      error: null,
      toggleWidget: jest.fn(),
      reorderWidget: jest.fn(),
    });
  });

  it('renders with theme provider', () => {
    renderWithTheme(<DashboardLayout />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('handles widget interactions with theme context', async () => {
    const mockToggleWidget = jest.fn();
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: mockWidgets,
      loading: false,
      error: null,
      toggleWidget: mockToggleWidget,
      reorderWidget: jest.fn(),
    });

    renderWithTheme(<DashboardLayout />);
    
    // Test widget removal
    const removeButton = screen.getByTestId('remove-widget-network-overview');
    fireEvent.click(removeButton);
    expect(mockToggleWidget).toHaveBeenCalledWith('network-overview', false);

    // Test widget addition
    const addButton = screen.getByTestId('add-widget-button');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('available-widgets')).toBeInTheDocument();
    });
  });

  it('handles theme changes with widgets', () => {
    renderWithTheme(<DashboardLayout />);
    
    // Verify widgets are rendered with theme context
    const widgets = screen.getAllByTestId(/^widget-/);
    widgets.forEach(widget => {
      expect(widget).toHaveClass('rounded-lg');
    });
  });

  it('handles loading state with theme context', () => {
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: [],
      loading: true,
      error: null,
      toggleWidget: jest.fn(),
      reorderWidget: jest.fn(),
    });

    renderWithTheme(<DashboardLayout />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('handles error state with theme context', () => {
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: [],
      loading: false,
      error: 'Test error',
      toggleWidget: jest.fn(),
      reorderWidget: jest.fn(),
    });

    renderWithTheme(<DashboardLayout />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Error: Test error');
  });
}); 
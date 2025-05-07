import { render, screen, fireEvent } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import { useUser } from '@supabase/auth-helpers-react';
import { useWidgets } from '../../../hooks/useWidgets';

// Mock the hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn(),
}));

jest.mock('../../../hooks/useWidgets', () => ({
  useWidgets: jest.fn(),
}));

describe('DashboardLayout', () => {
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

  it('renders loading state correctly', () => {
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: [],
      loading: true,
      error: null,
      toggleWidget: jest.fn(),
      reorderWidget: jest.fn(),
    });

    render(<DashboardLayout />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: [],
      loading: false,
      error: 'Test error',
      toggleWidget: jest.fn(),
      reorderWidget: jest.fn(),
    });

    render(<DashboardLayout />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Error: Test error');
  });

  it('renders enabled widgets correctly', () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByTestId('widget-network-overview')).toBeInTheDocument();
    expect(screen.getByTestId('widget-contact-card')).toBeInTheDocument();
  });

  it('handles widget toggle correctly', () => {
    const mockToggleWidget = jest.fn();
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: mockWidgets,
      loading: false,
      error: null,
      toggleWidget: mockToggleWidget,
      reorderWidget: jest.fn(),
    });

    render(<DashboardLayout />);
    const removeButton = screen.getByTestId('remove-widget-network-overview');
    fireEvent.click(removeButton);
    expect(mockToggleWidget).toHaveBeenCalledWith('network-overview', false);
  });

  it('handles widget reordering correctly', () => {
    const mockReorderWidget = jest.fn();
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: mockWidgets,
      loading: false,
      error: null,
      toggleWidget: jest.fn(),
      reorderWidget: mockReorderWidget,
    });

    render(<DashboardLayout />);
    const firstWidget = screen.getByTestId('widget-network-overview');
    const secondWidget = screen.getByTestId('widget-contact-card');
    
    fireEvent.dragStart(firstWidget);
    fireEvent.dragOver(secondWidget);
    fireEvent.drop(secondWidget);
    
    expect(mockReorderWidget).toHaveBeenCalled();
  });

  it('shows add widget button and handles widget addition', () => {
    render(<DashboardLayout />);
    const addButton = screen.getByTestId('add-widget-button');
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    expect(screen.getByTestId('available-widgets')).toBeInTheDocument();
  });

  it('handles widget addition correctly', () => {
    const mockToggleWidget = jest.fn();
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: mockWidgets,
      loading: false,
      error: null,
      toggleWidget: mockToggleWidget,
      reorderWidget: jest.fn(),
    });

    render(<DashboardLayout />);
    const addButton = screen.getByTestId('add-widget-button');
    fireEvent.click(addButton);
    
    const widgetButton = screen.getByTestId('widget-button-relationship-strength');
    fireEvent.click(widgetButton);
    
    expect(mockToggleWidget).toHaveBeenCalledWith('relationship-strength', true);
  });
}); 
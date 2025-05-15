import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardLayout from '@/app/components/new-dashboard/DashboardLayout';
import { ThemeProvider } from '@/app/components/ThemeProvider';

// Mock the validation service
const mockValidateWidgetSettings = jest.fn();
jest.mock('@/lib/validation', () => ({
  validateWidgetSettings: mockValidateWidgetSettings
}));

// Mock the error tracking service
const mockCaptureError = jest.fn();
jest.mock('@/lib/errorTracking', () => ({
  captureError: mockCaptureError
}));

// Mock the Supabase hooks
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn().mockResolvedValue({ data: [], error: null })
      }))
    })),
    insert: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ data: [], error: null })
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ data: [], error: null })
    }))
  }))
};

jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn(() => ({ id: 'test-user-id' })),
  useSupabaseClient: jest.fn(() => mockSupabaseClient),
}));

// Mock the widgets hook
const mockToggleWidget = jest.fn();
const mockReorderWidgets = jest.fn();
jest.mock('@/hooks/useWidgets', () => ({
  useWidgets: () => ({
    widgets: [
      { id: 'network-overview', title: 'Network Overview', enabled: true, order: 0, component: () => <div data-testid="widget-network-overview">Network Overview</div> },
      { id: 'contact-card', title: 'Contact Card', enabled: true, order: 1, component: () => <div data-testid="widget-contact-card">Contact Card</div> },
      { id: 'relationship-strength', title: 'Relationship Strength', enabled: false, order: 2, component: () => <div data-testid="widget-relationship-strength">Relationship Strength</div> }
    ],
    toggleWidget: mockToggleWidget,
    reorderWidgets: mockReorderWidgets,
    loading: false,
    error: null
  })
}));

// Mock the widget components
jest.mock('@/components/NetworkOverview', () => ({
  NetworkOverview: () => <div data-testid="network-overview">Network Overview</div>
}));

jest.mock('@/components/ContactCard', () => ({
  ContactCard: () => <div data-testid="contact-card">Contact Card</div>
}));

jest.mock('@/components/RelationshipStrength', () => ({
  RelationshipStrength: () => <div data-testid="relationship-strength">Relationship Strength</div>
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard title', () => {
    renderWithTheme(<DashboardLayout />);
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Dashboard');
  });

  it('renders enabled widgets', () => {
    renderWithTheme(<DashboardLayout />);
    expect(screen.getByTestId('widget-network-overview')).toBeInTheDocument();
    expect(screen.getByTestId('widget-contact-card')).toBeInTheDocument();
  });

  it('handles widget errors gracefully', async () => {
    jest.spyOn(require('@/app/hooks/useWidgets'), 'useWidgets').mockImplementation(() => ({
      widgets: [{ id: 'error-widget', title: 'Error Widget', enabled: true }],
      toggleWidget: mockToggleWidget,
      reorderWidgets: mockReorderWidgets,
      isLoading: false,
      error: null
    }));

    renderWithTheme(<DashboardLayout />);
    
    await waitFor(() => {
      expect(mockCaptureError).toHaveBeenCalled();
    });
  });

  it('allows adding new widgets', () => {
    renderWithTheme(<DashboardLayout />);
    
    // Click add widget button
    const addButton = screen.getByTestId('add-widget-button');
    fireEvent.click(addButton);
    
    // Verify available widgets are shown
    expect(screen.getByTestId('available-widgets')).toBeInTheDocument();
    
    // Add a widget
    const widgetButton = screen.getByTestId('widget-button-relationship-strength');
    fireEvent.click(widgetButton);
    
    expect(mockToggleWidget).toHaveBeenCalledWith('relationship-strength', true);
  });

  it('handles widget removal', () => {
    renderWithTheme(<DashboardLayout />);
    
    const removeButton = screen.getByTestId('widget-toggle-network-overview');
    fireEvent.click(removeButton);
    
    expect(mockToggleWidget).toHaveBeenCalledWith('network-overview', false);
  });

  it('handles widget reordering', () => {
    renderWithTheme(<DashboardLayout />);
    
    const firstWidget = screen.getByTestId('widget-network-overview');
    const secondWidget = screen.getByTestId('widget-contact-card');
    
    // Simulate drag and drop
    fireEvent.dragStart(firstWidget);
    fireEvent.drop(secondWidget);
    fireEvent.dragEnd(firstWidget);
    
    expect(mockReorderWidgets).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    jest.spyOn(require('@/app/hooks/useWidgets'), 'useWidgets').mockImplementation(() => ({
      widgets: [],
      toggleWidget: mockToggleWidget,
      reorderWidgets: mockReorderWidgets,
      isLoading: true,
      error: null
    }));

    renderWithTheme(<DashboardLayout />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('shows error state', () => {
    jest.spyOn(require('@/app/hooks/useWidgets'), 'useWidgets').mockImplementation(() => ({
      widgets: [],
      toggleWidget: mockToggleWidget,
      reorderWidgets: mockReorderWidgets,
      isLoading: false,
      error: 'Test error'
    }));

    renderWithTheme(<DashboardLayout />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Error: Test error');
  });

  it('handles widget refresh', () => {
    renderWithTheme(<DashboardLayout />);
    
    const refreshButton = screen.getByTestId('widget-refresh-network-overview');
    fireEvent.click(refreshButton);
    
    // Verify the widget is refreshed (this would typically trigger a re-render)
    expect(screen.getByTestId('widget-network-overview')).toBeInTheDocument();
  });

  it('maintains widget state after reordering', () => {
    renderWithTheme(<DashboardLayout />);
    
    const firstWidget = screen.getByTestId('widget-network-overview');
    const secondWidget = screen.getByTestId('widget-contact-card');
    
    // Simulate drag and drop
    fireEvent.dragStart(firstWidget);
    fireEvent.drop(secondWidget);
    fireEvent.dragEnd(firstWidget);
    
    // Verify widgets are still present after reordering
    expect(screen.getByTestId('widget-network-overview')).toBeInTheDocument();
    expect(screen.getByTestId('widget-contact-card')).toBeInTheDocument();
  });
}); 
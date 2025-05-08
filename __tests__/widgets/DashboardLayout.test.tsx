import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardLayout from '@/app/components/new-dashboard/DashboardLayout';
import { ErrorTrackingService } from '@/services/errorTracking';
import { WidgetValidationService } from '@/services/widgetValidation';
import { Widget } from '@/types/widget';

// Mock the services
jest.mock('@/services/errorTracking');
jest.mock('@/services/widgetValidation');

describe('DashboardLayout', () => {
  const mockWidgets: Widget[] = [
    {
      id: 'network-overview',
      title: 'Network Overview',
      component: () => <div>Network Overview Widget</div>,
      enabled: true,
      order: 0,
      type: 'network-overview',
      category: 'analytics',
      permissions: ['read'],
    },
    {
      id: 'contact-card',
      title: 'Contact Card',
      component: () => <div>Contact Card Widget</div>,
      enabled: true,
      order: 1,
      type: 'contact-card',
      category: 'contacts',
      permissions: ['read', 'write'],
      settings: {
        name: 'Demo User',
        email: 'demo@example.com',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard title', () => {
    render(<DashboardLayout widgets={mockWidgets} />);
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Dashboard');
  });

  it('renders enabled widgets', () => {
    render(<DashboardLayout widgets={mockWidgets} />);
    expect(screen.getByText('Network Overview Widget')).toBeInTheDocument();
    expect(screen.getByText('Contact Card Widget')).toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    render(<DashboardLayout widgets={[]} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('handles widget errors gracefully', async () => {
    const errorWidget: Widget = {
      ...mockWidgets[0],
      component: () => {
        throw new Error('Test error');
      },
    };

    render(<DashboardLayout widgets={[errorWidget]} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Widget Error:/)).toBeInTheDocument();
    });
  });

  it('allows adding new widgets', async () => {
    const onWidgetToggle = jest.fn();
    render(
      <DashboardLayout
        widgets={mockWidgets}
        onWidgetToggle={onWidgetToggle}
      />
    );

    // Click add widget button
    fireEvent.click(screen.getByTestId('add-widget-button'));
    
    // Verify available widgets are shown
    expect(screen.getByTestId('available-widgets')).toBeInTheDocument();
  });

  it('validates widget settings', async () => {
    const validationService = WidgetValidationService.getInstance();
    const invalidWidget: Widget = {
      ...mockWidgets[1],
      settings: {
        name: '', // Invalid empty name
        email: 'invalid-email', // Invalid email
      },
    };

    render(<DashboardLayout widgets={[invalidWidget]} />);
    
    await waitFor(() => {
      expect(validationService.validateWidgetSettings).toHaveBeenCalled();
    });
  });

  it('handles widget reordering', async () => {
    const onWidgetReorder = jest.fn();
    render(
      <DashboardLayout
        widgets={mockWidgets}
        onWidgetReorder={onWidgetReorder}
      />
    );

    const widget = screen.getByTestId('widget-network-overview');
    const target = screen.getByTestId('widget-contact-card');

    // Simulate drag and drop
    fireEvent.dragStart(widget);
    fireEvent.dragOver(target);
    fireEvent.drop(target);

    await waitFor(() => {
      expect(onWidgetReorder).toHaveBeenCalled();
    });
  });

  it('reports errors to error tracking service', async () => {
    const errorTracking = ErrorTrackingService.getInstance();
    const errorWidget: Widget = {
      ...mockWidgets[0],
      component: () => {
        throw new Error('Test error');
      },
    };

    render(<DashboardLayout widgets={[errorWidget]} />);
    
    await waitFor(() => {
      expect(errorTracking.captureError).toHaveBeenCalled();
    });
  });
}); 
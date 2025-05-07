import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import { useWidgets } from '@/hooks/useWidgets';

// Mock the useWidgets hook
jest.mock('@/hooks/useWidgets', () => ({
  useWidgets: jest.fn(),
}));

// Mock all child components
jest.mock('@/components/NetworkOverview', () => ({
  NetworkOverview: () => <div data-testid="network-widget">Network Overview</div>,
}));

jest.mock('@/components/ProjectProgress', () => ({
  ProjectProgress: () => <div data-testid="projects-widget">Project Progress</div>,
}));

jest.mock('@/components/AIInsights', () => ({
  AIInsights: () => <div data-testid="ai-insights-widget">AI Insights</div>,
}));

jest.mock('@/components/ContactsWidget', () => ({
  ContactsWidget: () => <div data-testid="contacts-widget">Contacts</div>,
}));

jest.mock('@/components/TasksWidget', () => ({
  TasksWidget: () => <div data-testid="tasks-widget">Tasks</div>,
}));

jest.mock('@/components/UpcomingEvents', () => ({
  UpcomingEvents: () => <div data-testid="events-widget">Events</div>,
}));

jest.mock('@/components/RecentActivity', () => ({
  RecentActivity: () => <div data-testid="activity-widget">Activity</div>,
}));

describe('Dashboard Widget Management Flow', () => {
  const mockSaveWidgetPreferences = jest.fn();
  const mockToggleWidget = jest.fn();
  const mockReorderWidget = jest.fn();

  beforeEach(() => {
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: [
        { id: 'network', enabled: true },
        { id: 'projects', enabled: true },
        { id: 'contacts', enabled: true },
      ],
      loading: false,
      error: null,
      toggleWidget: mockToggleWidget,
      reorderWidget: mockReorderWidget,
    });
    mockSaveWidgetPreferences.mockClear();
    mockToggleWidget.mockClear();
    mockReorderWidget.mockClear();
  });

  it('loads dashboard with default widgets', async () => {
    render(<DashboardLayout onSavePreferences={mockSaveWidgetPreferences} />);

    // Check loading state
    (useWidgets as jest.Mock).mockReturnValueOnce({
      widgets: [],
      loading: true,
      error: null,
      toggleWidget: mockToggleWidget,
      reorderWidget: mockReorderWidget,
    });

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Verify default widgets are present
    expect(screen.getByTestId('network-widget')).toBeInTheDocument();
    expect(screen.getByTestId('projects-widget')).toBeInTheDocument();
    expect(screen.getByTestId('contacts-widget')).toBeInTheDocument();
  });

  it('toggles widgets through settings menu', async () => {
    render(<DashboardLayout onSavePreferences={mockSaveWidgetPreferences} />);

    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Open settings menu
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    // Toggle AI Insights widget
    fireEvent.click(screen.getByText(/ai insights/i));
    expect(mockToggleWidget).toHaveBeenCalledWith('ai-insights', true);

    // Toggle Tasks widget
    fireEvent.click(screen.getByText(/tasks/i));
    expect(mockToggleWidget).toHaveBeenCalledWith('tasks', true);

    // Verify preferences are saved
    expect(mockSaveWidgetPreferences).toHaveBeenCalledWith(
      expect.objectContaining({
        'ai-insights': true,
        tasks: true,
      })
    );
  });

  it('maintains widget state after page reload', async () => {
    // Simulate saved preferences
    const savedPreferences = {
      network: true,
      projects: false,
      'ai-insights': true,
      contacts: true,
      tasks: true,
      events: false,
      activity: false,
    };

    (useWidgets as jest.Mock).mockReturnValue({
      widgets: Object.entries(savedPreferences).map(([id, enabled]) => ({ id, enabled })),
      loading: false,
      error: null,
      toggleWidget: mockToggleWidget,
      reorderWidget: mockReorderWidget,
    });

    render(<DashboardLayout 
      onSavePreferences={mockSaveWidgetPreferences}
      initialPreferences={savedPreferences}
    />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Verify widgets reflect saved preferences
    expect(screen.getByTestId('network-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('projects-widget')).not.toBeInTheDocument();
    expect(screen.getByTestId('ai-insights-widget')).toBeInTheDocument();
    expect(screen.getByTestId('contacts-widget')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('events-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('activity-widget')).not.toBeInTheDocument();
  });

  it('handles widget interactions', async () => {
    render(<DashboardLayout onSavePreferences={mockSaveWidgetPreferences} />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Add a new widget
    fireEvent.click(screen.getByTestId('add-widget-button'));
    const availableWidgets = screen.getByTestId('available-widgets');
    expect(availableWidgets).toBeInTheDocument();

    // Select a widget to add
    fireEvent.click(screen.getByTestId('widget-button-tasks'));
    expect(mockToggleWidget).toHaveBeenCalledWith('tasks', true);

    // Remove a widget
    fireEvent.click(screen.getByTestId('remove-widget-tasks'));
    expect(mockToggleWidget).toHaveBeenCalledWith('tasks', false);

    // Verify preferences are updated
    expect(mockSaveWidgetPreferences).toHaveBeenCalledWith(
      expect.not.objectContaining({
        tasks: true,
      })
    );
  });

  it('handles errors gracefully', async () => {
    // Mock console.error to prevent error logging
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate an error
    (useWidgets as jest.Mock).mockReturnValue({
      widgets: [],
      loading: false,
      error: 'Failed to load widgets',
      toggleWidget: mockToggleWidget,
      reorderWidget: mockReorderWidget,
    });

    render(<DashboardLayout onSavePreferences={mockSaveWidgetPreferences} />);

    // Verify error message is shown
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(/failed to load widgets/i)).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
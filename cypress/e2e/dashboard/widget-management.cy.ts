import { mockUser, mockWidgetPreferences } from '../../support/mocks/user';

describe('Dashboard Widget Management', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: mockUser,
    }).as('getSession');

    // Mock widget preferences
    cy.intercept('GET', '/api/widget-preferences', {
      statusCode: 200,
      body: mockWidgetPreferences,
    }).as('getWidgetPreferences');

    // Mock widget preferences update
    cy.intercept('PUT', '/api/widget-preferences', {
      statusCode: 200,
      body: { success: true },
    }).as('updateWidgetPreferences');

    // Visit the dashboard with retry options
    cy.visit('/dashboard', {
      failOnStatusCode: false,
      timeout: 10000,
    });

    // Wait for API calls with increased timeout
    cy.wait('@getSession', { timeout: 10000 });
    cy.wait('@getWidgetPreferences', { timeout: 10000 });
  });

  it('should load dashboard with initial widget state', () => {
    // Verify dashboard header
    cy.get('[data-testid="dashboard-header"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="dashboard-title"]', { timeout: 10000 }).should('contain', 'Dashboard');

    // Verify widget grid is visible
    cy.get('[data-testid="widget-grid"]', { timeout: 10000 }).should('be.visible');

    // Verify initial widget state
    cy.get('[data-testid="widget-card"]', { timeout: 10000 }).should('have.length', mockWidgetPreferences.length);
  });

  it('should toggle widget visibility', () => {
    // Find a widget card
    cy.get('[data-testid="widget-card"]', { timeout: 10000 }).first().as('firstWidget');

    // Toggle widget visibility
    cy.get('@firstWidget').find('[data-testid="widget-toggle"]').click();

    // Verify widget preferences update was called
    cy.wait('@updateWidgetPreferences');

    // Verify widget is hidden
    cy.get('@firstWidget').should('not.be.visible');
  });

  it('should handle widget reordering', () => {
    // Get initial widget order
    cy.get('[data-testid="widget-card"]', { timeout: 10000 }).first().invoke('text').as('firstWidgetText');
    cy.get('[data-testid="widget-card"]', { timeout: 10000 }).last().invoke('text').as('lastWidgetText');

    // Drag first widget to last position using native drag and drop
    cy.get('[data-testid="widget-card"]').first().trigger('dragstart');
    cy.get('[data-testid="widget-grid"]').trigger('dragover');
    cy.get('[data-testid="widget-grid"]').trigger('drop');
    cy.get('[data-testid="widget-card"]').first().trigger('dragend');

    // Verify widget preferences update was called
    cy.wait('@updateWidgetPreferences');

    // Verify new order
    cy.get('[data-testid="widget-card"]').last().should('have.text', '@firstWidgetText');
    cy.get('[data-testid="widget-card"]').first().should('have.text', '@lastWidgetText');
  });

  it('should handle widget settings', () => {
    // Open widget settings
    cy.get('[data-testid="widget-card"]', { timeout: 10000 }).first().find('[data-testid="widget-settings"]').click();

    // Verify settings modal is visible
    cy.get('[data-testid="widget-settings-modal"]', { timeout: 10000 }).should('be.visible');

    // Change widget settings
    cy.get('[data-testid="widget-settings-modal"]')
      .find('input[type="checkbox"]')
      .first()
      .check();

    // Save settings
    cy.get('[data-testid="widget-settings-modal"]')
      .find('button[type="submit"]')
      .click();

    // Verify widget preferences update was called
    cy.wait('@updateWidgetPreferences');

    // Verify settings modal is closed
    cy.get('[data-testid="widget-settings-modal"]').should('not.exist');
  });

  it('should handle widget refresh', () => {
    // Mock widget data refresh
    cy.intercept('GET', '/api/widget-data/*', {
      statusCode: 200,
      body: { data: 'updated data' },
    }).as('refreshWidgetData');

    // Refresh widget
    cy.get('[data-testid="widget-card"]', { timeout: 10000 }).first().find('[data-testid="widget-refresh"]').click();

    // Verify refresh request was made
    cy.wait('@refreshWidgetData');

    // Verify loading state
    cy.get('[data-testid="widget-card"]').first().find('[data-testid="widget-loading"]').should('be.visible');
  });

  it('should handle widget error states', () => {
    // Mock widget data error
    cy.intercept('GET', '/api/widget-data/*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('widgetDataError');

    // Trigger widget refresh
    cy.get('[data-testid="widget-card"]', { timeout: 10000 }).first().find('[data-testid="widget-refresh"]').click();

    // Verify error state
    cy.get('[data-testid="widget-card"]').first().find('[data-testid="widget-error"]').should('be.visible');
    cy.get('[data-testid="widget-card"]').first().find('[data-testid="widget-error-message"]')
      .should('contain', 'Failed to load widget data');
  });

  it('should handle widget preferences update failure', () => {
    // Mock widget preferences update failure
    cy.intercept('PUT', '/api/widget-preferences', {
      statusCode: 500,
      body: { error: 'Failed to update preferences' },
    }).as('updateWidgetPreferencesError');

    // Attempt to toggle widget
    cy.get('[data-testid="widget-card"]', { timeout: 10000 }).first().find('[data-testid="widget-toggle"]').click();

    // Verify error toast is shown
    cy.get('[data-testid="toast-error"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="toast-error"]').should('contain', 'Failed to update widget preferences');
  });
}); 
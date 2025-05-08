describe('Dashboard', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
    cy.visit('/dashboard');
  });

  it('should display the dashboard layout', () => {
    cy.get('[data-testid="dashboard-layout"]').should('be.visible');
    cy.get('[data-testid="add-widget-button"]').should('be.visible');
  });

  it('should handle widget management', () => {
    // Check initial widgets
    cy.checkWidget('network-overview');
    cy.checkWidget('contact-card');

    // Add a new widget
    cy.addWidget('relationship-strength');
    cy.checkWidget('relationship-strength');

    // Remove a widget
    cy.removeWidget('network-overview');
    cy.get('[data-testid="widget-network-overview"]').should('not.exist');

    // Reorder widgets
    cy.reorderWidget('contact-card', 'relationship-strength');
  });

  it('should handle theme switching', () => {
    // Check initial theme
    cy.get('html').should('have.class', 'light');

    // Switch to dark theme
    cy.get('[data-testid="theme-toggle"]').click();
    cy.get('html').should('have.class', 'dark');

    // Switch back to light theme
    cy.get('[data-testid="theme-toggle"]').click();
    cy.get('html').should('have.class', 'light');
  });

  it('should handle loading and error states', () => {
    // Simulate loading state
    cy.intercept('GET', '/api/widgets', {
      delay: 1000,
      fixture: 'widgets.json',
    }).as('getWidgets');

    cy.visit('/dashboard');
    cy.get('[data-testid="loading-skeleton"]').should('be.visible');
    cy.wait('@getWidgets');
    cy.get('[data-testid="loading-skeleton"]').should('not.exist');

    // Simulate error state
    cy.intercept('GET', '/api/widgets', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('getWidgetsError');

    cy.visit('/dashboard');
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should persist widget state after page reload', () => {
    // Add a widget
    cy.addWidget('relationship-strength');
    cy.checkWidget('relationship-strength');

    // Reload the page
    cy.reload();

    // Check if the widget is still there
    cy.checkWidget('relationship-strength');
  });
}); 
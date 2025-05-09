describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', 'mock-token');
    });
  });

  it('loads all widgets correctly', () => {
    cy.get('[data-testid="widget-network-overview"]').should('be.visible');
    cy.get('[data-testid="widget-contact-card"]').should('be.visible');
    cy.get('[data-testid="widget-relationship-strength"]').should('be.visible');
  });

  it('allows widget reordering', () => {
    const networkWidget = cy.get('[data-testid="widget-network-overview"]');
    const contactWidget = cy.get('[data-testid="widget-contact-card"]');

    networkWidget.trigger('dragstart');
    contactWidget.trigger('drop');

    // Verify order changed
    cy.get('[data-testid="widget-grid"]').children().first().should('have.attr', 'data-testid', 'widget-contact-card');
  });

  it('handles widget refresh', () => {
    cy.get('[data-testid="widget-refresh-network-overview"]').click();
    cy.get('[data-testid="widget-network-overview"]').should('be.visible');
  });

  it('manages widget visibility', () => {
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Toggle widget
    cy.get('[data-testid="widget-toggle-network-overview"]').click();
    
    // Verify widget is hidden
    cy.get('[data-testid="widget-network-overview"]').should('not.exist');
  });

  it('handles error states', () => {
    // Simulate error by removing auth token
    cy.window().then((win) => {
      win.localStorage.removeItem('supabase.auth.token');
    });
    
    cy.reload();
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('maintains responsive layout', () => {
    // Test mobile view
    cy.viewport('iphone-6');
    cy.get('[data-testid="widget-grid"]').should('have.css', 'grid-template-columns', '1fr');

    // Test tablet view
    cy.viewport('ipad-2');
    cy.get('[data-testid="widget-grid"]').should('have.css', 'grid-template-columns', 'repeat(2, 1fr)');

    // Test desktop view
    cy.viewport(1280, 720);
    cy.get('[data-testid="widget-grid"]').should('have.css', 'grid-template-columns', 'repeat(3, 1fr)');
  });

  it('handles data loading states', () => {
    // Simulate slow network
    cy.intercept('GET', '**/api/**', (req) => {
      req.on('response', (res) => {
        res.delay = 1000;
      });
    });

    cy.reload();
    
    // Verify loading state
    cy.get('[data-testid="loading-skeleton"]').should('be.visible');
  });
}); 
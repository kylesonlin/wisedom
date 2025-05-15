import { mockUser } from '../support/mocks/user';

describe('Critical User Flows', () => {
  beforeEach(() => {
    // Mock authentication
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: mockUser,
    }).as('getSession');

    // Login before each test
    cy.login('test@example.com', 'testpassword');
  });

  describe('Authentication Flow', () => {
    it('should handle login and logout', () => {
      // Verify successful login
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');

      // Test logout
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('include', '/login');
    });

    it('should handle session expiration', () => {
      // Mock an expired session
      cy.intercept('GET', '/auth/v1/session', {
        statusCode: 401,
        body: { error: 'Session expired' }
      }).as('expiredSession');

      // Clear the Supabase cookies
      cy.clearCookie('sb-access-token');
      cy.clearCookie('sb-refresh-token');

      // Visit a protected page
      cy.visit('/new-dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Dashboard Flow', () => {
    it('should display the dashboard layout', () => {
      // Verify the main layout components
      cy.get('header').should('be.visible');
      cy.get('nav').should('be.visible');
      cy.get('main').should('be.visible');
      
      // Verify the dashboard title
      cy.get('h1').contains('Dashboard').should('be.visible');
    });

    it('should handle widget management', () => {
      // Add a widget
      cy.addWidget('contacts');
      cy.get('[data-testid="widget-contacts"]').should('be.visible');

      // Remove a widget
      cy.removeWidget('contacts');
      cy.get('[data-testid="widget-contacts"]').should('not.exist');
    });
  });

  describe('Data Management Flow', () => {
    it('should handle contact creation and editing', () => {
      // Navigate to contacts
      cy.visit('/contacts');
      
      // Create new contact
      cy.get('[data-testid="add-contact-button"]').click();
      cy.get('[data-testid="contact-form"]').within(() => {
        cy.get('input[name="name"]').type('Test Contact');
        cy.get('input[name="email"]').type('test@example.com');
        cy.get('button[type="submit"]').click();
      });

      // Verify contact was created
      cy.get('[data-testid="contact-list"]').should('contain', 'Test Contact');

      // Edit contact
      cy.get('[data-testid="contact-list"]')
        .contains('Test Contact')
        .parent()
        .find('[data-testid="edit-contact"]')
        .click();

      cy.get('[data-testid="contact-form"]').within(() => {
        cy.get('input[name="name"]').clear().type('Updated Contact');
        cy.get('button[type="submit"]').click();
      });

      // Verify contact was updated
      cy.get('[data-testid="contact-list"]').should('contain', 'Updated Contact');
    });

    it('should handle data import/export', () => {
      // Navigate to contacts
      cy.visit('/contacts');

      // Test export
      cy.get('[data-testid="export-contacts"]').click();
      cy.get('[data-testid="export-success"]').should('be.visible');

      // Test import
      cy.get('[data-testid="import-contacts"]').click();
      cy.get('input[type="file"]').attachFile('contacts.csv');
      cy.get('[data-testid="import-success"]').should('be.visible');
    });

    it('should handle contact import', () => {
      // Visit the import page
      cy.visit('/import');

      // Upload a CSV file
      cy.get('input[type="file"]').attachFile('contacts.csv');

      // Verify the import success message
      cy.get('[data-testid="import-success"]').should('be.visible');
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('GET', '/api/contacts', {
        statusCode: 500,
        body: { error: 'Network error' },
      }).as('networkError');

      // Visit contacts page
      cy.visit('/contacts');

      // Verify error state
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');

      // Test retry functionality
      cy.intercept('GET', '/api/contacts', {
        statusCode: 200,
        body: { contacts: [] },
      }).as('retrySuccess');

      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@retrySuccess');
      cy.get('[data-testid="error-message"]').should('not.exist');
    });

    it('should handle validation errors', () => {
      // Navigate to contacts
      cy.visit('/contacts');
      
      // Try to create invalid contact
      cy.get('[data-testid="add-contact-button"]').click();
      cy.get('[data-testid="contact-form"]').within(() => {
        cy.get('input[name="email"]').type('invalid-email');
        cy.get('button[type="submit"]').click();
      });

      // Verify validation error
      cy.get('[data-testid="validation-error"]').should('be.visible');
    });
  });

  describe('Performance Flow', () => {
    it('should handle large data sets', () => {
      // Mock large dataset
      cy.intercept('GET', '/api/contacts', {
        statusCode: 200,
        body: {
          contacts: Array(1000).fill(null).map((_, i) => ({
            id: i,
            name: `Contact ${i}`,
            email: `contact${i}@example.com`,
          })),
        },
      }).as('largeDataset');

      // Visit contacts page
      cy.visit('/contacts');

      // Verify loading state
      cy.get('[data-testid="loading-skeleton"]').should('be.visible');

      // Wait for data to load
      cy.wait('@largeDataset');

      // Verify data is displayed
      cy.get('[data-testid="contact-list"]').should('be.visible');
      cy.get('[data-testid="pagination"]').should('be.visible');
    });

    it('should handle concurrent operations', () => {
      // Navigate to dashboard
      cy.visit('/dashboard');

      // Perform multiple operations simultaneously
      cy.get('[data-testid="widget-card"]').first().as('firstWidget');
      cy.get('[data-testid="widget-card"]').last().as('lastWidget');

      // Toggle first widget
      cy.get('@firstWidget').find('[data-testid="widget-toggle"]').click();

      // Reorder widgets
      cy.get('@firstWidget').trigger('dragstart');
      cy.get('@lastWidget').trigger('drop');

      // Verify both operations completed
      cy.get('@firstWidget').should('not.be.visible');
      cy.get('@lastWidget').should('be.visible');
    });
  });
}); 
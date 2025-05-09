describe('Error Handling', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
  });

  it('handles network errors gracefully', () => {
    cy.visit('/dashboard');
    
    // Simulate network error
    cy.intercept('GET', '/api/data', {
      forceNetworkError: true
    });
    
    // Verify error boundary
    cy.get('[data-testid="error-boundary"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Network error');
  });

  it('handles API errors gracefully', () => {
    cy.visit('/contacts');
    
    // Simulate API error
    cy.intercept('GET', '/api/contacts', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    });
    
    // Verify error handling
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="retry-button"]').should('be.visible');
  });

  it('handles form validation errors', () => {
    cy.visit('/contacts');
    
    // Submit empty form
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Verify validation errors
    cy.get('[data-testid="validation-error"]').should('be.visible');
    cy.get('[data-testid="name-error"]').should('contain', 'Required');
  });

  it('handles authentication errors', () => {
    cy.visit('/dashboard');
    
    // Simulate token expiration
    cy.window().then((win) => {
      win.localStorage.removeItem('auth_token');
    });
    
    // Verify redirect to login
    cy.url().should('include', '/auth/signin');
    cy.get('[data-testid="error-message"]').should('contain', 'Session expired');
  });

  it('handles file upload errors', () => {
    cy.visit('/contacts');
    
    // Try to upload invalid file
    cy.get('[data-testid="import-contacts-button"]').click();
    cy.get('[data-testid="file-upload-input"]').attachFile('invalid.txt');
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid file format');
  });

  it('handles concurrent modification errors', () => {
    cy.visit('/contacts');
    
    // Simulate concurrent modification
    cy.intercept('PUT', '/api/contacts/*', {
      statusCode: 409,
      body: { error: 'Conflict' }
    });
    
    // Try to update contact
    cy.get('[data-testid="edit-contact-button"]').first().click();
    cy.get('[data-testid="contact-name-input"]').clear().type('Updated Name');
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Verify error handling
    cy.get('[data-testid="error-message"]').should('contain', 'Conflict');
    cy.get('[data-testid="resolve-conflict-button"]').should('be.visible');
  });

  it('handles permission errors', () => {
    cy.visit('/settings');
    
    // Simulate permission error
    cy.intercept('GET', '/api/settings', {
      statusCode: 403,
      body: { error: 'Forbidden' }
    });
    
    // Verify error handling
    cy.get('[data-testid="error-message"]').should('contain', 'Access denied');
  });

  it('handles resource not found errors', () => {
    cy.visit('/contacts/invalid-id');
    
    // Verify 404 handling
    cy.get('[data-testid="error-message"]').should('contain', 'Not found');
    cy.get('[data-testid="back-button"]').should('be.visible');
  });

  it('handles validation errors with multiple fields', () => {
    cy.visit('/contacts');
    
    // Submit form with multiple errors
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="contact-email-input"]').type('invalid-email');
    cy.get('[data-testid="contact-phone-input"]').type('invalid-phone');
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Verify multiple error messages
    cy.get('[data-testid="email-error"]').should('contain', 'Invalid email');
    cy.get('[data-testid="phone-error"]').should('contain', 'Invalid phone');
  });

  it('handles error recovery', () => {
    cy.visit('/dashboard');
    
    // Simulate error
    cy.intercept('GET', '/api/data', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    });
    
    // Verify error state
    cy.get('[data-testid="error-message"]').should('be.visible');
    
    // Simulate recovery
    cy.intercept('GET', '/api/data', {
      statusCode: 200,
      body: { data: 'success' }
    });
    
    // Retry
    cy.get('[data-testid="retry-button"]').click();
    
    // Verify recovery
    cy.get('[data-testid="error-message"]').should('not.exist');
  });

  it('handles error boundaries at component level', () => {
    cy.visit('/dashboard');
    
    // Simulate component error
    cy.window().then((win) => {
      win.dispatchEvent(new ErrorEvent('error', {
        error: new Error('Component error')
      }));
    });
    
    // Verify component error boundary
    cy.get('[data-testid="component-error-boundary"]').should('be.visible');
    cy.get('[data-testid="component-error-message"]').should('contain', 'Something went wrong');
  });
}); 
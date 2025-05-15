describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('allows user to sign in', () => {
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('handles invalid credentials', () => {
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.url().should('include', '/auth/signin');
  });

  it('allows user to sign out', () => {
    // First sign in
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // Then sign out
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="sign-out-button"]').click();
    
    // Verify signed out
    cy.url().should('include', '/');
    cy.get('[data-testid="sign-in-button"]').should('be.visible');
  });

  it('persists authentication state after page reload', () => {
    // Sign in
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // Reload page
    cy.reload();
    
    // Verify still signed in
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('redirects to dashboard when accessing protected routes while authenticated', () => {
    // Sign in
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // Try to access sign in page
    cy.visit('/auth/signin');
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('redirects to sign in when accessing protected routes while unauthenticated', () => {
    // Try to access dashboard directly
    cy.visit('/dashboard');
    
    // Should be redirected to sign in
    cy.url().should('include', '/auth/signin');
  });
}); 
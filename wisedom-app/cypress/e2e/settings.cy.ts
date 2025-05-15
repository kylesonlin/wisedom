describe('Settings', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // Navigate to settings page
    cy.visit('/settings');
  });

  it('displays user profile settings', () => {
    cy.get('[data-testid="profile-settings"]').should('be.visible');
    cy.get('[data-testid="user-name"]').should('be.visible');
    cy.get('[data-testid="user-email"]').should('be.visible');
  });

  it('allows updating user profile', () => {
    // Update name
    cy.get('[data-testid="edit-name-button"]').click();
    cy.get('[data-testid="name-input"]').clear().type('Updated Name');
    cy.get('[data-testid="save-name-button"]').click();
    
    // Verify update
    cy.get('[data-testid="user-name"]').should('contain', 'Updated Name');
  });

  it('allows changing password', () => {
    cy.get('[data-testid="change-password-button"]').click();
    
    // Fill in password form
    cy.get('[data-testid="current-password"]').type('password123');
    cy.get('[data-testid="new-password"]').type('newpassword123');
    cy.get('[data-testid="confirm-password"]').type('newpassword123');
    
    // Submit form
    cy.get('[data-testid="submit-password-button"]').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('displays notification preferences', () => {
    cy.get('[data-testid="notification-settings"]').should('be.visible');
    cy.get('[data-testid="email-notifications"]').should('be.visible');
    cy.get('[data-testid="push-notifications"]').should('be.visible');
  });

  it('allows updating notification preferences', () => {
    // Toggle email notifications
    cy.get('[data-testid="email-notifications-toggle"]').click();
    
    // Toggle push notifications
    cy.get('[data-testid="push-notifications-toggle"]').click();
    
    // Save changes
    cy.get('[data-testid="save-notification-settings"]').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('displays privacy settings', () => {
    cy.get('[data-testid="privacy-settings"]').should('be.visible');
    cy.get('[data-testid="data-sharing"]').should('be.visible');
    cy.get('[data-testid="visibility-settings"]').should('be.visible');
  });

  it('allows updating privacy settings', () => {
    // Update data sharing preferences
    cy.get('[data-testid="data-sharing-toggle"]').click();
    
    // Update visibility settings
    cy.get('[data-testid="profile-visibility"]').select('Private');
    
    // Save changes
    cy.get('[data-testid="save-privacy-settings"]').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('displays integration settings', () => {
    cy.get('[data-testid="integration-settings"]').should('be.visible');
    cy.get('[data-testid="calendar-integration"]').should('be.visible');
    cy.get('[data-testid="email-integration"]').should('be.visible');
  });

  it('allows managing integrations', () => {
    // Connect calendar
    cy.get('[data-testid="connect-calendar"]').click();
    cy.get('[data-testid="calendar-authorize"]').click();
    
    // Verify connection
    cy.get('[data-testid="calendar-status"]').should('contain', 'Connected');
  });

  it('displays export options', () => {
    cy.get('[data-testid="export-settings"]').should('be.visible');
    cy.get('[data-testid="export-data"]').should('be.visible');
    cy.get('[data-testid="export-format"]').should('be.visible');
  });

  it('allows exporting user data', () => {
    // Select export format
    cy.get('[data-testid="export-format"]').select('JSON');
    
    // Request export
    cy.get('[data-testid="request-export"]').click();
    
    // Verify download
    cy.readFile('cypress/downloads/user-data.json').should('exist');
  });

  it('displays account deletion options', () => {
    cy.get('[data-testid="account-deletion"]').should('be.visible');
    cy.get('[data-testid="delete-account-button"]').should('be.visible');
  });

  it('handles account deletion process', () => {
    // Click delete account
    cy.get('[data-testid="delete-account-button"]').click();
    
    // Confirm deletion
    cy.get('[data-testid="confirm-deletion"]').type('DELETE');
    cy.get('[data-testid="submit-deletion"]').click();
    
    // Verify redirect to home page
    cy.url().should('include', '/');
  });
}); 
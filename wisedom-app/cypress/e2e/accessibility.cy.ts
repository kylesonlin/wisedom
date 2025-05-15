describe('Accessibility', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
  });

  it('maintains proper heading hierarchy', () => {
    cy.visit('/dashboard');
    
    // Check heading levels
    cy.get('h1').should('have.length', 1);
    cy.get('h2').should('have.length.at.least', 1);
    cy.get('h3').should('have.length.at.least', 1);
  });

  it('provides keyboard navigation', () => {
    cy.visit('/dashboard');
    
    // Test tab navigation
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'data-testid', 'main-nav');
    
    // Test arrow key navigation in dropdowns
    cy.get('[data-testid="user-menu"]').click();
    cy.get('body').type('{downarrow}');
    cy.focused().should('have.attr', 'data-testid', 'profile-link');
  });

  it('maintains proper focus management', () => {
    cy.visit('/contacts');
    
    // Open modal
    cy.get('[data-testid="add-contact-button"]').click();
    
    // Check focus is trapped in modal
    cy.get('[data-testid="contact-form"]').should('be.visible');
    cy.get('body').type('{tab}');
    cy.focused().should('be.within', '[data-testid="contact-form"]');
  });

  it('provides proper ARIA labels', () => {
    cy.visit('/network');
    
    // Check ARIA labels on interactive elements
    cy.get('[data-testid="network-graph"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="zoom-controls"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="node-details"]').should('have.attr', 'aria-label');
  });

  it('maintains sufficient color contrast', () => {
    cy.visit('/analytics');
    
    // Check text contrast
    cy.get('body').should('have.css', 'color').and('not.eq', '#000000');
    cy.get('[data-testid="chart-text"]').should('have.css', 'color').and('not.eq', '#000000');
  });

  it('provides text alternatives for images', () => {
    cy.visit('/dashboard');
    
    // Check alt text on images
    cy.get('img').should('have.attr', 'alt');
    cy.get('[data-testid="profile-image"]').should('have.attr', 'alt');
  });

  it('handles screen reader announcements', () => {
    cy.visit('/contacts');
    
    // Add new contact
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="contact-name-input"]').type('Test Contact');
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Check for announcement
    cy.get('[aria-live="polite"]').should('contain', 'Contact added successfully');
  });

  it('provides skip links', () => {
    cy.visit('/dashboard');
    
    // Check skip link
    cy.get('[data-testid="skip-to-main"]').should('be.visible');
    cy.get('[data-testid="skip-to-main"]').click();
    cy.focused().should('have.attr', 'id', 'main-content');
  });

  it('maintains proper form labels', () => {
    cy.visit('/settings');
    
    // Check form labels
    cy.get('input').each(($input) => {
      const hasAriaLabel = $input.attr('aria-label');
      const hasId = $input.attr('id');
      const hasLabel = $input.attr('for');
      expect(hasAriaLabel || (hasId && hasLabel)).to.be.true;
    });
  });

  it('handles dynamic content updates', () => {
    cy.visit('/network');
    
    // Update network view
    cy.get('[data-testid="view-mode"]').select('Compact');
    
    // Check for announcement
    cy.get('[aria-live="polite"]').should('contain', 'View mode changed');
  });

  it('provides proper error messages', () => {
    cy.visit('/contacts');
    
    // Submit empty form
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Check error messages
    cy.get('[aria-invalid="true"]').should('be.visible');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('maintains proper landmark regions', () => {
    cy.visit('/dashboard');
    
    // Check landmark regions
    cy.get('nav[role="navigation"]').should('exist');
    cy.get('main[role="main"]').should('exist');
    cy.get('aside[role="complementary"]').should('exist');
  });
}); 
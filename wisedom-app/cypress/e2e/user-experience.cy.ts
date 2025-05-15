describe('User Experience', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
  });

  it('implements responsive design', () => {
    cy.visit('/dashboard');
    
    // Test desktop view
    cy.viewport(1280, 720);
    cy.get('[data-testid="sidebar"]').should('be.visible');
    cy.get('[data-testid="widget-grid"]').should('have.css', 'grid-template-columns', 'repeat(3, 1fr)');
    
    // Test tablet view
    cy.viewport(768, 1024);
    cy.get('[data-testid="sidebar"]').should('be.visible');
    cy.get('[data-testid="widget-grid"]').should('have.css', 'grid-template-columns', 'repeat(2, 1fr)');
    
    // Test mobile view
    cy.viewport(375, 667);
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    cy.get('[data-testid="widget-grid"]').should('have.css', 'grid-template-columns', '1fr');
  });

  it('implements theme switching', () => {
    cy.visit('/dashboard');
    
    // Test light theme
    cy.get('html').should('have.class', 'light');
    cy.get('[data-testid="theme-toggle"]').click();
    
    // Test dark theme
    cy.get('html').should('have.class', 'dark');
    cy.get('[data-testid="theme-toggle"]').click();
    
    // Verify theme persistence
    cy.reload();
    cy.get('html').should('have.class', 'light');
  });

  it('implements loading states', () => {
    cy.visit('/contacts');
    
    // Test loading state
    cy.intercept('GET', '/api/contacts', (req) => {
      req.on('response', (res) => {
        res.delay = 1000;
      });
    });
    
    cy.get('[data-testid="loading-skeleton"]').should('be.visible');
    cy.get('[data-testid="contact-list"]').should('be.visible');
  });

  it('implements animations', () => {
    cy.visit('/dashboard');
    
    // Test modal animation
    cy.get('[data-testid="add-widget-button"]').click();
    cy.get('[data-testid="modal"]').should('have.class', 'animate-in');
    
    // Test list item animation
    cy.get('[data-testid="widget-list"] > li').should('have.class', 'animate-fade-in');
  });

  it('implements tooltips', () => {
    cy.visit('/network');
    
    // Test tooltip visibility
    cy.get('[data-testid="node"]').first().trigger('mouseover');
    cy.get('[data-testid="tooltip"]').should('be.visible');
    cy.get('[data-testid="node"]').first().trigger('mouseout');
    cy.get('[data-testid="tooltip"]').should('not.be.visible');
  });

  it('implements form validation feedback', () => {
    cy.visit('/contacts');
    
    // Test inline validation
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="email-error"]').should('be.visible');
    
    // Test success state
    cy.get('[data-testid="email-input"]').clear().type('valid@email.com');
    cy.get('[data-testid="email-success"]').should('be.visible');
  });

  it('implements keyboard navigation', () => {
    cy.visit('/dashboard');
    
    // Test tab navigation
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'data-testid', 'main-nav');
    
    // Test keyboard shortcuts
    cy.get('body').type('{cmd+k}');
    cy.get('[data-testid="command-palette"]').should('be.visible');
  });

  it('implements search suggestions', () => {
    cy.visit('/contacts');
    
    // Test search autocomplete
    cy.get('[data-testid="search-input"]').type('jo');
    cy.get('[data-testid="search-suggestions"]').should('be.visible');
    cy.get('[data-testid="suggestion-item"]').should('have.length.at.least', 1);
  });

  it('implements infinite scroll', () => {
    cy.visit('/contacts');
    
    // Test infinite loading
    cy.get('[data-testid="contact-list"]').scrollTo('bottom');
    cy.get('[data-testid="loading-more"]').should('be.visible');
    cy.get('[data-testid="contact-item"]').should('have.length.at.least', 20);
  });

  it('implements drag and drop', () => {
    cy.visit('/dashboard');
    
    // Test widget reordering
    cy.get('[data-testid="widget"]').first().trigger('dragstart');
    cy.get('[data-testid="widget"]').last().trigger('drop');
    
    // Verify new order
    cy.get('[data-testid="widget-grid"]').children().first()
      .should('have.attr', 'data-widget-id')
      .and('not.equal', 'widget-1');
  });

  it('implements notifications', () => {
    cy.visit('/dashboard');
    
    // Test notification display
    cy.get('[data-testid="notification-trigger"]').click();
    cy.get('[data-testid="notification-toast"]').should('be.visible');
    
    // Test notification dismissal
    cy.get('[data-testid="notification-close"]').click();
    cy.get('[data-testid="notification-toast"]').should('not.exist');
  });

  it('implements progress indicators', () => {
    cy.visit('/settings');
    
    // Test upload progress
    cy.get('[data-testid="import-button"]').click();
    cy.get('[data-testid="file-input"]').attachFile('large-file.csv');
    cy.get('[data-testid="upload-progress"]').should('be.visible');
    cy.get('[data-testid="progress-bar"]').should('have.attr', 'value').and('be.gt', 0);
  });
}); 
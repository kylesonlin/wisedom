describe('Data Management', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
  });

  it('implements data persistence', () => {
    cy.visit('/contacts');
    
    // Create new contact
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="contact-name-input"]').type('Test Contact');
    cy.get('[data-testid="contact-email-input"]').type('test@example.com');
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Reload page
    cy.reload();
    
    // Verify contact persists
    cy.get('[data-testid="contact-card"]').contains('Test Contact').should('be.visible');
  });

  it('implements data synchronization', () => {
    cy.visit('/contacts');
    
    // Simulate offline mode
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new Event('offline'));
    });
    
    // Create contact offline
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="contact-name-input"]').type('Offline Contact');
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Verify offline indicator
    cy.get('[data-testid="offline-indicator"]').should('be.visible');
    
    // Simulate online mode
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(true);
      win.dispatchEvent(new Event('online'));
    });
    
    // Verify sync
    cy.get('[data-testid="sync-indicator"]').should('contain', 'Synced');
  });

  it('implements data backup', () => {
    cy.visit('/settings');
    
    // Trigger backup
    cy.get('[data-testid="backup-button"]').click();
    
    // Verify backup created
    cy.get('[data-testid="backup-success"]').should('be.visible');
    cy.get('[data-testid="backup-list"]').should('contain', new Date().toLocaleDateString());
  });

  it('implements data restore', () => {
    cy.visit('/settings');
    
    // Select backup
    cy.get('[data-testid="backup-list"]').first().click();
    cy.get('[data-testid="restore-button"]').click();
    
    // Confirm restore
    cy.get('[data-testid="confirm-restore"]').click();
    
    // Verify restore success
    cy.get('[data-testid="restore-success"]').should('be.visible');
  });

  it('implements data versioning', () => {
    cy.visit('/contacts');
    
    // Edit contact
    cy.get('[data-testid="edit-contact-button"]').first().click();
    cy.get('[data-testid="contact-name-input"]').clear().type('Updated Name');
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // View history
    cy.get('[data-testid="view-history-button"]').click();
    
    // Verify versions
    cy.get('[data-testid="version-list"]').should('have.length.at.least', 2);
  });

  it('implements data export', () => {
    cy.visit('/settings');
    
    // Select export format
    cy.get('[data-testid="export-format"]').select('CSV');
    
    // Trigger export
    cy.get('[data-testid="export-button"]').click();
    
    // Verify download
    cy.readFile('cypress/downloads/contacts.csv').should('exist');
  });

  it('implements data import', () => {
    cy.visit('/settings');
    
    // Upload import file
    cy.get('[data-testid="import-button"]').click();
    cy.get('[data-testid="file-upload"]').attachFile('contacts.csv');
    
    // Verify import success
    cy.get('[data-testid="import-success"]').should('be.visible');
    cy.get('[data-testid="imported-count"]').should('contain', '3');
  });

  it('implements data validation', () => {
    cy.visit('/settings');
    
    // Upload invalid file
    cy.get('[data-testid="import-button"]').click();
    cy.get('[data-testid="file-upload"]').attachFile('invalid.csv');
    
    // Verify validation errors
    cy.get('[data-testid="validation-errors"]').should('be.visible');
    cy.get('[data-testid="error-list"]').should('contain', 'Invalid email format');
  });

  it('implements data cleanup', () => {
    cy.visit('/settings');
    
    // Select cleanup options
    cy.get('[data-testid="cleanup-duplicates"]').check();
    cy.get('[data-testid="cleanup-inactive"]').check();
    
    // Run cleanup
    cy.get('[data-testid="run-cleanup"]').click();
    
    // Verify cleanup results
    cy.get('[data-testid="cleanup-results"]').should('be.visible');
    cy.get('[data-testid="removed-count"]').should('contain', '2');
  });

  it('implements data search', () => {
    cy.visit('/contacts');
    
    // Perform search
    cy.get('[data-testid="search-input"]').type('test');
    
    // Verify search results
    cy.get('[data-testid="search-results"]').should('be.visible');
    cy.get('[data-testid="result-count"]').should('contain', '1');
  });

  it('implements data filtering', () => {
    cy.visit('/contacts');
    
    // Apply filters
    cy.get('[data-testid="filter-button"]').click();
    cy.get('[data-testid="category-filter"]').select('Client');
    cy.get('[data-testid="status-filter"]').select('Active');
    
    // Verify filtered results
    cy.get('[data-testid="contact-list"]').should('contain', 'Client');
  });

  it('implements data sorting', () => {
    cy.visit('/contacts');
    
    // Sort by name
    cy.get('[data-testid="sort-by-name"]').click();
    
    // Verify sort order
    cy.get('[data-testid="contact-list"]').should('be.sorted');
  });
}); 
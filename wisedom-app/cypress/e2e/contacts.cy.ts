describe('Contact Management', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // Navigate to contacts page
    cy.visit('/contacts');
  });

  it('displays the contacts list', () => {
    cy.get('[data-testid="contacts-list"]').should('be.visible');
    cy.get('[data-testid="contact-card"]').should('have.length.at.least', 1);
  });

  it('allows creating a new contact', () => {
    cy.get('[data-testid="add-contact-button"]').click();
    
    // Fill in contact form
    cy.get('[data-testid="contact-name-input"]').type('John Doe');
    cy.get('[data-testid="contact-email-input"]').type('john@example.com');
    cy.get('[data-testid="contact-phone-input"]').type('1234567890');
    cy.get('[data-testid="contact-company-input"]').type('Acme Inc');
    cy.get('[data-testid="contact-notes-input"]').type('Test contact');
    
    // Submit form
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Verify new contact appears in list
    cy.get('[data-testid="contact-card"]').contains('John Doe').should('be.visible');
  });

  it('allows editing an existing contact', () => {
    // Click edit on first contact
    cy.get('[data-testid="contact-card"]').first().find('[data-testid="edit-contact-button"]').click();
    
    // Update contact information
    cy.get('[data-testid="contact-name-input"]').clear().type('Updated Name');
    cy.get('[data-testid="contact-notes-input"]').clear().type('Updated notes');
    
    // Save changes
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Verify changes are reflected
    cy.get('[data-testid="contact-card"]').contains('Updated Name').should('be.visible');
  });

  it('allows deleting a contact', () => {
    // Get initial count
    cy.get('[data-testid="contact-card"]').then(($cards) => {
      const initialCount = $cards.length;
      
      // Delete first contact
      cy.get('[data-testid="contact-card"]').first().find('[data-testid="delete-contact-button"]').click();
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      // Verify count decreased
      cy.get('[data-testid="contact-card"]').should('have.length', initialCount - 1);
    });
  });

  it('allows searching contacts', () => {
    // Create a test contact first
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="contact-name-input"]').type('Search Test Contact');
    cy.get('[data-testid="contact-email-input"]').type('search@example.com');
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Search for the contact
    cy.get('[data-testid="search-input"]').type('Search Test');
    
    // Verify search results
    cy.get('[data-testid="contact-card"]').should('have.length', 1);
    cy.get('[data-testid="contact-card"]').contains('Search Test Contact').should('be.visible');
  });

  it('allows filtering contacts by category', () => {
    // Create a test contact with category
    cy.get('[data-testid="add-contact-button"]').click();
    cy.get('[data-testid="contact-name-input"]').type('Category Test Contact');
    cy.get('[data-testid="contact-category-select"]').select('Client');
    cy.get('[data-testid="submit-contact-button"]').click();
    
    // Filter by category
    cy.get('[data-testid="category-filter"]').select('Client');
    
    // Verify filtered results
    cy.get('[data-testid="contact-card"]').contains('Category Test Contact').should('be.visible');
  });

  it('handles contact import from CSV', () => {
    // Click import button
    cy.get('[data-testid="import-contacts-button"]').click();
    
    // Upload CSV file
    cy.get('[data-testid="file-upload-input"]').attachFile('contacts.csv');
    
    // Confirm import
    cy.get('[data-testid="confirm-import-button"]').click();
    
    // Verify imported contacts
    cy.get('[data-testid="contact-card"]').should('have.length.at.least', 3);
  });

  it('handles contact export to CSV', () => {
    // Click export button
    cy.get('[data-testid="export-contacts-button"]').click();
    
    // Verify download started
    cy.readFile('cypress/downloads/contacts.csv').should('exist');
  });
}); 
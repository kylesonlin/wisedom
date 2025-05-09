describe('Network Visualization', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // Navigate to network page
    cy.visit('/network');
  });

  it('displays the network graph', () => {
    cy.get('[data-testid="network-graph"]').should('be.visible');
    cy.get('[data-testid="network-node"]').should('have.length.at.least', 1);
  });

  it('allows zooming and panning', () => {
    // Test zoom in
    cy.get('[data-testid="network-graph"]').trigger('wheel', { deltaY: -100 });
    cy.get('[data-testid="network-graph"]').should('have.attr', 'data-zoom-level', '1.2');
    
    // Test zoom out
    cy.get('[data-testid="network-graph"]').trigger('wheel', { deltaY: 100 });
    cy.get('[data-testid="network-graph"]').should('have.attr', 'data-zoom-level', '1');
    
    // Test panning
    cy.get('[data-testid="network-graph"]')
      .trigger('mousedown', { clientX: 100, clientY: 100 })
      .trigger('mousemove', { clientX: 200, clientY: 200 })
      .trigger('mouseup');
  });

  it('displays node details on click', () => {
    // Click on a node
    cy.get('[data-testid="network-node"]').first().click();
    
    // Verify details panel
    cy.get('[data-testid="node-details-panel"]').should('be.visible');
    cy.get('[data-testid="node-name"]').should('be.visible');
    cy.get('[data-testid="node-connections"]').should('be.visible');
  });

  it('allows filtering nodes by type', () => {
    // Select filter
    cy.get('[data-testid="node-type-filter"]').select('Client');
    
    // Verify filtered nodes
    cy.get('[data-testid="network-node"]').should('have.attr', 'data-type', 'Client');
  });

  it('allows searching for nodes', () => {
    // Enter search term
    cy.get('[data-testid="node-search-input"]').type('John');
    
    // Verify search results
    cy.get('[data-testid="network-node"]').should('contain', 'John');
  });

  it('displays connection strength', () => {
    // Hover over a connection
    cy.get('[data-testid="network-edge"]').first().trigger('mouseover');
    
    // Verify tooltip
    cy.get('[data-testid="connection-strength-tooltip"]').should('be.visible');
  });

  it('allows adding new connections', () => {
    // Click add connection button
    cy.get('[data-testid="add-connection-button"]').click();
    
    // Select nodes to connect
    cy.get('[data-testid="node-selector"]').first().click();
    cy.get('[data-testid="node-selector"]').last().click();
    
    // Set connection type
    cy.get('[data-testid="connection-type-select"]').select('Business');
    
    // Save connection
    cy.get('[data-testid="save-connection-button"]').click();
    
    // Verify new connection
    cy.get('[data-testid="network-edge"]').should('have.length.at.least', 1);
  });

  it('allows removing connections', () => {
    // Get initial count
    cy.get('[data-testid="network-edge"]').then(($edges) => {
      const initialCount = $edges.length;
      
      // Remove first connection
      cy.get('[data-testid="network-edge"]').first().rightclick();
      cy.get('[data-testid="remove-connection-button"]').click();
      
      // Verify count decreased
      cy.get('[data-testid="network-edge"]').should('have.length', initialCount - 1);
    });
  });

  it('exports network data', () => {
    // Click export button
    cy.get('[data-testid="export-network-button"]').click();
    
    // Verify download started
    cy.readFile('cypress/downloads/network.json').should('exist');
  });
}); 
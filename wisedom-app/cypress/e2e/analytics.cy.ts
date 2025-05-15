describe('Analytics', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // Navigate to analytics page
    cy.visit('/analytics');
  });

  it('displays key metrics', () => {
    cy.get('[data-testid="total-contacts"]').should('be.visible');
    cy.get('[data-testid="active-connections"]').should('be.visible');
    cy.get('[data-testid="network-growth"]').should('be.visible');
  });

  it('displays contact growth chart', () => {
    cy.get('[data-testid="contact-growth-chart"]').should('be.visible');
    cy.get('[data-testid="chart-legend"]').should('be.visible');
  });

  it('allows changing chart time range', () => {
    // Select different time ranges
    cy.get('[data-testid="time-range-selector"]').select('Last 30 Days');
    cy.get('[data-testid="contact-growth-chart"]').should('be.visible');
    
    cy.get('[data-testid="time-range-selector"]').select('Last 6 Months');
    cy.get('[data-testid="contact-growth-chart"]').should('be.visible');
    
    cy.get('[data-testid="time-range-selector"]').select('Last Year');
    cy.get('[data-testid="contact-growth-chart"]').should('be.visible');
  });

  it('displays connection strength distribution', () => {
    cy.get('[data-testid="connection-strength-chart"]').should('be.visible');
    cy.get('[data-testid="strength-legend"]').should('be.visible');
  });

  it('displays contact categories breakdown', () => {
    cy.get('[data-testid="category-breakdown-chart"]').should('be.visible');
    cy.get('[data-testid="category-legend"]').should('be.visible');
  });

  it('allows exporting analytics data', () => {
    // Export as CSV
    cy.get('[data-testid="export-csv-button"]').click();
    cy.readFile('cypress/downloads/analytics.csv').should('exist');
    
    // Export as PDF
    cy.get('[data-testid="export-pdf-button"]').click();
    cy.readFile('cypress/downloads/analytics.pdf').should('exist');
  });

  it('displays network health score', () => {
    cy.get('[data-testid="network-health-score"]').should('be.visible');
    cy.get('[data-testid="health-indicators"]').should('be.visible');
  });

  it('shows connection activity timeline', () => {
    cy.get('[data-testid="activity-timeline"]').should('be.visible');
    cy.get('[data-testid="timeline-events"]').should('have.length.at.least', 1);
  });

  it('allows filtering analytics by date range', () => {
    // Open date picker
    cy.get('[data-testid="date-range-picker"]').click();
    
    // Select custom range
    cy.get('[data-testid="start-date"]').type('2024-01-01');
    cy.get('[data-testid="end-date"]').type('2024-03-31');
    cy.get('[data-testid="apply-date-range"]').click();
    
    // Verify charts updated
    cy.get('[data-testid="contact-growth-chart"]').should('be.visible');
  });

  it('displays top connections', () => {
    cy.get('[data-testid="top-connections"]').should('be.visible');
    cy.get('[data-testid="connection-card"]').should('have.length.at.least', 1);
  });

  it('shows connection recommendations', () => {
    cy.get('[data-testid="connection-recommendations"]').should('be.visible');
    cy.get('[data-testid="recommendation-card"]').should('have.length.at.least', 1);
  });
}); 
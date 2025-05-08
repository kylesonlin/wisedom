// Custom command to login with Supabase
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command to check if a widget is visible
Cypress.Commands.add('checkWidget', (widgetId: string) => {
  cy.get(`[data-testid="widget-${widgetId}"]`).should('be.visible');
});

// Custom command to add a widget
Cypress.Commands.add('addWidget', (widgetId: string) => {
  cy.get('[data-testid="add-widget-button"]').click();
  cy.get(`[data-testid="widget-button-${widgetId}"]`).click();
});

// Custom command to remove a widget
Cypress.Commands.add('removeWidget', (widgetId: string) => {
  cy.get(`[data-testid="widget-${widgetId}"]`)
    .find(`[data-testid="remove-widget-${widgetId}"]`)
    .click();
});

// Custom command to reorder widgets
Cypress.Commands.add('reorderWidget', (fromId: string, toId: string) => {
  cy.get(`[data-testid="widget-${fromId}"]`).trigger('dragstart');
  cy.get(`[data-testid="widget-${toId}"]`).trigger('dragover');
  cy.get(`[data-testid="widget-${toId}"]`).trigger('drop');
});

// Custom command to mock user authentication
Cypress.Commands.add('mockAuth', () => {
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        id: 'test-user',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as('session');
});

// Custom command to mock widget preferences
Cypress.Commands.add('mockWidgetPreferences', (preferences: Record<string, boolean>) => {
  cy.intercept('GET', '/api/widget-preferences', {
    statusCode: 200,
    body: preferences,
  }).as('getPreferences');
});

// Custom command to toggle a widget through settings
Cypress.Commands.add('toggleWidget', (widgetId: string) => {
  cy.get('button').contains('Settings').click();
  cy.contains(new RegExp(widgetId, 'i')).click();
  cy.wait('@savePreferences');
});

// Custom command to drag and drop a widget
Cypress.Commands.add('dragWidget', (sourceId: string, targetId: string) => {
  const dataTransfer = new DataTransfer();
  
  cy.get(`[data-testid="widget-${sourceId}"]`)
    .trigger('dragstart', { dataTransfer })
    .trigger('drag');

  cy.get(`[data-testid="widget-${targetId}"]`)
    .trigger('dragover')
    .trigger('drop', { dataTransfer })
    .trigger('dragend');

  cy.wait('@saveOrder');
}); 
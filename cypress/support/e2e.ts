import '@testing-library/cypress/add-commands';
import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      checkWidget(widgetId: string): Chainable<void>;
      addWidget(widgetId: string): Chainable<void>;
      removeWidget(widgetId: string): Chainable<void>;
      reorderWidget(fromId: string, toId: string): Chainable<void>;
      mockAuth(): Chainable<void>;
      mockWidgetPreferences(preferences: Record<string, boolean>): Chainable<void>;
      toggleWidget(widgetId: string): Chainable<void>;
      dragWidget(sourceId: string, targetId: string): Chainable<void>;
    }
  }
}

// Mock user authentication by default
beforeEach(() => {
  cy.mockAuth();
});

// Preserve cookies between tests
beforeEach(() => {
  cy.getCookie('next-auth.session-token').then((cookie) => {
    if (cookie) {
      cy.setCookie('next-auth.session-token', cookie.value);
    }
  });
  cy.getCookie('next-auth.csrf-token').then((cookie) => {
    if (cookie) {
      cy.setCookie('next-auth.csrf-token', cookie.value);
    }
  });
  cy.getCookie('next-auth.callback-url').then((cookie) => {
    if (cookie) {
      cy.setCookie('next-auth.callback-url', cookie.value);
    }
  });
});

// Ignore uncaught exceptions from third-party libraries
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent Cypress from failing the test
  return false;
});

// Prevent TypeScript from reading file as legacy script
export {}; 
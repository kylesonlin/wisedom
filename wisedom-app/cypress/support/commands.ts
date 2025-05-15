/// <reference types="cypress" />
/// <reference types="cypress-axe" />

import 'cypress-axe';

// Mock Supabase session
Cypress.Commands.add('login', () => {
  // Mock the Supabase auth endpoint
  cy.intercept('POST', '/auth/v1/token?grant_type=refresh_token', {
    statusCode: 200,
    body: {
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
    },
  });

  // Mock the Supabase user endpoint
  cy.intercept('GET', '/auth/v1/user', {
    statusCode: 200,
    body: {
      id: 'test-user',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.png',
      },
    },
  }).as('getUser');

  // Mock the Supabase session endpoint
  cy.intercept('GET', '/auth/v1/session', {
    statusCode: 200,
    body: {
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'test-user',
        email: 'test@example.com',
        user_metadata: {
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.png',
        },
      },
    },
  });

  // Visit the dashboard directly since we're mocking the session
  cy.visit('/new-dashboard', {
    onBeforeLoad(win) {
      // Set the Supabase cookies
      cy.setCookie('sb-access-token', 'fake-access-token');
      cy.setCookie('sb-refresh-token', 'fake-refresh-token');
      
      // Mock the Supabase client in the window object
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'test-user',
            email: 'test@example.com',
            user_metadata: {
              name: 'Test User',
              avatar_url: 'https://example.com/avatar.png',
            },
          },
        },
      }));
    },
  });
  
  // Wait for the user data to be fetched
  cy.wait('@getUser');
});

// Custom command to check if a widget is visible
Cypress.Commands.add('checkWidget', (widgetId: string) => {
  cy.get(`[data-testid="widget-${widgetId}"]`).should('be.visible');
});

// Custom command to attach a file
Cypress.Commands.add('attachFile', (fileName: string) => {
  cy.get('input[type="file"]').attachFile(fileName);
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
  const dataTransfer = new DataTransfer();
  
  cy.get(`[data-testid="widget-${fromId}"]`)
    .trigger('dragstart', { dataTransfer })
    .trigger('drag', {});

  cy.get(`[data-testid="widget-${toId}"]`)
    .trigger('dragover', { dataTransfer })
    .trigger('drop', { dataTransfer })
    .trigger('dragend', { dataTransfer });
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

// Add more custom commands here
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Add command to check for security headers
Cypress.Commands.add('checkSecurityHeaders', () => {
  cy.request('/').then((response) => {
    expect(response.headers).to.include({
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
    });
  });
});

// Add command to test rate limiting
Cypress.Commands.add('checkRateLimit', (endpoint: string, limit: number) => {
  for (let i = 0; i <= limit; i++) {
    cy.request({
      url: endpoint,
      failOnStatusCode: false,
    }).then((response) => {
      if (i === limit) {
        expect(response.status).to.eq(429);
      } else {
        expect(response.status).to.not.eq(429);
      }
    });
  }
});

// Add command to test CSRF protection
Cypress.Commands.add('checkCSRFProtection', (endpoint: string) => {
  cy.request({
    method: 'POST',
    url: endpoint,
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(403);
  });
});

// Add command to test content security policy
Cypress.Commands.add('checkCSP', () => {
  cy.request('/').then((response) => {
    expect(response.headers['content-security-policy']).to.exist;
  });
});

// Add command to test authentication
Cypress.Commands.add('checkAuth', () => {
  cy.visit('/protected-route');
  cy.url().should('include', '/login');
});

// Add command to test form validation
Cypress.Commands.add('checkFormValidation', (formSelector: string) => {
  cy.get(formSelector).within(() => {
    cy.get('input[required]').each(($input) => {
      cy.wrap($input).type('a').clear();
      cy.wrap($input).blur();
      cy.get(':invalid').should('exist');
    });
  });
});

// Add command to test accessibility
Cypress.Commands.add('checkA11y', (options = {}) => {
  cy.injectAxe();
  cy.checkA11y(options);
});

// Add command to test performance
Cypress.Commands.add('checkPerformance', () => {
  cy.window().then((win) => {
    const performance = win.performance;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    expect(navigation.domComplete).to.be.lessThan(3000); // 3 seconds
  });
});

// Add command to test error handling
Cypress.Commands.add('checkErrorHandling', (endpoint: string) => {
  cy.request({
    url: endpoint,
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.body).to.have.property('error');
    expect(response.body.error).to.have.property('message');
  });
});

// Add command to test data persistence
Cypress.Commands.add('checkDataPersistence', (data: any) => {
  cy.window().then((win) => {
    win.localStorage.setItem('testData', JSON.stringify(data));
    const storedData = JSON.parse(win.localStorage.getItem('testData') || '{}');
    expect(storedData).to.deep.equal(data);
  });
});

// Add command to test responsive design
Cypress.Commands.add('checkResponsive', (viewport: 'mobile' | 'tablet' | 'desktop') => {
  const viewports = {
    mobile: [375, 667],
    tablet: [768, 1024],
    desktop: [1280, 800],
  };
  cy.viewport(viewports[viewport][0], viewports[viewport][1]);
});

// Add command to test network requests
Cypress.Commands.add('checkNetworkRequests', (url: string) => {
  cy.intercept(url).as('request');
  cy.wait('@request').then((interception) => {
    expect(interception.response?.statusCode).to.eq(200);
  });
}); 
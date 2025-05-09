describe('Performance', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
  });

  it('loads dashboard within performance budget', () => {
    cy.visit('/dashboard', {
      onBeforeLoad: (win) => {
        win.performance.mark('start');
      },
    });

    cy.get('[data-testid="dashboard-loaded"]').should('be.visible').then(() => {
      cy.window().then((win) => {
        win.performance.mark('end');
        win.performance.measure('dashboard-load', 'start', 'end');
        const measure = win.performance.getEntriesByName('dashboard-load')[0];
        expect(measure.duration).to.be.lessThan(2000); // 2 seconds budget
      });
    });
  });

  it('implements lazy loading for images', () => {
    cy.visit('/contacts');
    
    // Check lazy loading attributes
    cy.get('img').should('have.attr', 'loading', 'lazy');
    cy.get('[data-testid="contact-image"]').should('have.attr', 'loading', 'lazy');
  });

  it('implements infinite scroll for contact list', () => {
    cy.visit('/contacts');
    
    // Scroll to bottom
    cy.get('[data-testid="contacts-list"]').scrollTo('bottom');
    
    // Verify more contacts loaded
    cy.get('[data-testid="contact-card"]').should('have.length.greaterThan', 10);
  });

  it('implements debounced search', () => {
    cy.visit('/contacts');
    
    // Type in search box
    cy.get('[data-testid="search-input"]').type('test');
    
    // Wait for debounce
    cy.wait(300);
    
    // Verify search results
    cy.get('[data-testid="contact-card"]').should('be.visible');
  });

  it('implements virtual scrolling for network graph', () => {
    cy.visit('/network');
    
    // Check virtual scroll container
    cy.get('[data-testid="network-container"]').should('have.attr', 'data-virtual-scroll');
    
    // Scroll and verify nodes are rendered
    cy.get('[data-testid="network-container"]').scrollTo('bottom');
    cy.get('[data-testid="network-node"]').should('be.visible');
  });

  it('implements code splitting', () => {
    cy.visit('/dashboard');
    
    // Check chunk loading
    cy.window().then((win) => {
      const chunks = win.performance.getEntriesByType('resource')
        .filter((entry) => entry.name.includes('chunk'));
      expect(chunks.length).to.be.greaterThan(0);
    });
  });

  it('implements service worker caching', () => {
    cy.visit('/dashboard');
    
    // Check service worker registration
    cy.window().then((win) => {
      expect(win.navigator.serviceWorker.controller).to.exist;
    });
  });

  it('implements proper caching headers', () => {
    cy.visit('/dashboard');
    
    // Check cache headers
    cy.window().then((win) => {
      const resources = win.performance.getEntriesByType('resource');
      resources.forEach((resource) => {
        if (resource.name.includes('static')) {
          const headers = (resource as any).responseHeaders;
          if (headers) {
            expect(headers['cache-control']).to.include('max-age');
          }
        }
      });
    });
  });

  it('implements proper image optimization', () => {
    cy.visit('/contacts');
    
    // Check image optimization
    cy.get('img').each(($img) => {
      const src = $img.attr('src');
      expect(src).to.include('width=');
      expect(src).to.include('quality=');
    });
  });

  it('implements proper font loading', () => {
    cy.visit('/dashboard');
    
    // Check font loading
    cy.window().then((win) => {
      const fonts = win.performance.getEntriesByType('resource')
        .filter((entry) => entry.name.includes('font'));
      expect(fonts.length).to.be.greaterThan(0);
    });
  });

  it('implements proper API response caching', () => {
    cy.visit('/contacts');
    
    // Make API request
    cy.intercept('GET', '/api/contacts').as('getContacts');
    cy.wait('@getContacts').then((interception) => {
      if (interception.response) {
        expect(interception.response.headers['cache-control']).to.include('max-age');
      }
    });
  });

  it('implements proper error boundaries', () => {
    cy.visit('/dashboard');
    
    // Simulate error
    cy.window().then((win) => {
      win.dispatchEvent(new ErrorEvent('error'));
    });
    
    // Verify error boundary caught error
    cy.get('[data-testid="error-boundary"]').should('be.visible');
  });
}); 
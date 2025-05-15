/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to login using NextAuth session
     * @example cy.login()
     */
    login(email: string, password: string): Chainable<Subject>

    /**
     * Custom command to attach a file to an input element
     * @example cy.get('input[type="file"]').attachFile('example.csv')
     */
    attachFile(fileName: string): Chainable<Subject>

    /**
     * Custom command to add a widget
     * @example cy.addWidget('weather')
     */
    addWidget(widgetId: string): Chainable<void>

    /**
     * Custom command to remove a widget
     * @example cy.removeWidget('weather')
     */
    removeWidget(widgetId: string): Chainable<void>

    /**
     * Custom command to reorder widgets
     * @example cy.reorderWidget('weather', 'calendar')
     */
    reorderWidget(fromId: string, toId: string): Chainable<void>

    checkSecurityHeaders(): Chainable<Subject>
    checkRateLimit(endpoint: string, limit: number): Chainable<Subject>
    checkCSRFProtection(endpoint: string): Chainable<Subject>
    checkCSP(): Chainable<Subject>
    checkAuth(): Chainable<Subject>
    checkFormValidation(formSelector: string): Chainable<Subject>
    checkA11y(options?: any): Chainable<Subject>
    checkPerformance(): Chainable<Subject>
    checkErrorHandling(endpoint: string): Chainable<Subject>
    checkDataPersistence(data: any): Chainable<Subject>
    checkResponsive(viewport: 'mobile' | 'tablet' | 'desktop'): Chainable<Subject>
    checkNetworkRequests(url: string): Chainable<Subject>
  }
} 
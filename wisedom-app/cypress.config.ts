import { defineConfig } from 'cypress';
import { browserConfig } from './cypress/browser-config';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: browserConfig.viewports.desktop.width,
    viewportHeight: browserConfig.viewports.desktop.height,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
}); 
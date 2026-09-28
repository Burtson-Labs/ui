import { defineConfig, devices } from '@playwright/test';

import config from './playwright.config';

// Check navigation in Chromium and Safari without running the full component
// matrix: npx playwright test --config playwright.navigation.config.ts
export default defineConfig({
  ...config,
  testMatch: 'docs-navigation.spec.ts',
  projects: [
    ...(config.projects ?? []),
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
  ],
});

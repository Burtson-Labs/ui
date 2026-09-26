import { defineConfig, devices } from '@playwright/test';

// The browser smoke: real layout, real focus, real touch emulation, against
// the built docs site (npm run site first). Chromium only, at 1440 with a
// mouse and at 390 as a phone. Deterministic: fixed viewports, animations
// off, Inter bundled with the site.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
    colorScheme: 'light',
  },
  webServer: {
    command: 'npx vite preview --config site/vite.config.ts --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'touch',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});

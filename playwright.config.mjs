import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/browser',
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: 'http://127.0.0.1:8043',
  },
  projects: [
    ...['light', 'dark'].flatMap((colorScheme) => [
      { name: `desktop-${colorScheme}`, use: { colorScheme, launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}, viewport: { width: 1440, height: 1000 } } },
      { name: `mobile-${colorScheme}`, use: { colorScheme, launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    ]),
    ...['firefox', 'webkit'].flatMap(browserName => ['light', 'dark'].flatMap(colorScheme =>
      [1440, 390].map(width => ({
        name: `${browserName}-${width}-${colorScheme}`,
        testMatch: '**/browser-compatibility.spec.mjs',
        use: { browserName, colorScheme, viewport: { width, height: 1000 } },
      })))),
  ],
  webServer: {
    command: 'node test/browser/server.mjs',
    url: 'http://127.0.0.1:8043/simulator.html',
    reuseExistingServer: false,
  },
});

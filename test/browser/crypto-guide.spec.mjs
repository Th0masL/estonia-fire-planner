import { test, expect } from '@playwright/test';

test('crypto guide distinguishes acquisition regimes and model limitations', async ({ page }, testInfo) => {
  await page.goto('/guide/crypto.html');
  await expect(page.getByRole('heading', { name: 'Crypto', exact: true })).toBeVisible();
  await expect(page.getByText('1 January 2025', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What the simulator does—and does not do' })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('crypto.png'), fullPage: true });
});

import { test, expect } from '@playwright/test';
test('cash quote section distinguishes benchmark from retail quotes', async ({ page }, testInfo) => {
  await page.goto('/guide/brokers.html');
  const heading = page.getByRole('heading', { name: 'Cash-rate snapshot and quote checklist' });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeVisible();
  await expect(page.getByText('2026-09-16', { exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('cash.png') });
});

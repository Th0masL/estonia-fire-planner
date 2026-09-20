import { test, expect } from '@playwright/test';

test('company comparison shows net extraction and its conditions', async ({ page }, testInfo) => {
  await page.goto('/guide/company.html');
  await expect(page.getByRole('heading', { name: 'Using an OÜ as an investment wrapper' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '€89,000', exact: true })).toHaveCount(2);
  await expect(page.getByText('open review', { exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('company.png'), fullPage: true });
});

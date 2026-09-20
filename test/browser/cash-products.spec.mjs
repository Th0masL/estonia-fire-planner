import { test, expect } from '@playwright/test';

test('cash guidance separates investment risks and tax deferral', async ({ page }, testInfo) => {
  await page.goto('/guide/brokers.html#deposits-and-funds-do-different-jobs');
  await expect(page.getByRole('heading', { name: 'Deposits and funds do different jobs' })).toBeVisible();
  await page.locator('table').nth(1).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('cash-products.png') });
  await page.goto('/guide/property.html#where-the-down-payment-should-sit');
  await page.locator('table').first().evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(page.getByText('Tax deferral is not tax-free interest.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('purchase-reserve.png') });
});

import { test, expect } from '@playwright/test';

test('fund comparison presents scoped issuer evidence', async ({ page }, testInfo) => {
  await page.goto('/guide/portfolio.html#vwce-vs-webn');
  await expect(page.getByRole('heading', { name: 'VWCE vs WEBN', exact: true })).toBeVisible();
  await page.locator('table').first().scrollIntoViewIfNeeded();
  await expect(page.locator('table').first()).toContainText('IE0003XJA0J9');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('funds.png') });
  await page.getByRole('heading', { name: 'Fee evidence and its limits' }).scrollIntoViewIfNeeded();
  await expect(page.getByText('€350 per year', { exact: true })).toBeVisible();
});

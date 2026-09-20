import { test, expect } from '@playwright/test';

test('broker snapshot scopes fees and reporting responsibility', async ({ page }, testInfo) => {
  await page.goto('/guide/brokers.html');
  const heading = page.getByRole('heading', { name: 'Broker fee snapshot', exact: true });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeVisible();
  await page.locator('table').first().scrollIntoViewIfNeeded();
  await expect(page.getByText('The custody cap is not an all-in cost cap.', { exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('brokers.png') });
  await page.getByRole('heading', { name: 'Reporting still needs your review' }).scrollIntoViewIfNeeded();
  await expect(page.getByText('That is not unattended filing.', { exact: false })).toBeVisible();
});

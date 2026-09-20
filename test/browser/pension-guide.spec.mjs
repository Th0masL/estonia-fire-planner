import { test, expect } from '@playwright/test';

test('pension guide separates tax access, finite payouts and healthcare', async ({ page }, testInfo) => {
  await page.goto('/guide/pensions.html');
  for (const name of ['Access ages and payout conditions', 'Choosing the payout: fund withdrawals or lump sum', 'Healthcare and work cessation are separate']) {
    await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(1);
  }
  await expect(page.getByText('No insurer annuity is modeled.', { exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('pensions.png'), fullPage: true });
});

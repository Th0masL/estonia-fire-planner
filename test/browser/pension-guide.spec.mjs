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

test('pension update distinguishes announced changes and preserves section links', async ({ page }, testInfo) => {
  await page.goto('/guide/pensions.html');
  await expect(page.getByRole('heading', { name: 'Start with the three pillars', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('pension-introduction.png') });
  const reform = page.getByRole('heading', { name: 'Early exit: distinguish current rules from upcoming changes', exact: true });
  await reform.scrollIntoViewIfNeeded();
  await expect(page.getByText('935 SE on 30 September 2026', { exact: true })).toBeVisible();
  await expect(page.getByText('1 November 2026', { exact: true })).toHaveCount(1);
  await expect(page.getByText('1 January 2028', { exact: true })).toHaveCount(1);
  await expect(page.getByText(/Promulgation, the final published law/)).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath('pension-rule-status.png') });
  await page.goto('/guide/pensions.html#comparing-wrappers');
  await expect(page.locator('#comparing-wrappers')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Comparing pension saving with an investment account', exact: true })).toBeInViewport();
  await page.goto('/guide/brokers.html#which-fund-to-buy');
  await expect(page.locator('#which-fund-to-buy')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Cash-fund examples', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

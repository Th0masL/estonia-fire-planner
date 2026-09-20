import { test, expect } from '@playwright/test';

test('provider guidance retains eligibility and cost qualifications', async ({ page }, testInfo) => {
  await page.goto('/guide/portfolio.html');
  const heading = page.getByRole('heading', { name: 'Foreign accounts: eligibility is not a brand attribute' });
  await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(heading).toBeVisible();
  await expect(page.getByText('Still unverified:', { exact: true })).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('providers.png') });
  await page.goto('/guide/portfolio.html#lhv-or-ibkr-for-the-etf-itself');
  await expect(page.getByRole('heading', { name: 'LHV or IBKR for the ETF itself?' })).toBeVisible();
});

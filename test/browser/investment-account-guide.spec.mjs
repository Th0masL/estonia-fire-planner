import { test, expect } from '@playwright/test';

test('investment-account guide shows tax qualifications clearly', async ({ page }, testInfo) => {
  await page.goto('/guide/investment-account.html');
  await expect(page.getByRole('heading', { name: 'The investment account', exact: true })).toBeVisible();
  await expect(page.getByText('Limited review, 20 September 2026:', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('account-top.png') });
  const heading = page.getByRole('heading', { name: 'Accumulating does not mean tax-exempt' });
  await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(heading).toBeVisible();
  await expect(page.getByText('Still unverified:', { exact: true })).toBeVisible();
  await expect(page.getByText('$60,000 filing threshold', { exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('account-tax.png') });
});

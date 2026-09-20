import { test, expect } from '@playwright/test';

test('risk guide presents scenario limits and inflation cross-reference', async ({ page }, testInfo) => {
  await page.goto('/guide/risks.html');
  await expect(page.getByRole('heading', { name: 'Risks and blind spots', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('risk-top.png') });
  await page.getByRole('heading', { name: 'Concentration', exact: true }).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('risk-concentration.png') });
  await page.goto('/guide/fire-basics.html');
  await page.getByRole('link', { name: 'inflation risk', exact: true }).click();
  await expect(page).toHaveURL(/risks.html#estonian-inflation--eurozone-inflation$/);
  await expect(page.getByRole('heading', { name: 'Estonian inflation ≠ eurozone inflation', exact: true })).toBeVisible();
});

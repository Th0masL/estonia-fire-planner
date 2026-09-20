import { test, expect } from '@playwright/test';

test('sources register distinguishes evidence and uncertainty without overflow', async ({ page }, testInfo) => {
  await page.goto('/guide/sources.html');
  await expect(page.getByRole('heading', { name: 'Sources & verification', exact: true })).toBeVisible();
  for (const name of ['Checked rules', 'Model assumptions and known limits', 'Open review']) {
    await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('sources.png'), fullPage: true });
});

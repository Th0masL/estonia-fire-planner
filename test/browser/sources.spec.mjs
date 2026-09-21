import { test, expect } from '@playwright/test';

test('sources register distinguishes evidence and uncertainty without overflow', async ({ page }, testInfo) => {
  await page.goto('/guide/sources.html');
  await expect(page.getByRole('heading', { name: 'Sources & verification', exact: true })).toBeVisible();
  for (const name of ['Checked rules', 'Model assumptions and known limits', 'Open review']) {
    await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const limits = page.getByRole('heading', { name: 'What remains uncertain, and why', exact: true });
  await limits.evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(limits).toBeVisible();
  await expect(page.getByText('Personal evidence required', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('review-limits.png') });
  await page.screenshot({ path: testInfo.outputPath('sources.png'), fullPage: true });
});

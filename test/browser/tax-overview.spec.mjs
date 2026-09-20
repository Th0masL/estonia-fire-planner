import { test, expect } from '@playwright/test';

test('tax overview distinguishes rule and filing years without page overflow', async ({ page }, testInfo) => {
  await page.goto('/guide/tax-overview.html');
  for (const [name, file] of [
    ['Estonian tax in one screen', 'overview'],
    ['Filing year is not the income year', 'filing'],
    ['What this means for a FIRE plan', 'scope'],
  ]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${file}.png`) });
  }
  await expect(page.getByText('2025 income declared in 2026', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'source register', exact: true }).click();
  await expect(page).toHaveURL(/guide\/sources.html$/);
  await expect(page.getByRole('heading', { name: 'Tax overview', exact: true })).toBeAttached();
});

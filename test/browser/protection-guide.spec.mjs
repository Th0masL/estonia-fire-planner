import { test, expect } from '@playwright/test';

test('protection guide distinguishes coverage from access', async ({ page }, testInfo) => {
  await page.goto('/guide/protection.html');
  await page.locator('table').first().evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(page.locator('table').first()).toContainText('ordinary market losses');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('protection.png') });
  const access = page.getByText('Ownership, compensation and access are separate questions.', { exact: true });
  await access.scrollIntoViewIfNeeded();
  await expect(access).toBeVisible();
});

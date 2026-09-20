import { test, expect } from '@playwright/test';

test('savings guide exposes assumptions and informal FIRE variants', async ({ page }, testInfo) => {
  await page.goto('/guide/levers.html');
  await page.getByRole('link', { name: 'simplified savings-rate example', exact: true }).click();
  await expect(page).toHaveURL(/fire-basics.html#savings-rate-in-a-simplified-model$/);
  for (const [name, file] of [['Savings rate in a simplified model', 'savings'], ['FIRE variants', 'variants']]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${file}.png`) });
  }
  await expect(page.getByText('€864,388', { exact: true })).toHaveCount(1);
});

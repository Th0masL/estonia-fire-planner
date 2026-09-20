import { test, expect } from '@playwright/test';

test('withdrawal guide distinguishes mechanics from research guarantees', async ({ page }, testInfo) => {
  await page.goto('/guide/fire-basics.html');
  for (const [name, file] of [
    ["Initial withdrawal rate is not a percentage of every year's balance", 'mechanics'],
    ['Historical survival is not a personal success probability', 'limits'],
  ]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${file}.png`) });
  }
  await expect(page.getByText('Still unverified:', { exact: true })).toHaveCount(1);
  await page.getByRole('link', { name: 'worked example', exact: true }).click();
  await expect(page).toHaveURL(/risks.html#sequence-of-returns-risk$/);
});

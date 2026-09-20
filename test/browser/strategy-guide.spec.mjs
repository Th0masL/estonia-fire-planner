import { test, expect } from '@playwright/test';

test('strategy checklist renders qualifications and links', async ({ page }, testInfo) => {
  await page.goto('/guide/levers.html');
  for (const [name, file] of [
    ['Strategy levers: a decision checklist', 'intro'],
    ['3. Check investment-account suitability', 'accounts'],
    ['6. Solve health insurance deliberately', 'coverage'],
    ['Extra complexity needs a reason', 'complexity'],
  ]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${file}.png`) });
  }
  await page.getByRole('link', { name: 'investment-account guide', exact: true }).click();
  await expect(page).toHaveURL(/guide\/investment-account.html$/);
});

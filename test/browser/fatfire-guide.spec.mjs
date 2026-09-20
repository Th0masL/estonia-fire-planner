import { test, expect } from '@playwright/test';

test('FatFIRE illustrations show assumptions and link to withdrawal limits', async ({ page }, testInfo) => {
  await page.goto('/guide/fatfire.html');
  for (const [name, file] of [
    ['Illustrative spending targets', 'targets'],
    ['How long a fixed saving amount takes', 'saving'],
    ['Spending now versus spending in retirement', 'spending'],
    ['Investment-account allowance is a ledger, not wealth', 'allowance'],
  ]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${file}.png`) });
  }
  await page.getByRole('link', { name: 'withdrawal-research limitations', exact: true }).click();
  await expect(page).toHaveURL(/fire-basics.html#safe-withdrawal-rate--what-the-research-can-tell-us$/);
  await expect(page.getByRole('heading', { name: 'Safe withdrawal rate — what the research can tell us', exact: true })).toBeVisible();
});

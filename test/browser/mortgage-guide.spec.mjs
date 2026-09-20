import { test, expect } from '@playwright/test';

test('mortgage guidance displays conditional comparisons and provider limits', async ({ page }, testInfo) => {
  await page.goto('/guide/property.html');
  for (const [name, screenshot] of [
    ['Estonian mortgage mechanics', 'limits'],
    ['Loan term: compare cash flow and total cost', 'term'],
    ['Practical mechanics', 'repayment'],
  ]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${screenshot}.png`) });
  }
  await expect(page.getByText('Still unverified:', { exact: true })).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Funding the down payment from crypto' })).toHaveCount(1);
});

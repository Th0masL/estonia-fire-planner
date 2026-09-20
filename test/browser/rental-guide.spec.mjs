import { test, expect } from '@playwright/test';

test('rental guide shows qualifications and supplied-net-income limits', async ({ page }, testInfo) => {
  await page.goto('/guide/real-estate.html');
  await expect(page.getByRole('heading', { name: 'Property and rental income', exact: true })).toBeVisible();
  for (const [name, file] of [
    ['Residential rent: when the 20% deduction applies', 'rental'],
    ['Selling a home: exemption versus taxable gains', 'sale'],
  ]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${file}.png`) });
  }
  await expect(page.getByText('Still unverified:', { exact: true })).toHaveCount(1);
});

import { test, expect } from '@playwright/test';

async function zeroReturnPlan(page) {
  await page.goto('/pension.html');
  const year = await page.evaluate(() => new Date().getFullYear());
  await page.locator('#birthYear').fill(String(year - 40));
  await page.locator('#until').fill('50');
  await page.locator('#gross').fill('3000');
  await page.locator('#rate').selectOption('0.02');
  await page.locator('#have2').fill('20000');
  await page.locator('#have3').fill('10000');
  await page.locator('#p3').fill('1200');
  await page.locator('#ret').fill('0');
}

test('zero return preserves principal and adds only ten years of contributions', async ({ page }) => {
  await zeroReturnPlan(page);
  // Independent arithmetic: 30,000 + 10 × (36,000 × (2% + 4%) + 1,200).
  await expect(page.locator('#out .stat b').first()).toHaveText('€63,600');
  await expect(page.locator('#out .stat b').nth(1)).toHaveText('€265');
  await page.locator('#until').fill('40');
  await expect(page.locator('#out .stat b').first()).toHaveText('€30,000');
  await page.locator('#have2').fill('0');
  await page.locator('#have3').fill('0');
  await page.locator('#p3').fill('0');
  await expect(page.locator('#out .stat b').first()).toHaveText('€0');
});

test('empty and out-of-range numbers suspend the projection and recover when corrected', async ({ page }) => {
  await zeroReturnPlan(page);
  for (const [id, value, invalid] of [
    ['ret', '0', '13'], ['gross', '3000', '-1'],
    ['birthYear', String(new Date().getFullYear() - 40), '1900'],
    ['until', '50', '0'], ['have2', '20000', '-1'],
    ['have3', '10000', '-1'], ['p3', '1200', '-1'],
  ]) {
    const input = page.locator('#' + id);
    for (const bad of ['', invalid]) {
      await input.fill(bad);
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#out')).toContainText('Complete all numeric fields');
      await expect(page.locator('#out .stat')).toHaveCount(0);
    }
    await input.fill(value);
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#out .stat b').first()).toHaveText('€63,600');
  }
  await page.locator('#gross').fill('0');
  await expect(page.locator('#gross')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#out')).toContainText('Enter a gross salary');
});

test('money accepts exact amounts but fractional calendar years are rejected', async ({ page }) => {
  await zeroReturnPlan(page);
  await page.locator('#have2').fill('20000.75');
  await expect(page.locator('#out .stat b').first()).toHaveText('€63,601');
  await page.locator('#until').fill('50.5');
  await expect(page.locator('#until')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#out .stat')).toHaveCount(0);
  await page.locator('#until').fill('50');
  await expect(page.locator('#out .stat b').first()).toHaveText('€63,601');
});

import { test, expect } from '@playwright/test';
import { exampleState, encodeState } from '../../src/state.js';

test('calculator edits, reload, themes and navigation work across engines', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const plan = exampleState();
  plan.persons[0].name = 'Person1';
  await page.goto('/estonia-fire-planner/simulator.html#d=' + encodeState(plan));
  await expect(page.locator('.pname').first()).toHaveValue('Person1');
  const result = page.locator('#headline .stat b').first();
  const before = await result.textContent();
  await page.locator('#sOther').fill('4000');
  await expect(result).not.toHaveText(before);
  await page.reload();
  await expect(page.locator('#sOther')).toHaveValue('4000');
  await page.locator('#aPortfolioEnd').selectOption('drawdown');
  await expect(page.locator('#aPortfolioEnd')).toHaveValue('drawdown');
  await page.locator('#aPortfolioEnd').selectOption('perpetual');
  const narrow = page.viewportSize().width <= 900;
  if (narrow) {
    await expect(page.locator('#sidebar')).toBeHidden();
    await page.locator('#menu').click();
  }
  const opposite = testInfo.project.use.colorScheme === 'dark' ? 'light' : 'dark';
  await page.locator(`[data-theme-choice="${opposite}"]`).click();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(opposite);
  if (narrow) {
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).toBeFocused();
    await expect(page.locator('#scrim')).toHaveCSS('opacity', '0');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.locator('#aPortfolioEnd').scrollIntoViewIfNeeded();
  await page.locator('#aPortfolioEnd').focus();
  await expect(page.locator('#aPortfolioEnd')).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('select-layout.png') });
  await page.goto('/estonia-fire-planner/pension.html');
  for (const [id, value] of [['birthYear', new Date().getFullYear() - 40], ['until', 50],
    ['gross', 3000], ['have2', 20000], ['have3', 10000], ['p3', 1200], ['ret', 0]]) {
    await page.locator('#' + id).fill(String(value));
  }
  await page.locator('#rate').selectOption('0.02');
  await expect(page.locator('#out .stat b').first()).toHaveText('€63,600');
  await page.locator('#ret').fill('');
  await expect(page.locator('#ret')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#out .stat')).toHaveCount(0);
  await page.locator('#ret').fill('0');
  await expect(page.locator('#out .stat b').first()).toHaveText('€63,600');
  await page.goto('/estonia-fire-planner/guide/sources.html');
  await page.locator(narrow ? '.mobile-brand' : '.sidebar .brand').click();
  await expect(page).toHaveURL(/\/estonia-fire-planner\/index.html$/);
  expect(errors).toEqual([]);
});

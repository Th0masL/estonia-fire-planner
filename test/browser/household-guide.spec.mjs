import { test, expect } from '@playwright/test';
import { exampleState, encodeState } from '../../src/state.js';

test('household guide exposes benefit conditions and reference period', async ({ page }, testInfo) => {
  await page.goto('/guide/household.html');
  for (const [name, file] of [
    ['Allowances and accounts are individual', 'accounts'],
    ['Child and large-family allowances', 'benefits'],
    ['Shared parental benefit uses a reference period', 'parental'],
    ['Review life and disability risks', 'insurance'],
  ]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${file}.png`) });
  }
  await expect(page.getByText('Source caveat:', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'reviewed healthcare guide', exact: true }).click();
  await expect(page).toHaveURL(/health-insurance.html#family-routes-distinguish-the-different-bases$/);
});

test('life-cover advice is a review prompt, not a disability diagnosis', async ({ page }, testInfo) => {
  const plan = exampleState();
  plan.household.hasDependents = true;
  plan.persons.forEach(p => { p.lifeInsurance = false; });
  await page.goto('/simulator.html#d=' + encodeState(plan));
  const card = page.locator('.finding').filter({ hasText: 'Review household life-cover needs' });
  await expect(card).toContainText('does not record separate disability');
  await expect(card).not.toContainText('likelier than death');
  await card.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await card.screenshot({ path: testInfo.outputPath('life-advice.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

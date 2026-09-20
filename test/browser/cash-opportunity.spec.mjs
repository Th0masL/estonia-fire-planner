import { test, expect } from '@playwright/test';
import { exampleState, encodeState } from '../../src/state.js';

test('cash opportunity updates with inflation and avoids guaranteed-saving copy', async ({ page }, testInfo) => {
  const plan = exampleState();
  plan.household.property = {};
  plan.persons = [plan.persons[0]];
  plan.persons[0].name = 'Person1';
  plan.persons[0].assets.cash = 100000;
  Object.assign(plan.assumptions, { inflation: 0, cashRealReturn: 0, retirementCashReserve: 0 });
  await page.goto('/simulator.html#d=' + encodeState(plan));
  const card = page.locator('.finding').filter({ hasText: 'Compare returns on unreserved cash' });
  await expect(card).toContainText('€2,200/yr real difference');
  await expect(card).toContainText('2.2%');
  await expect(card).toContainText('before personal tax');
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: testInfo.outputPath('cash-opportunity.png') });
  await page.locator('#aInflation').fill('2.5');
  await expect(card).toHaveCount(0);
  await page.locator('#aCashReturn').fill('-2');
  await expect(card).toContainText('€1,707/yr real difference');
  await expect(card).toContainText('-0.29% real');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

import { test, expect } from '@playwright/test';
import { exampleState, encodeState } from '../../src/state.js';

test('possible partner route retains the unconfirmed health warning', async ({ page }, testInfo) => {
  const plan = exampleState();
  plan.currentYear = 2026;
  plan.persons = [plan.persons[0], structuredClone(plan.persons[0])];
  Object.assign(plan.persons[0], { name: 'Person1', birthYear: 1963, healthInsurance: false,
    income: { grossMonthly: 0, netMonthly: null } });
  Object.assign(plan.persons[1], { name: 'Person2', birthYear: 1970, healthInsurance: false,
    income: { grossMonthly: 3000, netMonthly: null } });
  await page.goto('/simulator.html#d=' + encodeState(plan));
  const route = page.locator('.finding').filter({ hasText: 'check dependent-partner coverage' });
  await expect(route).toContainText('Eligibility not confirmed');
  const gap = page.locator('.finding').filter({ hasText: 'Person1 may have no health insurance' });
  await expect(gap).toContainText('without receiving unemployment benefit');
  await gap.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await gap.screenshot({ path: testInfo.outputPath('health-advice.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('health guide distinguishes routes, contract limits and model assumptions', async ({ page }, testInfo) => {
  await page.goto('/guide/health-insurance.html');
  for (const [name, file] of [
    ['Health insurance when leaving work', 'intro'],
    ['Unemployment registration can provide coverage', 'unemployment'],
    ['Voluntary insurance: dated price and contract limits', 'contract'],
    ['Pension access and the simulator', 'model'],
  ]) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${file}.png`) });
  }
  await expect(page.getByText('€3,264/year', { exact: true })).toBeVisible();
});

test('household healthcare cross-links resolve', async ({ page }, testInfo) => {
  await page.goto('/guide/health-insurance.html');
  await page.getByRole('link', { name: 'household guide', exact: true }).click();
  const heading = page.getByRole('heading', { name: "Health insurance — check each person's route", exact: true });
  await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(heading).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('household.png') });
  await page.getByRole('link', { name: 'reviewed healthcare guide', exact: true }).click();
  await expect(page).toHaveURL(/health-insurance.html#family-routes-distinguish-the-different-bases$/);
});

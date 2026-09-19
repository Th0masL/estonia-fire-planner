import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { blankState, exampleState, encodeState, decodeState, STORAGE_KEY } from '../../src/state.js';

// Synthetic names; handlers only set a local marker and never read/send data.
const hostileName = `Person1 "><img data-injected src=x onerror="window.__injected=true"><svg data-injected onload="window.__injected=true"></svg>`;
const plainName = `Person2 Õ 中文 O'Name & "quoted" <text>`;
function makePlan(name = hostileName) {
  const plan = exampleState();
  const person = plan.persons[0];
  person.name = name;
  person.assets.cash = 150000;
  person.income.grossMonthly = 4000;
  person.allocationShare = 0.5;
  person.fundPensionYears = 20;
  person.annuityMonthlyQuote = 100;
  person.yearsWorkedEstonia = 10;
  person.pillar1Units = 8;
  plan.persons.push({ ...structuredClone(person), name: plainName, lifeInsurance: true });
  plan.household.property = { purchase: {
    price: 200000, deposit: 50000, collateralValue: 200000, termYears: 20,
    rate: 0.04, monthsAway: 12, runningCostsMonthly: 300, movingCosts: 0,
    otherDebtMonthly: 0, paidBy: 0,
  } };
  plan.assumptions.pensionPolicy = 'all';
  plan.assumptions.pillarPayout = 'fundPension';
  return plan;
}
const fragment = (plan) => '#d=' + encodeState(plan);
const saved = (page) => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);

test('funded retirement remains visible without income or positive savings', async ({ page }) => {
  const plan = blankState();
  Object.assign(plan.persons[0], { name: 'Person1', birthYear: new Date().getFullYear() - 55,
    healthCoveredAfterFi: true, assets: { cash: 500000 },
    income: { grossMonthly: 0, netMonthly: 0 } });
  plan.household.spending.other = 1000;
  Object.assign(plan.assumptions, { realReturn: 0, cashRealReturn: 0,
    pensionPolicy: 'ignore', portfolioEnd: 'drawdown', planToAge: 75,
    bufferYears: 0, spendingGrowth: 0 });
  await page.goto('/simulator.html' + fragment(plan));
  await expect(page.locator('#headline')).toContainText('age at FI');
  await expect(page.locator('#headline')).toContainText('55');
  await expect(page.locator('#headline')).not.toContainText('Add your');
  await expect(page.locator('body')).toContainText('The modeled assets still support the displayed FI date.');
  await expect(page.locator('body')).not.toContainText('no FI date to compute');
  await expect(page.locator('#plan')).toContainText('Configured earnings and pension contributions continue');
  await expect(page.locator('#plan')).toContainText('A pay cut or career break needs a separate scenario.');
});

test('legacy annuity plans require fund duration and never use insurer quotes', async ({ page }) => {
  const plan = makePlan('Person1');
  plan.assumptions.pillarPayout = 'annuity';
  for (const person of plan.persons) {
    person.annuityMonthlyQuote = 99999;
    person.fundPensionYears = null;
  }
  await page.goto('/simulator.html' + fragment(plan));
  await expect(page.locator('#aPillarPayout')).toHaveValue('fundPension');
  await expect(page.locator('#aPillarPayout option[value="annuity"]')).toHaveCount(0);
  await expect(page.locator('[data-k="annuityMonthlyQuote"]')).toHaveCount(0);
  await expect(page.locator('#plan')).toContainText('Person1: pension income cannot be verified');
  const duration = page.locator('[data-i="0"][data-k="fundPensionYears"]');
  await expect(duration).toHaveValue('');
  await duration.fill('20');
  await page.reload();
  await expect(duration).toHaveValue('20');
  const restored = JSON.parse(await saved(page));
  expect(restored.assumptions.pillarPayout).toBe('fundPension');
  expect(restored.persons[0].annuityMonthlyQuote).toBeUndefined();
  expect(restored.persons[1].fundPensionYears).toBeNull();
  await page.locator('#aPensionPolicy').selectOption('ignore');
  await expect(duration).toBeHidden();
  await page.locator('#aPensionPolicy').selectOption('ownPots');
  await expect(duration).toBeVisible();
});

async function assertSafeNames(page, name = hostileName) {
  await expect(page.locator('.pname').first()).toHaveValue(name);
  await expect(page.locator('.pname').nth(1)).toHaveValue(plainName);
  await expect(page.locator('#hPaidBy option[value="0"]')).toHaveText(name);
  await expect(page.locator('#headline')).toContainText(name);
  await expect(page.locator('#chart .legend')).toContainText(name);
  await expect(page.locator('#plan')).toContainText(name);
  expect(await page.locator('[data-injected]').count()).toBe(0);
  expect(await page.evaluate(() => window.__injected)).toBeUndefined();
}

test('lump-sum selection shows net capital and persists allocation', async ({ page }) => {
  const plan = makePlan('Person1');
  plan.persons = [plan.persons[0]];
  Object.assign(plan.persons[0], { birthYear: 1960, healthCoveredAfterFi: true,
    assets: { cash: 500000, pillar2: 100000 }, income: { grossMonthly: 4000, netMonthly: 3000 },
    pillar3Annual: 0, fundPensionYears: null });
  plan.currentYear = 2026;
  plan.household.property = null;
  plan.household.spending = { other: 1000 };
  Object.assign(plan.assumptions, { pensionPolicy: 'ownPots', portfolioEnd: 'drawdown',
    planToAge: 75, realReturn: 0, cashRealReturn: 0, bufferYears: 0 });
  await page.goto('/simulator.html' + fragment(plan));
  await page.locator('#aPillarPayout').selectOption('lumpSum');
  await page.locator('#aLumpInvestedShare').fill('60');
  await expect(page.locator('[data-k="fundPensionYears"]')).toBeHidden();
  await expect(page.locator('tr').filter({ hasText: 'Person1: Pillar II lump sum' })).toContainText('€90,000 net');
  await expect(page.locator('.schedule tbody tr').first()).toContainText('€54,000');
  await page.reload();
  await expect(page.locator('#aPillarPayout')).toHaveValue('lumpSum');
  await expect(page.locator('#aLumpInvestedShare')).toHaveValue('60');
  await page.locator('#share').click();
  const shared = decodeState(new URL(await page.locator('#shareUrl').inputValue()).hash.slice(3));
  expect(shared.assumptions.pensionLumpSumInvestedShare).toBe(.6);
  expect(shared.assumptions.pillarPayout).toBe('lumpSum');
  await page.locator('[data-i="0"][data-k="assets.cash"]').fill('0');
  await page.locator('[data-i="0"][data-k="assets.pillar2"]').fill('200000');
  await expect(page.locator('tr').filter({ hasText: 'Single investment crash on day one' })).toContainText('40%');
});

test('initial shared plans render names literally in all result paths', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/simulator.html' + fragment(makePlan()));
  await assertSafeNames(page);
  await expect(page).toHaveURL(/simulator\.html$/);
  await expect(page.locator('#aPillarPayout option[value="annuity"]')).toHaveCount(0);
  await assertSafeNames(page);
  await page.locator('#aPensionPolicy').selectOption('ignore');
  await assertSafeNames(page);
  expect(errors).toEqual([]);
});

test('imports, exports, reloads and generated share links preserve names and data', async ({ page }) => {
  await page.goto('/simulator.html');
  const chooser = page.waitForEvent('filechooser');
  await page.locator('#import').click();
  await (await chooser).setFiles({ name: 'synthetic.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(makePlan())) });
  await assertSafeNames(page);
  const before = JSON.parse(await saved(page));
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloadEvent;
  const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(exported).toEqual(before);
  await page.locator('#share').click();
  const link = await page.locator('#shareUrl').inputValue();
  expect(decodeState(new URL(link).hash.slice(3))).toEqual(before);
  await page.reload();
  await assertSafeNames(page);
  expect(JSON.parse(await saved(page))).toEqual(before);
});

test('fragment changes safely adopt a new plan in an existing tab', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(makePlan('Person1')));
  await page.evaluate((hash) => { location.hash = hash; }, fragment(makePlan()));
  await assertSafeNames(page);
  expect(JSON.parse(await saved(page)).persons[0].name).toBe(hostileName);
});

test('typing a name preserves focus, punctuation, and non-ASCII characters', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(makePlan('Person1')));
  const name = page.locator('.pname').first();
  await name.fill('');
  await name.pressSequentially('Person1');
  await expect(name).toBeFocused();
  await expect(name).toHaveValue('Person1');
  await name.fill(plainName);
  await expect(name).toBeFocused();
  await assertSafeNames(page, plainName);
  expect(JSON.parse(await saved(page)).persons[0].name).toBe(plainName);
});

test('invalid imports and changed fragments report errors without replacing the plan', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(makePlan('Person1')));
  const before = await saved(page);
  const invalid = [
    '{',
    JSON.stringify({ persons: [null], household: {} }),
    JSON.stringify({ persons: [false], household: {} }),
    JSON.stringify({ persons: [[]], household: {} }),
    JSON.stringify({ persons: [{}], household: [] }),
    JSON.stringify({ ...makePlan(), version: 999 }),
  ];
  for (const text of invalid) {
    await page.locator('#importFile').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await expect(page.locator('#status')).toContainText('Could not read');
    expect(await saved(page)).toBe(before);
    await expect(page.locator('.pname').first()).toHaveValue('Person1');
  }
  for (const hash of ['#d=not-base64!', fragment({ persons: [null], household: {} })]) {
    await page.evaluate((value) => { location.hash = value; }, hash);
    await expect(page.locator('#status')).toContainText('existing plan has been kept');
    expect(await saved(page)).toBe(before);
  }
});

test('invalid initial shared link keeps the saved plan', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(makePlan('Person1')));
  const before = await saved(page);
  await page.goto('/simulator.html#d=invalid!');
  await expect(page.locator('#status')).toContainText('existing plan has been kept');
  await expect(page.locator('.pname').first()).toHaveValue('Person1');
  expect(await saved(page)).toBe(before);
});

test('standalone file works offline with a hostile shared name', async ({ page }) => {
  const file = new URL('../../simulator.html', import.meta.url).href;
  await page.goto(file + fragment(makePlan()));
  await assertSafeNames(page);
});

test('loss-making asset bases survive sharing, storage, export and import', async ({ page }) => {
  const plan = makePlan('Person1');
  const pairs = [
    ['investmentAccount', 'investmentAccountContributions'],
    ['brokerage', 'brokerageCostBasis'], ['crypto', 'cryptoCostBasis'],
  ];
  for (const [asset, basis] of pairs) {
    plan.persons[0].assets[asset] = 80000;
    plan.persons[0].assets[basis] = 100000;
  }
  await page.goto('/simulator.html' + fragment(plan));
  const check = async () => {
    for (const [asset, basis] of pairs) {
      await expect(page.locator(`[data-i="0"][data-k="assets.${asset}"]`)).toHaveValue('80000');
      await expect(page.locator(`[data-i="0"][data-k="assets.${basis}"]`)).toHaveValue('100000');
      expect(JSON.parse(await saved(page)).persons[0].assets[basis]).toBe(100000);
    }
  };
  await check();
  await page.reload();
  await check();
  const downloading = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloading;
  const buffer = await readFile(await download.path());
  for (const [, basis] of pairs) expect(JSON.parse(buffer).persons[0].assets[basis]).toBe(100000);
  await page.locator('#importFile').setInputFiles({ name: 'synthetic.json', mimeType: 'application/json', buffer });
  await check();
  await page.locator('#share').click();
  const shared = decodeState(new URL(await page.locator('#shareUrl').inputValue()).hash.slice(3));
  for (const [, basis] of pairs) expect(shared.persons[0].assets[basis]).toBe(100000);
});

test('confirmed health coverage date is optional and persists without pension income', async ({ page }) => {
  const plan = makePlan('Person1');
  plan.assumptions.pensionPolicy = 'ignore';
  await page.goto('/simulator.html' + fragment(plan));
  const field = page.locator('[data-i="0"][data-k="healthCoverageFromYear"]');
  await expect(field).toHaveValue('');
  await field.fill('2050');
  await page.reload();
  await expect(field).toHaveValue('2050');
  expect(JSON.parse(await saved(page)).persons[0].healthCoverageFromYear).toBe(2050);
  await page.locator('#share').click();
  const shared = decodeState(new URL(await page.locator('#shareUrl').inputValue()).hash.slice(3));
  expect(shared.persons[0].healthCoverageFromYear).toBe(2050);
  await field.fill('');
  await page.reload();
  await expect(field).toHaveValue('');
  expect(JSON.parse(await saved(page)).persons[0].healthCoverageFromYear).toBeNull();
  await expect(page.locator('body')).not.toContainText('years, then free');
});

test('low-salary pension assumptions are visibly flagged and names remain literal', async ({ page }) => {
  const plan = makePlan();
  plan.persons[0].income.grossMonthly = 500;
  await page.goto('/simulator.html' + fragment(plan));
  await expect(page.locator('#plan')).toContainText(hostileName + ': verify pension contribution assumptions');
  await expect(page.locator('#plan')).toContainText('not inferred');
  expect(await page.evaluate(() => window.__injected)).toBeUndefined();
  await page.locator('[data-i="0"][data-k="income.grossMonthly"]').fill('4000');
  await expect(page.locator('#plan')).not.toContainText('verify pension contribution assumptions');
});

test('protected retirement reserve persists and is shown separately from spendable assets', async ({ page }, testInfo) => {
  const plan = makePlan('Person1');
  plan.persons = [plan.persons[0]];
  Object.assign(plan.persons[0], { birthYear: 1971, assets: { cash: 800000 }, healthCoveredAfterFi: true, pillar3Annual: 0 });
  plan.currentYear = 2026;
  plan.household.property = null;
  plan.household.spending = { housing: 0, childCosts: 0, other: 2000, buffer: 0 };
  Object.assign(plan.assumptions, { pensionPolicy: 'ignore', portfolioEnd: 'drawdown',
    planToAge: 75, bufferYears: 0, cashRealReturn: 0, realReturn: .05 });
  await page.goto('/simulator.html' + fragment(plan));
  await page.locator('#aRetirementReserve').fill('20000');
  await expect(page.locator('tr').filter({ hasText: 'Protected emergency cash after FIRE' })).toContainText('€20,000');
  await expect(page.locator('tr').filter({ hasText: 'Spendable portion of the FIRE target' })).toContainText('€480,000');
  await page.reload();
  await expect(page.locator('#aRetirementReserve')).toHaveValue('20000');
  await page.locator('#share').click();
  const shared = decodeState(new URL(await page.locator('#shareUrl').inputValue()).hash.slice(3));
  expect(shared.assumptions.retirementCashReserve).toBe(20000);
  await page.locator('#aRetirementReserve').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('reserve.png') });
});

test('lifestyle spending growth does not increase fixed mortgage payments', async ({ page }) => {
  const plan = makePlan('Person1');
  plan.persons = [plan.persons[0]];
  Object.assign(plan.persons[0], { birthYear: 1971, assets: { cash: 1000000 }, healthCoveredAfterFi: true, pillar3Annual: 0 });
  plan.currentYear = 2026;
  plan.household.spending = { housing: 0, other: 1000, childCosts: 0, buffer: 0 };
  plan.household.property = { purchase: { price: 120000, deposit: 0, collateralValue: 120000,
    termYears: 10, rate: 0, monthsAway: 0, runningCostsMonthly: 0, movingCosts: 0, paidBy: 0 } };
  Object.assign(plan.assumptions, { inflation: 0, pensionPolicy: 'ignore', portfolioEnd: 'drawdown',
    planToAge: 75, bufferYears: 0, realReturn: 0, cashRealReturn: 0, transactionCostRate: 0,
    emergencyFundMonths: 0, spendingGrowth: 0 });
  await page.goto('/simulator.html' + fragment(plan));
  const secondYear = page.locator('.schedule tbody tr').filter({ has: page.getByRole('cell', { name: '2027', exact: true }) });
  await expect(secondYear.locator('td').nth(3)).toHaveText('€2,000');
  await page.locator('#aSpendGrowth').fill('2');
  await expect(secondYear.locator('td').nth(3)).toHaveText('€2,020');
  await page.locator('#aInflation').fill('10');
  await expect(secondYear.locator('td').nth(3)).toHaveText('€1,929');
});

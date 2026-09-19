import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { exampleState, encodeState, decodeState, STORAGE_KEY } from '../../src/state.js';

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

test('initial shared plans render names literally in all result paths', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/simulator.html' + fragment(makePlan()));
  await assertSafeNames(page);
  await expect(page).toHaveURL(/simulator\.html$/);
  await page.locator('#aPillarPayout').selectOption('annuity');
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

import { test, expect } from '@playwright/test';
import { exampleState, encodeState, STORAGE_KEY, BACKUP_KEY } from '../../src/state.js';

// Nothing that replaces a plan may do it silently, and the live result must be
// the one a reload would show. Synthetic names only.
function plan(name, extra = (p) => p) {
  const p = exampleState();
  p.persons[0].name = name;
  return extra(p);
}
const fragment = (p) => '#d=' + encodeState(p);
const stored = (page, key = STORAGE_KEY) => page.evaluate((k) => localStorage.getItem(k), key);
const firstName = (page) => page.locator('.pname').first();

test('loading the example supplies pension inputs when pension counting is enabled', async ({ page }) => {
  await page.goto('/simulator.html');
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('illustrative, not official records');
    await dialog.accept();
  });
  await page.locator('#example').click();
  await page.locator('#aPensionPolicy').selectOption('ownPots');
  await expect(page.locator('[data-k="fundPensionYears"]')).toHaveValue('25');
  await expect(page.locator('body')).not.toContainText('Pension income excluded');
  await expect(page.locator('body')).not.toContainText('first-contribution year missing');
  await page.locator('#aPensionPolicy').selectOption('all');
  await expect(page.locator('[data-k="pillar1Units"]')).toHaveValue('15');
  await expect(page.locator('[data-k="yearsWorkedEstonia"]')).toHaveValue('12');
  await page.reload();
  await expect(page.locator('#aPensionPolicy')).toHaveValue('all');
  await expect(page.locator('[data-k="fundPensionYears"]')).toHaveValue('25');
});

test('a share link asks before replacing a different saved plan, and declining keeps it', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  const before = await stored(page);
  let message = '';
  page.once('dialog', async (d) => { message = d.message(); await d.dismiss(); });
  await page.goto('/simulator.html' + fragment(plan('Person2')));
  await expect(page.locator('#status')).toContainText('Kept your saved plan');
  expect(message).toContain('different plan');
  await expect(firstName(page)).toHaveValue('Person1');
  await expect(page).toHaveURL(/simulator\.html$/);
  expect(await stored(page)).toBe(before);
});

test('accepting a share link keeps the old plan for Undo', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  page.once('dialog', (d) => d.accept());
  await page.goto('/simulator.html' + fragment(plan('Person2')));
  await expect(firstName(page)).toHaveValue('Person2');
  expect(JSON.parse(await stored(page, BACKUP_KEY)).persons[0].name).toBe('Person1');
  await page.locator('#status').getByRole('button', { name: 'Undo' }).click();
  await expect(firstName(page)).toHaveValue('Person1');
  await expect(page.locator('#status')).toContainText('Restored the previous plan');
  expect(JSON.parse(await stored(page)).persons[0].name).toBe('Person1');
});

test('the same plan arriving by link does not ask', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  let asked = false;
  page.on('dialog', (d) => { asked = true; d.dismiss(); });
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  await expect(page.locator('#status')).toContainText('Loaded a shared plan');
  expect(asked).toBe(false);
});

test('Example and Clear can be undone', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  page.on('dialog', (d) => d.accept());
  await page.locator('#reset').click();
  await expect(firstName(page)).toHaveValue('You');
  await page.locator('#status').getByRole('button', { name: 'Undo' }).click();
  await expect(firstName(page)).toHaveValue('Person1');
  await page.locator('#example').click();
  await expect(firstName(page)).toHaveValue('You');
  await page.locator('#status').getByRole('button', { name: 'Undo' }).click();
  await expect(firstName(page)).toHaveValue('Person1');
});

test('an oversized import is refused before it is read', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  const before = await stored(page);
  const huge = JSON.stringify({ ...plan('Person2'), padding: 'x'.repeat(1_100_000) });
  await page.locator('#importFile').setInputFiles({ name: 'huge.json', mimeType: 'application/json', buffer: Buffer.from(huge) });
  await expect(page.locator('#status')).toContainText('Could not read huge.json');
  await expect(page.locator('#status')).toContainText('MB');
  expect(await stored(page)).toBe(before);
  await expect(firstName(page)).toHaveValue('Person1');
});

test('an import drops unknown fields, caps names, and can be undone', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  const incoming = plan('N'.repeat(500), (p) => { p.persons[0].secret = 'x'; p.extra = 1; return p; });
  await page.locator('#importFile').setInputFiles({ name: 'plan.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) });
  await expect(firstName(page)).toHaveValue('N'.repeat(60));
  const saved = JSON.parse(await stored(page));
  expect(saved.extra).toBeUndefined();
  expect(saved.persons[0].secret).toBeUndefined();
  await page.locator('#status').getByRole('button', { name: 'Undo' }).click();
  await expect(firstName(page)).toHaveValue('Person1');
});

test('out-of-range inputs are marked, and the result matches what a reload shows', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  const field = page.locator('#aReturn');
  await expect(field).toHaveAttribute('max', '20');
  await field.fill('50');
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#aReturn-error')).toContainText('Must be between 0 and 20');
  const live = await page.locator('#headline .stat').nth(1).textContent();
  await page.reload();
  await expect(field).toHaveValue('20.0');
  await expect(field).toHaveAttribute('aria-invalid', 'false');
  await expect(page.locator('#aReturn-error')).toHaveCount(0);
  expect(await page.locator('#headline .stat').nth(1).textContent()).toBe(live);
});

test('a person-card field takes its limits from the same table', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  const born = page.locator('[data-i="0"][data-k="birthYear"]');
  await expect(born).toHaveAttribute('min', '1900');
  await born.fill('1800');
  await expect(born).toHaveAttribute('aria-invalid', 'true');
  await expect(born).toHaveAttribute('aria-describedby', /.+/);
  await born.fill('1985');
  await expect(born).toHaveAttribute('aria-invalid', 'false');
});

test('no FI date names the input responsible', async ({ page }) => {
  await page.goto('/simulator.html' + fragment(plan('Person1', (p) => {
    p.assumptions.portfolioEnd = 'perpetual';
    p.assumptions.swr = 0.02;
    p.assumptions.spendingGrowth = 0.03;
    return p;
  })));
  await expect(page.locator('#fiBlocker')).toContainText('Spending growth');
  await expect(page.locator('#fiBlocker')).toContainText('withdrawal rate');
  await page.locator('#aSpendGrowth').fill('0');
  await expect(page.locator('#fiBlocker')).toHaveCount(0);
});

test('Remove asks first, names the person, and can be undone', async ({ page }) => {
  const two = plan('Person1', (p) => {
    p.persons.push({ ...structuredClone(p.persons[0]), name: 'Person2' });
    return p;
  });
  await page.goto('/simulator.html' + fragment(two));
  const remove = page.getByRole('button', { name: 'Remove Person2' });
  await expect(remove).toBeVisible();
  page.once('dialog', (d) => d.dismiss());
  await remove.click();
  await expect(page.locator('.pname')).toHaveCount(2);
  page.once('dialog', (d) => d.accept());
  await remove.click();
  await expect(page.locator('.pname')).toHaveCount(1);
  await page.locator('#status').getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('.pname')).toHaveCount(2);
  await page.locator('.pname').nth(1).fill('Person3');
  await expect(page.getByRole('button', { name: 'Remove Person3' })).toBeVisible();
});

test('explanations use the entered purchase costs and each person\'s duration', async ({ page }) => {
  const p = plan('Person1', (s) => {
    s.persons[0].assets.cash = 200000;
    s.persons.push({ ...structuredClone(s.persons[0]), name: 'Person2', fundPensionYears: 25 });
    s.persons[0].fundPensionYears = 18;
    s.persons[0].allocationShare = s.persons[1].allocationShare = 0.5;
    s.persons.forEach((x) => { x.pillar3FirstContributionYear = 2010; });
    s.household.property = { purchase: {
      price: 200000, deposit: 50000, collateralValue: 200000, termYears: 20, rate: 0.04,
      monthsAway: 12, runningCostsMonthly: 300, movingCosts: 0, otherDebtMonthly: 0, paidBy: 0,
    } };
    Object.assign(s.assumptions, { transactionCostRate: 0.05, emergencyFundMonths: 9,
      pensionPolicy: 'ownPots', pillarPayout: 'fundPension', portfolioEnd: 'drawdown' });
    return s;
  });
  await page.goto('/simulator.html' + fragment(p));
  const complete = page.locator('[data-info-body="complete"]');
  await expect(complete).toContainText('5% of the price');
  await expect(complete).toContainText('9 months');
  const takenAs = page.locator('tr').filter({ hasText: 'Taken as' });
  await expect(takenAs).toContainText('Person1 18 years');
  await expect(takenAs).toContainText('Person2 25 years');
});

test('the Undo message stays while it has focus', async ({ page }) => {
  await page.clock.install();
  await page.goto('/simulator.html' + fragment(plan('Person1')));
  page.on('dialog', (d) => d.accept());
  await page.locator('#example').click();
  const undo = page.locator('#status').getByRole('button', { name: 'Undo' });
  await undo.focus();
  await page.clock.runFor(30000);
  await expect(undo).toBeVisible();
});

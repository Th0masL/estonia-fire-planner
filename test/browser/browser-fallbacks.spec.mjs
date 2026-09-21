import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { exampleState, encodeState, decodeState, STORAGE_KEY } from '../../src/state.js';

function syntheticPlan() {
  const plan = exampleState();
  plan.persons[0].name = 'Person1';
  return plan;
}

async function exportPlan(page) {
  const pending = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await pending;
  return JSON.parse(await readFile(await download.path(), 'utf8'));
}

for (const failure of ['blocked', 'quota']) {
  test(`${failure} storage leaves calculations, export and theme switching usable`, async ({ page, isMobile }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(mode => {
      const fail = () => { throw new DOMException('Synthetic storage failure',
        mode === 'quota' ? 'QuotaExceededError' : 'SecurityError'); };
      if (mode === 'blocked') Object.defineProperty(Storage.prototype, 'getItem', { value: fail });
      Object.defineProperty(Storage.prototype, 'setItem', { value: fail });
    }, failure);
    // Exercise the startup read fallback before loading a shared plan.
    await page.goto('/simulator.html');
    await expect(page.locator('.pname').first()).toHaveValue('You');
    await page.goto('/simulator.html#d=' + encodeState(syntheticPlan()));
    await expect(page.locator('.pname').first()).toHaveValue('Person1');
    await page.locator('.pname').first().fill('Person2');
    const headline = page.locator('#headline .stat b').first();
    const before = await headline.textContent();
    await page.locator('#sOther').fill('4000');
    await expect(headline).not.toHaveText(before);
    const exported = await exportPlan(page);
    expect(exported.persons[0].name).toBe('Person2');
    expect(exported.household.spending.other).toBe(4000);
    if (isMobile) await page.locator('#menu').click();
    for (const theme of ['dark', 'light']) {
      await page.locator(`[data-theme-choice="${theme}"]`).click();
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(theme);
    }
    // Failed saves must not be mistaken for successful persistence.
    await page.reload();
    await expect(page.locator('.pname').first()).toHaveValue('You');
    expect(errors).toEqual([]);
  });
}

for (const clipboard of ['missing', 'denied']) {
  test(`${clipboard} clipboard still provides a complete manually copyable share link`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(mode => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === 'missing'
        ? undefined : { writeText: () => Promise.reject(new DOMException('Synthetic denial', 'NotAllowedError')) } });
    }, clipboard);
    await page.goto('/simulator.html#d=' + encodeState(syntheticPlan()));
    await page.locator('.pname').first().fill('Person2');
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
    await page.locator('#share').click();
    await expect(page.locator('#shareBox')).toBeVisible();
    const link = new URL(await page.locator('#shareUrl').inputValue());
    expect(decodeState(link.hash.slice(3))).toEqual(saved);
    if (clipboard === 'denied') await expect(page.locator('#status')).toContainText('select and copy');
    await page.locator('#shareClose').click();
    await expect(page.locator('#shareBox')).toBeHidden();
    await page.goto(link.href);
    await expect(page.locator('.pname').first()).toHaveValue('Person2');
    expect(errors).toEqual([]);
  });
}

test('cancelling reset and example replacement preserves edits and persisted data', async ({ page }) => {
  await page.goto('/simulator.html#d=' + encodeState(syntheticPlan()));
  await page.locator('.pname').first().fill('Person2');
  const saved = await exportPlan(page);
  for (const action of ['reset', 'example']) {
    let dialogType;
    page.once('dialog', async dialog => { dialogType = dialog.type(); await dialog.dismiss(); });
    await page.locator('#' + action).click();
    expect(dialogType).toBe('confirm');
    expect(await exportPlan(page)).toEqual(saved);
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY)).toEqual(saved);
  }
  await page.reload();
  expect(await exportPlan(page)).toEqual(saved);
});

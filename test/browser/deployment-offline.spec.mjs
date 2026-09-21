import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { exampleState, encodeState } from '../../src/state.js';

const prefix = '/estonia-fire-planner/';
const pages = ['index.html', 'simulator.html', 'pension.html',
  ...readdirSync(new URL('../../guide/', import.meta.url)).filter(name => name.endsWith('.html')).map(name => 'guide/' + name)];

async function exerciseCalculators(page, urlFor) {
  const plan = exampleState();
  plan.persons[0].name = 'Person1';
  await page.goto(urlFor('simulator.html') + '#d=' + encodeState(plan));
  await expect(page.locator('#fiEstimateHint')).toBeVisible();
  await expect(page.locator('.pname').first()).toHaveValue('Person1');
  await page.locator('.pname').first().fill('Person2');
  await expect(page.locator('.pname').first()).toHaveValue('Person2');
  await expect(page.locator('#headline .stat b').first()).not.toHaveText('');
  const before = await page.locator('#headline .stat b').first().textContent();
  await page.locator('#sOther').fill('4000');
  await expect(page.locator('#headline .stat b').first()).not.toHaveText(before);

  await page.goto(urlFor('pension.html'));
  const year = await page.evaluate(() => new Date().getFullYear());
  for (const [id, value] of [['birthYear', year - 40], ['until', 50], ['gross', 3000],
    ['have2', 20000], ['have3', 10000], ['p3', 1200], ['ret', 0]]) {
    await page.locator('#' + id).fill(String(value));
  }
  await page.locator('#rate').selectOption('0.02');
  await expect(page.locator('#out .stat b').first()).toHaveText('€63,600');
  await page.locator('#until').fill('40');
  await expect(page.locator('#out .stat b').first()).toHaveText('€30,000');
}

for (const mode of ['project-subpath', 'offline-files']) {
  test(`${mode}: all published pages load and calculators remain interactive`, async ({ page, context, isMobile }) => {
    const errors = [], failed = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => failed.push(request.url()));
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    const urlFor = mode === 'offline-files'
      ? name => new URL('../../' + name, import.meta.url).href
      : name => prefix + name;
    if (mode === 'offline-files') await context.setOffline(true);

    for (const name of pages) {
      await page.goto(urlFor(name));
      await expect(page.locator('h1')).toBeVisible();
      // Missing CSS can leave otherwise functional HTML looking unstyled.
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim())).not.toBe('');
      expect(await page.locator('.sidebar').evaluate(el => getComputedStyle(el).position)).toBe('fixed');
    }
    await exerciseCalculators(page, urlFor);

    // Exercise actual relative navigation, not just direct goto URLs.
    await page.goto(urlFor('guide/sources.html'));
    await page.locator(isMobile ? '.mobile-brand' : '.sidebar .brand').click();
    expect(new URL(page.url()).pathname).toContain('index.html');
    await expect(page.locator('h1')).toBeVisible();
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
    if (mode === 'offline-files') expect(requests).toEqual([]);
    else {
      expect(requests.length).toBeGreaterThan(0);
      for (const url of requests) expect(new URL(url).pathname.startsWith(prefix)).toBe(true);
      // Check the default project document and deployment allowlist too.
      expect((await page.request.get(prefix)).status()).toBe(200);
      for (const path of ['src/state.js', 'ROADMAP.md', '.git/config', 'private/example.json']) {
        expect((await page.request.get(prefix + path)).status()).toBe(404);
      }
    }
  });
}

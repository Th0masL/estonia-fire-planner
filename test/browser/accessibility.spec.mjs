import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { exampleState, encodeState } from '../../src/state.js';

for (const route of ['index.html', 'simulator.html', 'pension.html', 'guide/sources.html']) {
  test(`${route}: automated accessibility and narrow reflow`, async ({ page }, testInfo) => {
    const plan = exampleState();
    plan.persons[0].name = 'Person1';
    await page.goto('/' + route + (route === 'simulator.html' ? '#d=' + encodeState(plan) : ''));
    if (route === 'simulator.html') {
      await page.getByRole('region', { name: 'Retirement cash-flow schedule' }).focus();
      await expect(page.getByRole('region', { name: 'Retirement cash-flow schedule' })).toBeFocused();
      await page.evaluate(() => scrollTo(0, 0));
    }
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await testInfo.attach('accessibility-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.setViewportSize({ width: 320, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const narrow = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(narrow.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.locator('#menu').click();
    await expect(page.locator('#sidebar')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath('narrow-reflow.png') });
  });
}

import { test, expect } from '@playwright/test';
import { RATES } from '../../src/rates.js';

for (const route of ['simulator.html', 'pension.html']) {
  test(`${route} distinguishes projection year from fixed rule metadata`, async ({ page }) => {
    await page.clock.install({ time: new Date(`${RATES.year}-12-31T12:00:00Z`) });
    await page.goto('/' + route);
    const status = page.locator('#ruleYearStatus');
    await expect(status).toContainText(`Projection starts in ${RATES.year}.`);
    await expect(status).not.toHaveClass('alert');
    // Trigger normal rendering after rollover without a reload or rule update.
    await page.clock.setSystemTime(new Date(`${RATES.year + 1}-01-02T12:00:00Z`));
    await page.locator(route === 'simulator.html' ? '#aReturn' : '#ret').fill('4');
    await expect(status).toHaveClass('alert');
    await expect(status).toContainText(`Projection starts in ${RATES.year + 1}.`);
    await expect(status).toContainText(`Loaded rule set: ${RATES.year}.`);
    await expect(status).toContainText(`Recorded baseline review: ${RATES.lastVerified}`);
    await expect(status).toContainText('not been established here as applicable');
    await page.reload();
    await expect(status).toHaveClass('alert');
    await expect(status).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

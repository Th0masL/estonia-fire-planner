import { test, expect } from '@playwright/test';

const paths = ['/index.html', '/simulator.html', '/pension.html', '/guide/sources.html'];

async function expectScheme(page, scheme) {
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(scheme);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', scheme === 'dark' ? '#0f1320' : '#f6f8fb');
}

async function openNavigation(page, isMobile) {
  if (!isMobile) return;
  const menu = page.getByRole('button', { name: 'Toggle navigation', exact: true });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
}

for (const path of paths) {
  test(`${path}: theme follows System, persists overrides and works from keyboard`, async ({ page, isMobile }, testInfo) => {
    const initial = testInfo.project.use.colorScheme;
    const opposite = initial === 'dark' ? 'light' : 'dark';
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(path);
    await expectScheme(page, initial);
    await expect(page.locator('[data-theme-choice="system"]')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('fa-theme'))).toBeNull();
    await page.emulateMedia({ colorScheme: opposite });
    await expectScheme(page, opposite);

    await openNavigation(page, isMobile);
    const light = page.locator('[data-theme-choice="light"]');
    await light.focus();
    await page.keyboard.press('Space');
    await expect(light).toHaveAttribute('aria-pressed', 'true');
    await expectScheme(page, 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expectScheme(page, 'light');
    await page.reload();
    await expectScheme(page, 'light');
    expect(await page.evaluate(() => localStorage.getItem('fa-theme'))).toBe('light');

    await openNavigation(page, isMobile);
    await light.focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-theme-choice="system"]')).toBeFocused();
    await page.keyboard.press('Tab');
    const dark = page.locator('[data-theme-choice="dark"]');
    await expect(dark).toBeFocused();
    await page.keyboard.press('Enter');
    await expectScheme(page, 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expectScheme(page, 'dark');
    await page.reload();
    await expectScheme(page, 'dark');

    await openNavigation(page, isMobile);
    const system = page.locator('[data-theme-choice="system"]');
    await system.focus();
    await page.keyboard.press('Enter');
    await expectScheme(page, 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expectScheme(page, 'dark');
    await expect(system).toHaveAttribute('aria-pressed', 'true');
    if (isMobile) {
      await page.keyboard.press('Escape');
      await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'false');
    }
    // The same preference must apply on another route, not just after reload.
    await page.goto(path === '/index.html' ? '/guide/sources.html' : '/index.html');
    await expectScheme(page, 'dark');
    await expect(page.locator('[data-theme-choice="system"]')).toHaveAttribute('aria-pressed', 'true');
    expect(errors).toEqual([]);
  });
}

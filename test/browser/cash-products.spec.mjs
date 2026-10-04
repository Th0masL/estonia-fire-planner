import { test, expect } from '@playwright/test';

test('market cash guide is navigable and keeps risks beside product examples', async ({ page }, testInfo) => {
  await page.goto('/guide/brokers.html#market-products-for-temporary-cash');
  await expect(page.getByRole('heading', { name: 'Market products for temporary cash' })).toBeVisible();
  const comparison = page.locator('table').filter({ hasText: 'Vanguard EUR Cash UCITS ETF' });
  await expect(comparison).toContainText('Counterparty risk');
  await expect(comparison).toContainText('Credit and liquidity risks');
  await expect(page.locator('main')).toContainText('IE000SOORXS0');
  await expect(page.locator('main')).toContainText('None of these fund units has the bank-deposit guarantee.');
  await comparison.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('market-cash-products.png') });
  await page.goto('/guide/brokers.html#does-a-short-holding-period-cover-the-costs');
  await expect(page.getByRole('heading', { name: 'Does a short holding period cover the costs?' })).toBeVisible();
  const costs = page.locator('table').filter({ hasText: 'Remaining after those commissions alone' });
  await expect(costs).toContainText('€44');
  await costs.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('market-cash-costs.png') });
});

test('cash guidance separates investment risks and tax deferral', async ({ page }, testInfo) => {
  await page.goto('/guide/brokers.html#deposits-and-funds-do-different-jobs');
  await expect(page.getByRole('heading', { name: 'Deposits and funds do different jobs' })).toBeVisible();
  await page.locator('table').nth(1).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('cash-products.png') });
  await page.goto('/guide/property.html#where-the-down-payment-should-sit');
  await page.locator('table').first().evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(page.getByText('Tax deferral is not tax-free interest.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('purchase-reserve.png') });
});

test('cash comparison explains benchmarks, offer conditions and deposit protection', async ({ page }, testInfo) => {
  await page.goto('/guide/brokers.html#ecb-rates-str-and-xeon-in-plain-language');
  const heading = page.getByRole('heading', { name: 'ECB rates, €STR and XEON in plain language' });
  await expect(heading).toBeVisible();
  await expect(page.getByText('XEON is not covered by the €100,000 bank-deposit guarantee.', { exact: true })).toBeVisible();
  await page.goto('/guide/brokers.html#compare-bank-savings-products-in-estonia');
  const comparison = page.locator('table').filter({ hasText: 'LHV Savings Account' });
  await expect(comparison).toContainText('1.65%');
  await expect(comparison).toContainText('0.5%, minimum €1.60');
  await expect(comparison).toContainText('31 December 2026');
  await expect(comparison.getByRole('row').filter({ hasText: 'Swedbank' })).toContainText('Not verified');
  await expect(page.getByText('The 3% is annualized', { exact: false })).toBeVisible();
  await comparison.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('bank-comparison.png') });
  await page.goto('/guide/protection.html#is-my-parked-cash-covered');
  await expect(page.getByRole('heading', { name: 'Is my parked cash covered?' })).toBeVisible();
  await expect(page.getByText('No €100,000 deposit guarantee for those units.', { exact: true })).toBeVisible();
  await expect(page.locator('main')).toContainText('€3,000 is above the ordinary');
  await page.getByRole('heading', { name: 'Is my parked cash covered?' }).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('parked-cash-protection.png') });
});

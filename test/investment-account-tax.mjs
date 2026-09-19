import assert from 'node:assert/strict';
import { contributeInvestmentAccount as contribute, withdrawInvestmentAccount as withdraw,
  investmentAccountPriceLevel as priceLevel, contributeRealInvestmentAccount as contributeReal,
  withdrawRealInvestmentAccount as withdrawReal }
  from '../src/investment-account-tax.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} vs ${b}`);
const original = Object.freeze({ balance: 200000, allowance: 100000 });
let result = withdraw(original, 40000, .22);
assert.deepEqual(result.account, { balance: 160000, allowance: 60000 });
near(result.tax, 0);
result = withdraw(result.account, 99000, .22);
// 60k free + 50k taxable = 110k gross; tax 11k; spending 99k.
near(result.gross, 110000);
near(result.tax, 11000);
near(result.net, 99000);
near(result.shortfall, 0);
assert.deepEqual(result.account, { balance: 50000, allowance: 0 });
result = withdraw(result.account, 40000, .22);
near(result.net, 39000);
near(result.shortfall, 1000);
near(result.account.balance, 0);

// Market loss does not consume allowance. Recovery is not a contribution.
const loss = { balance: 50000, allowance: 100000 };
assert.deepEqual(withdraw(loss, 60000, .22).account, { balance: 0, allowance: 50000 });
const recovered = { ...loss, balance: 120000 };
near(withdraw(recovered, 100000, .22).tax, 0);
assert.deepEqual(contribute(loss, 10000), { balance: 60000, allowance: 110000 });
// Each owner's allowance stays separate; no household pooling.
const person1 = { balance: 10000, allowance: 20000 };
const person2 = { balance: 10000, allowance: 0 };
near(withdraw(person2, 7800, .22).tax, 2200);
assert.deepEqual(person1, { balance: 10000, allowance: 20000 });
near(withdraw(person2, 10000, 0).net, 10000);
assert.deepEqual(withdraw(original, 0, .22).account, original);
// Ledger ordering matters: later deposits cannot undo an earlier taxable exit.
near(withdraw(contribute(person2, 5000), 5000, .22).tax, 0);
const exit = withdraw(person2, 5000, .22);
assert.ok(exit.tax > 0);
near(contribute(exit.account, 5000).allowance, 5000);
for (const bad of [-1, NaN, Infinity]) {
  assert.throws(() => withdraw({ balance: bad, allowance: 0 }, 0, .22), RangeError);
  assert.throws(() => contribute({ balance: 0, allowance: bad }, 1), RangeError);
  assert.throws(() => withdraw(original, bad, .22), RangeError);
  assert.throws(() => withdraw(original, 1, bad), RangeError);
}
assert.throws(() => withdraw(original, 1, 1), RangeError);
// Deterministic reconciliation across different rates, balances and allowances.
for (const balance of [0, 100, 10000]) for (const allowance of [0, 50, 20000]) {
  for (const requested of [0, 25, 100, 15000]) for (const rate of [0, .22, .4]) {
    const r = withdraw({ balance, allowance }, requested, rate);
    near(r.account.balance + r.net + r.tax, balance);
    near(r.net + r.shortfall, requested);
    near(r.account.allowance, Math.max(0, allowance - r.gross));
    assert.ok(r.account.balance >= 0 && r.tax >= 0 && r.shortfall >= 0);
  }
}
console.log('Investment-account ledger: ordered contributions, gross-up, shortfalls, losses and ownership passed');

// At twice the base-year price level, 60k nominal allowance shelters 30k real.
// Spending 69k real needs 80k real gross: 30k free + 50k taxable; tax 11k real.
const realOpening = Object.freeze({ balanceReal: 100000, allowanceNominal: 60000 });
const realWithdrawal = withdrawReal(realOpening, 69000, .22, 2);
near(realWithdrawal.grossReal, 80000);
near(realWithdrawal.taxReal, 11000);
near(realWithdrawal.netReal, 69000);
near(realWithdrawal.account.balanceReal, 20000);
near(realWithdrawal.account.allowanceNominal, 0);
const limited = withdrawReal({ ...realOpening, balanceReal: 70000 }, 69000, .22, 2);
near(limited.netReal, 61200);
near(limited.shortfallReal, 7800);

// Moving between dates doesn't re-index the allowance, even with no real loss.
let realLedger = contributeReal({ balanceReal: 0, allowanceNominal: 0 }, 10000, 1);
realLedger = contributeReal(realLedger, 10000, 2);
assert.deepEqual(realLedger, { balanceReal: 20000, allowanceNominal: 30000 });
const later = withdrawReal(realLedger, 10000, .22, 4);
near(later.grossReal, 7500 + 2500 / .78);
near(later.account.allowanceNominal, 0);

for (const inflation of [0, .02, -.02]) for (const years of [0, .5, 10]) {
  const factor = priceLevel(inflation, years);
  near(factor, (1 + inflation) ** years);
  const opening = { balanceReal: 100000, allowanceNominal: 150000 };
  const deposited = contributeReal(opening, 3000, factor);
  near(deposited.balanceReal, 103000);
  near(deposited.allowanceNominal, 150000 + 3000 * factor);
  const r = withdrawReal(deposited, 90000, .22, factor);
  near(r.account.balanceReal + r.netReal + r.taxReal, deposited.balanceReal);
  near(r.netReal + r.shortfallReal, 90000);
  near(r.account.allowanceNominal, Math.max(0, deposited.allowanceNominal - r.grossReal * factor));
}
near(priceLevel(.21, .5), 1.1);
const noInflation = withdrawReal(realOpening, 69000, .22, 1);
const nominalEquivalent = withdraw({ balance: 100000, allowance: 60000 }, 69000, .22);
near(noInflation.taxReal, nominalEquivalent.tax);
for (const bad of [0, -1, NaN, Infinity]) {
  assert.throws(() => withdrawReal(realOpening, 1, .22, bad), RangeError);
  assert.throws(() => contributeReal(realOpening, 1, bad), RangeError);
}
for (const bad of [-1, NaN, Infinity]) {
  assert.throws(() => priceLevel(bad, 1), RangeError);
  assert.throws(() => priceLevel(.02, bad), RangeError);
}
assert.throws(() => priceLevel(1, 2000), RangeError);
assert.throws(() => priceLevel(-.99, 2000), RangeError);
assert.throws(() => contributeReal(realOpening, Number.MAX_VALUE, 2), RangeError);
assert.throws(() => withdrawReal(realOpening, Number.MAX_VALUE, .22, 2), RangeError);
console.log('Real/nominal adapters: inflation, fractional dates, deflation, dated deposits and tax reconciliation passed');

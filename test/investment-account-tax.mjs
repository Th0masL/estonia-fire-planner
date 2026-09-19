import assert from 'node:assert/strict';
import { contributeInvestmentAccount as contribute, withdrawInvestmentAccount as withdraw }
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

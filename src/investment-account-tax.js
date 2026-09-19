// Preparatory nominal-euro ledger; deliberately NOT wired into simulate().
// One ledger aggregates one taxpayer's investment accounts, never a household.
// See INVESTMENT-ACCOUNT-TAX.md for sources, approximations and integration gates.
const nonnegative = (value, name) => {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and nonnegative`);
};
const validate = ({ balance, allowance }) => {
  nonnegative(balance, 'balance');
  nonnegative(allowance, 'allowance');
};

export function contributeInvestmentAccount(account, amount) {
  validate(account);
  nonnegative(amount, 'amount');
  const next = { balance: account.balance + amount, allowance: account.allowance + amount };
  validate(next);
  return next;
}

// Planning convention: withdraw enough for spending AND a tax reserve outside
// the wrapper immediately. This is not a statutory withholding/payment date.
// Personal deductions, credits and already-taxed income are outside this helper.
export function withdrawInvestmentAccount(account, requestedNet, taxRate) {
  validate(account);
  nonnegative(requestedNet, 'requestedNet');
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate >= 1) {
    throw new RangeError('taxRate must be between zero (inclusive) and one (exclusive)');
  }
  const taxFree = Math.min(requestedNet, account.allowance);
  const requiredGross = taxFree + (requestedNet - taxFree) / (1 - taxRate);
  const gross = Math.min(account.balance, requiredGross);
  const taxable = Math.max(0, gross - account.allowance);
  const tax = taxable * taxRate;
  const net = gross - tax;
  return {
    account: { balance: account.balance - gross, allowance: Math.max(0, account.allowance - gross) },
    gross, taxable, tax, net, shortfall: Math.max(0, requestedNet - net),
  };
}

# Investment-account tax integration specification

Status: tested accounting foundation only. `investment-account-tax.js` is not
imported by the simulator or bundled into the website. Existing results, saved
plans and return assumptions are unchanged. Integration below is proposed, not
an implemented or fully verified tax-return model.

## Verified rule and scope

[EMTA: securities and investment account](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account),
sections “How are taxable gains calculated” and “What are investment account
contributions and payments”; checked 20 September 2026, page updated 3 February 2026.

Withdrawals exceeding unused contributions create taxable income. Accounting is
transaction-ordered, aggregated across one taxpayer's investment accounts—not
across spouses. Transfers between that taxpayer's investment accounts and
internal asset transactions are not ordinary external contributions/withdrawals.
Already-taxed receipts may affect the contribution balance. The system is for
Estonian resident taxpayers; residency changes require separate treatment.

The helper models only external cash deposits and withdrawals at an explicitly
supplied flat rate. It does not determine asset eligibility, residency, personal
exemptions, credits, withholding, special receipts, or actual tax-payment dates.

## Accounting contract

One immutable input ledger per person: `{ balance, allowance }`, both in nominal
euros at the event date. `balance` means total wrapper value available to liquidate,
not just bank cash. `allowance` is the unused contribution balance from records;
it may exceed market value following losses. Returns change value, not allowance.

- External deposit: increase value and allowance by the same nominal amount.
- Internal sale/reinvestment or own-wrapper transfer: no allowance event.
- Withdrawal: reduce value by gross withdrawal and allowance by the lesser of
  gross withdrawal and remaining allowance. Taxable amount is the excess.
- Never let a later contribution retrospectively offset an earlier taxable exit.
- Never pool allowances between people. Household funding order belongs in the
  integration layer, which must retain the selected owner of each cash flow.

Planning convention: reserve the modeled tax outside the wrapper immediately,
funded by the same withdrawal. This is **not statutory immediate withholding**.
For net spending N, allowance A and rate t, required gross withdrawal is
`min(N,A) + max(0,N-A)/(1-t)`. Cap the withdrawal at available value and report any
unfunded net spending. The reserve is excluded from spendable assets; do not later
charge the liability again. Future integration may choose a dated payable ledger
instead, but must not mix the two conventions.

Synthetic example at a supplied 22% rate: allowance €60,000 and desired spending
€99,000 require a €110,000 withdrawal: €60,000 untaxed plus €50,000 taxable,
€11,000 reserved for tax. With only €100,000 available, net spending is €91,200
and the shortfall is €7,800. These are arithmetic examples, not personal tax advice.

## Migration gates before enabling

1. Preserve investment-account value separately from brokerage, crypto and cash
   in every projection path. Remove only the investment-account opening tax
   reserve when enabling explicit taxation. Do not tax a net-of-reserve balance
   again or imply transaction accuracy for the other wrappers.
2. Define where new investments go. Existing allocation shares select the owner,
   not the wrapper. Require an explicit wrapper policy; do not silently treat all
   historical brokerage/crypto holdings as investment-account assets.
3. Introduce an explicit pre-withdrawal-tax return assumption (after fees and
   inflation) for this wrapper. Legacy `realReturn` includes future tax drag;
   no unique pre-tax rate can be inferred from it. Preserve legacy plans in their
   existing model until the user reviews/accepts the new return semantics.
   Separate pension/other-wrapper returns as necessary; do not reinterpret them.
4. Keep tax allowance nominal. At time y with price factor `(1+inflation)^y`,
   convert real spending/value to nominal for the event and convert results back.
   Do not index unused allowance with inflation or consume real-euro spending
   directly against a nominal allowance. Cover fractional dates and zero inflation.
5. Apply the same withdrawal primitive to working deficits, home completion,
   retirement, reserve replenishment, coast and stress paths. Pension lump-sum
   reinvestment must follow the explicit wrapper allocation and correct owner.
   Cash held inside versus outside the wrapper must be distinguished.
6. Redesign minimum-capital scaling: changing hypothetical value must not
   silently scale recorded contribution allowance. Document the target's funding
   mix and hypothetical contribution history before changing the FI-number solver.
7. Version model semantics and saved data, disclose the selected model in exports
   and UI, and never silently upgrade an old share link to different tax behavior.

## Integration acceptance

Before rollout, reconcile each owner's opening value, external contributions,
gross withdrawals, taxable amount, tax reserve, spending, allowance and closing
value. Test two owners, losses/recovery, house purchase, deficits before FI, pension
receipts, protected reserves, inflation, partial years and shocks. Reconcile the
solver and displayed schedule independently. Browser tests must cover migration,
explicit return review, import/export/share links and disclosure of limitations.

The current unit suite checks ledger arithmetic only. It cannot establish that
the eventual household model, tax timing or real/nominal integration is correct.

# Investment-account tax integration specification

Status: enabled in the simulator and bundled for offline use. Investment accounts
now retain gross opening value and pay modeled withdrawal tax instead of an
opening latent-tax reserve. This is a planning model, not a tax-return calculator.
No legacy calculation mode is maintained, by product decision. Schema version 3
adds the separate ordinary-investment return and per-person investment destination.

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

## Real-euro integration

### Implemented real/nominal adapter

The isolated ledger now also accepts `{ balanceReal, allowanceNominal }` through
`contributeRealInvestmentAccount` and `withdrawRealInvestmentAccount`. Supply the
price level for the actual cash-flow date; `investmentAccountPriceLevel` computes
`(1 + inflation)^years`, including fractional years. All returned cash-flow fields
end in `Real`; the remaining allowance explicitly stays `allowanceNominal`.

The adapter converts value and the requested payment to nominal euros, applies
the nominal ledger, and converts value and cash flows back. It never indexes the
allowance. At a price level of 2, a €60,000 nominal allowance covers only €30,000
of real spending. A €69,000 real spending request at a supplied 22% rate needs
€80,000 real gross withdrawal, including €11,000 real tax reserve. No new deposit
or return is inferred merely because the event date changes.

Tests cover zero/positive inflation, deflation, fractional dates, deposits at
different price levels, depleted accounts and reconciliation in both units.
Invalid or unrepresentable price levels/converted amounts are rejected. Deflation
support is arithmetic capability, not a change to permitted UI assumptions.
Callers remain responsible for applying investment returns between events and
for choosing event dates; this adapter does not choose annual/monthly timing.

### Integration policy

1. Each owner's gross investment-account value and nominal allowance remain
   separate from external cash and ordinary invested assets. Brokerage/crypto
   retain their opening gains-tax reserves and after-tax return approximation.
2. `investmentDestination` defaults to `investmentAccount`; the UI allows ordinary
   `brokerage` instead. It routes new savings and invested pension lump sums,
   without changing ownership shares or moving existing holdings.
3. `realReturn` means after fees/inflation, before investment-account withdrawal
   tax, and also applies to pension funds. `brokerageRealReturn` is separately
   entered after expected tax drag. No old return is mathematically converted.
4. Each bucket carries elapsed time. Working deposits/deficits are annual-end
   events (with fractional final periods); retirement spending is at period start,
   split at pension receipts. Nominal allowance uses each event's price level.
   Partial-period positive savings retain the existing annuity growth convention;
   allowance increases only by the actual principal contribution.
5. Household spending uses external cash above the protected reserve first.
   Remaining net needs are divided among owners proportional to net-liquidatable
   invested assets. Within each owner, ordinary investments precede investment
   accounts. Allowances never cross owners. Home funding honors the selected payer
   first, with others covering any remaining net need. Cash top-ups are taxable
   wrapper exits, not cost-free reclassification.
6. FI-date checks use actual projected accounts. The minimum-capital target scales
   projected cash and invested values proportionally but holds recorded allowance
   fixed. It answers what capital suffices with that mix and contribution history,
   not what a new saver with no history needs. Capital-floor checks use net
   liquidation value after modeled investment-account tax. Schedule values are
   gross remaining holdings; the tax column shows annual real-euro reserves.
7. Stress changes exposed asset values and returns but never contribution
   allowance. Pension reinvestments add allowance at receipt. No legacy mode or
   upgrade prompt is retained; all plans use the current model.

## Integration acceptance

Before rollout, reconcile each owner's opening value, external contributions,
gross withdrawals, taxable amount, tax reserve, spending, allowance and closing
value. Test two owners, losses/recovery, house purchase, deficits before FI, pension
receipts, protected reserves, inflation, partial years and shocks. Reconcile the
solver and displayed schedule independently. Browser tests must cover migration,
explicit return review, import/export/share links and disclosure of limitations.

The integration suite reconciles independent zero-return retirement targets,
annual tax, home affordability, reserves, owner separation, dated deposits and
deficits. Existing coast/pension/stress suites use the shared withdrawal path.
Browser tests cover visible annual tax, destination changes and persisted returns.

Remaining limitations: wrapper holdings are modeled entirely invested; separate
idle wrapper cash is not supported. Asset eligibility, already-taxed receipts,
personal exemptions/credits, foreign withholding, residency changes and actual
tax-payment dates are not inferred. The immediate external reserve convention is
conservative timing, not a filing/payment forecast. Ordinary brokerage/crypto
remain approximations. Annualized spending is not a monthly liquidity forecast.
Future tax law is unknown; the model holds the entered rule set constant.

Rate reference: [EMTA tax rates](https://www.emta.ee/en/private-client/taxes-and-payment/declaration-income/tax-rates),
2026 section checked 20 September 2026; the engine's current flat rate is 22%.

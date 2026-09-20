# FatFIRE

FatFIRE is an informal label for a higher-spending retirement, not a verified
Estonian budget band. Separate essential spending from discretionary goals and
compare your own scenarios in the [calculator](../simulator.html).

> **Limited review — 20 September 2026:** the tables below are conditional
> arithmetic, not forecasts or withdrawal-success estimates. Local lifestyle
> costs, future returns, individual tax outcomes and an optimal strategy remain
> unverified.

## Illustrative spending targets

For this table only, divide ongoing annual spending by an assumed initial
withdrawal rate. All amounts are in today's purchasing power; targets are rounded
to the nearest euro.

| Ongoing annual spending | Baseline at 3.5% | Baseline at 4% |
|---|---:|---:|
| €30,000 | €857,143 | €750,000 |
| €50,000 | €1,428,571 | €1,250,000 |
| €100,000 | €2,857,143 | €2,500,000 |
| €150,000 | €4,285,714 | €3,750,000 |

These are baseline spending multiples, not the simulator's complete FI targets.
The example excludes pension benefits, other income, withdrawal taxes, protected
cash and dated liabilities. In a real plan, fund mortgage payments and child costs
for their actual duration; do not simply exclude them. Include continuing housing
costs after a mortgage ends and healthcare for the actual uncovered period.

Both withdrawal rates are assumptions. See the
[withdrawal-research limitations](fire-basics.md#safe-withdrawal-rate--what-the-research-can-tell-us).

## How long a fixed saving amount takes

Assume zero starting assets, €60,000 invested at each year-end, a constant 5%
annual real return after investment costs, no further tax drag, and no withdrawals.
The target is the unrounded 3.5% baseline above, held constant in real terms.

```
balance after n years = 60,000 × ((1.05^n - 1) / 0.05)
formula years = ln(1 + target × 0.05 / 60,000) / ln(1.05)
```

| Annual spending target | Formula years | First completed saving year |
|---|---:|---:|
| €30,000 | 11.05 | 12 |
| €50,000 | 16.07 | 17 |
| €100,000 | 24.97 | 25 |
| €150,000 | 31.15 | 32 |

Formula years interpolate the annual model; they are not monthly FI dates.
The completed year is the first year-end contribution at which the target is
reached. At zero return, the corresponding formula is simply target / annual saving.

In this model, doubling spending from €50k to €100k doubles the target but raises
formula time from 16.07 to 24.97 years, **less than double**. Compounding explains
the difference. If higher current spending also reduces saving, that is a
different scenario; recalculate both inputs rather than assuming the same result.

## What the budget includes

An illustrative €100k annual budget averages about €8,333/month. Paying off a
mortgage does not make this “everything except housing”: maintenance, utilities,
insurance, taxes and future repairs may remain. Define the included costs before
comparing lifestyles.

No Tallinn-versus-Paris-or-London price comparison has been verified here.
Relocation needs a new budget and tax/healthcare review, not just a currency
conversion. See [location choices](strategy-levers.md#9-geographic-arbitrage).

## Spending now versus spending in retirement

Assume current spending is €4,000/month, net income is unchanged, and an increase
starts now and continues permanently into retirement. Then the extra spending
both reduces annual saving and raises the simple 3.5% baseline:

| New monthly spending | Extra per month | Baseline target increase | Annual saving reduction |
|---|---:|---:|---:|
| €5,000 | €1,000 | €342,857 | €12,000 |
| €6,000 | €2,000 | €685,714 | €24,000 |
| €8,000 | €4,000 | €1,371,429 | €48,000 |

This does not quantify the FI-date delay. Temporary spending, a retirement-only
increase, changing income or insufficient surplus require different cash flows.
Higher-spending retirement does not universally require low spending while
working; what matters is affordable saving and existing resources relative to
the chosen target.

## Choices to compare, not ranked shortcuts

### Additional earned income

€2,000/month of extra net income provides €24,000/year before related costs.
Subtract childcare, commuting, lost benefits and other changes. Another adult's
income is not automatically the largest lever or the preferred household choice.
Check [health coverage](health-insurance.md) and actual
[pension contributions and deduction capacity](pensions.md) separately; neither
is established merely by entering net income.

### Genuine business income and an OÜ

Retained company profit is not spendable personal wealth.
[EMTA's dividend guidance](https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/taxation-dividends)
sets the standard distribution tax at 22/78 of the net dividend from 2025, with
transitional exceptions. A comparison must include extraction, business costs,
appropriate remuneration and the same starting budget.

The old 15-year comparison of company assets with personal assets omitted that
reconciliation and confused a single starting sum with repeated annual saving.
It did not demonstrate a net advantage. Use the
[reconciled company examples](company.md), not an assumed 22% saving from
“restructuring” salary. The simulator has no corporate-account mode.

### Income growth and housing choices

Compare saving an affordable net raise with spending it. Model a proposed housing
upgrade using its deposit, debt, running costs and reserves. Neither keeping the
same home nor raising the savings rate is universally optimal.

[Investor.gov's allocation guidance](https://www.investor.gov/introduction-investing/getting-started/asset-allocation)
relates investment choices to time horizon and risk tolerance. Different goals
can require different liquidity and risk choices now, not only near retirement.

## Withdrawal assumptions and risk

For €100k/year, the 3.5% and 4% baselines differ by approximately **€357,143**.
That is a capital difference, not a verified four-year work extension. Its effect
on the date depends on current assets, saving, returns and the rest of the plan.

A shorter horizon can change a withdrawal analysis, but a higher-spending label
or later retirement does not establish that a higher rate is safe. Test the
actual horizon, spending flexibility, taxes and pensions.

A larger portfolio can improve the margin if spending is held fixed; scaling
both spending and assets proportionally does not by itself remove sequence risk.
Losses later in retirement can still matter. See [risks and blind spots](risks.md).
Neither this guide nor constant-return arithmetic supplies a success probability.

## Investment-account allowance is a ledger, not wealth

[EMTA's investment-account guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account)
calculates taxable payments chronologically across the same taxpayer's accounts.
Portfolio market value does not establish remaining contribution allowance.

For example, a €2.86M portfolio with **€1.5M of remaining declared allowance**
could support €1.5M of qualifying outward payments before that allowance is
exhausted, assuming no intervening changes and continued eligibility. Previously
used contributions cannot be counted again; partners have separate ledgers.
This is a tax-deferral illustration, not guaranteed spending capacity.

Losing Estonian tax residence ends this deferral and requires a closure
declaration and settlement of the resulting Estonian tax liability; it does not
necessarily require closing the bank account. See the
[investment-account guide](investment-account.md). Destination-country outcomes
and future law remain unverified.

## A practical comparison

1. Define essential spending and optional goals, including irregular costs.
2. Compare complete scenarios at several spending levels, not just target multiples.
3. Check bridge funding, protected cash, pensions and eventual fund exhaustion.
4. Stress income, returns, longevity and spending; revisit material life changes.

CoastFIRE can be another scenario, not a mandatory first milestone. More work for
more discretionary spending is a preference to evaluate, not a mathematically
superior form of retirement.

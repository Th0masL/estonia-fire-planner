# FIRE fundamentals

> **Limited review, 20 September 2026:** the arithmetic below is conditional and the cited rule/research explanations have limited scope. Historical results and constant-return examples are not forecasts; no withdrawal rate or FIRE label establishes personal readiness.

## The one equation

A simple starting-point target, before dated cash flows and other model adjustments, is:

```
portfolio_value × safe_withdrawal_rate ≥ annual_spending
```

Rearranged, the **baseline FI number** (not a guarantee of sustainability):

```
FI_number = annual_spending / SWR
```

At a 4% SWR that's **25× annual spending**. At 3.5% it's **28.6×**. At 3.25% it's **30.8×**.

## How spending and income affect the target

A permanent spending reduction can both lower the baseline target and increase
saving, if income stays unchanged. At an assumed 4% withdrawal rate, cutting
€500 per month reduces annual spending by **€6,000**, lowers the simple target
by **€150,000**, and frees €6,000 per year to save. Temporary cuts do not justify
reducing lifelong spending by the same amount.

An extra €500 per month of **net** income also adds €6,000 to annual saving if
none is spent, but does not by itself lower the target. A gross pay rise needs
a separate payroll calculation. There is no universal “one-third as effective”
comparison: tax, spending choices and starting assets matter.

## Savings rate in a simplified model

Assume zero starting investments, constant real take-home income and spending,
a **5% annual real return**, **4% withdrawal assumption**, and saving invested
at each **year-end**. Returns are assumed net of investment costs, with no
additional tax drag. There are no pensions, debts, income gaps or dated expenses.

With savings fraction `s`, return `r` and withdrawal rate `w`:

```
target / annual_saving = (1 - s) / (w × s)
n = ln(1 + r × (1 - s) / (w × s)) / ln(1 + r)
```

| Savings rate | Formula years | First completed saving year reaching target |
|---:|---:|---:|
| 10% | 51.4 | 52 |
| 20% | 36.7 | 37 |
| 30% | 28.0 | 28 |
| 40% | 21.6 | 22 |
| 50% | 16.6 | 17 |
| 60% | 12.4 | 13 |
| 70% | 8.8 | 9 |
| 80% | 5.6 | 6 |

Fractional formula years interpolate the annual model; they are not an exact
monthly FI date. For zero return the limit is `(1 - s) / (w × s)`; the displayed
log formula assumes a positive return and 0 < s < 1.

Income cancels only under these proportional assumptions. For example, two
people with different incomes but the same savings fraction have the same
formula result **in this model**. Existing assets, pension timing, minimum
living costs, taxes, contribution timing and changing spending can break that
equivalence. Use the simulator for the household's specified cash flows; the
table is not a forecast of its FI date.

## FIRE variants

These are informal planning labels, not standardized eligibility tests or
verified Estonian budget bands.

| Variant | Planning meaning | Check before relying on it |
|---|---|---|
| **LeanFIRE** | Fund a deliberately modest budget | Essential costs, dependants and room for shocks |
| **RegularFIRE** | Fund the intended ongoing lifestyle | Whether today's spending represents retirement |
| **FatFIRE** | Fund a higher discretionary budget | Separate essential spending from optional goals |
| **CoastFIRE** | Stop adding retirement savings while existing assets grow toward a future target | Current spending still needs funding; growth and target are assumptions |
| **BaristaFIRE** | Combine portfolio withdrawals with continuing work | Net earnings, reliability, hours and actual insurance eligibility |

**Coast illustration:** €200,000 growing at a constant 5% real for 30 years,
with no additions or withdrawals, becomes approximately **€864,388** in today's
purchasing power. This assumes no further costs or taxes outside the return.
It is compound arithmetic, not a guarantee or evidence that this amount meets
a particular retirement target.

**Work and health coverage:** a small salary alone does not establish coverage.
[Tervisekassa's employee guidance](https://tervisekassa.ee/en/employee-employment-contract),
checked 20 September 2026, describes qualifying employment contracts and social-tax
conditions, including commencement rules. Confirm your actual status and contract
type; see [health insurance](health-insurance.md). BaristaFIRE is not an automatic
insurance solution.

## Safe withdrawal rate — what the research can tell us

### Initial withdrawal rate is not a percentage of every year's balance

[William Bengen's own explanation](https://www.bengenfs.com/the-4-percent-rule/)
links the rule to his October 1994 historical-return research. The method takes
a percentage of the initial portfolio, then adjusts that **cash amount** for
inflation. It does not recalculate the same percentage of the current balance
each year. Bengen also cautions that the original finding was not a recommendation
that every retiree use one number.

**Illustration:** 4% of €500,000 is €20,000 in year one. With an assumed 2%
inflation adjustment, year two's withdrawal is €20,400 regardless of the
portfolio's intervening market value. Withdrawing 4% of the then-current balance
is a different rule, with variable spending.

### Historical survival is not a personal success probability

Bengen's retrospective describes historical returns and inflation, not a
probabilistic forecast for an Estonian household. The previous guide incorrectly
combined Bengen and Trinity under one dataset and assumption list.

[Karsten Jeske's research overview](https://earlyretirementnow.com/safe-withdrawal-rate-series/)
discusses longer horizons, valuations, fees, additional cash flows and bequests.
His cited 3.25–3.50% results refer to historical scenarios, not a verified future
success probability for this planner. He also warns against transferring
historical cohort success rates directly to a particular household.

**Still unverified:** this review has not reproduced the original Trinity tables,
Pfau's international results or an Estonia-specific withdrawal backtest.
The former claims about the best-performing market, exact failure rates and a
universally suitable 3.25–3.5% range are not retained as established facts.

For any study, check the return series, currency, inflation measure, asset mix,
rebalancing, fees, taxes, withdrawal timing, horizon and definition of success.
Finishing a finite test with a positive balance is not the same as preserving
purchasing power indefinitely or funding a longer retirement.

**Inflation basket.** A household's spending need not track an aggregate price
index. The [ECB's 2% target](https://www.ecb.europa.eu/mopo/strategy/pricestab/html/index.en.html)
concerns the euro area over the medium term, not a household forecast. Test
several assumptions; this guide has not established 2.5–3% as a sufficient range
for every Estonian plan. See [inflation risk](risks.md#estonian-inflation--eurozone-inflation).

**Planning stance:** compare several withdrawal assumptions alongside the actual
spending schedule, taxes and pension cash flows. This simulator's selected rate
is an input, not a calibrated probability of success. Retirement at 45 through
95 means a 50-year horizon; change the dates to match your plan rather than
assuming a 30-year study covers it.

## Sequence-of-returns risk

The order of returns matters when money is withdrawn; see the
[worked example](risks.md#sequence-of-returns-risk). Early losses can be damaging,
but a late crash is not automatically harmless. Jeske's
[research overview](https://earlyretirementnow.com/safe-withdrawal-rate-series/)
explicitly warns that sequence risk can persist beyond the often-quoted first
five to ten years.

Possible responses include spending flexibility, realistic earned income,
accessible reserves and an allocation suited to the horizon and loss tolerance.
Each has limits: essential spending may not be reducible, work may be unavailable
and cash can be exhausted. A two- or three-year buffer does not guarantee that
equities never need to be sold after a loss.

Guardrails and changing allocations are strategies to evaluate under explicit
rules, not universally ranked improvements. This page does not establish their
relative effectiveness or say the simulator implements them.

## Accumulation vs decumulation are different problems

| Planning question | Accumulation | Decumulation |
|---|---|---|
| Cash flow | How much can be saved after costs? | What spending must the portfolio fund? |
| Market losses | Can saving continue through a downturn? | Can withdrawals be supported during losses? |
| Allocation | Match horizon, liquidity and loss tolerance | Reassess those needs as withdrawals start |
| Review | Savings, costs and progress | Spending, remaining assets and remaining horizon |

Neither phase has a universally correct equity allocation. A low purchase price
does not make volatility harmless, especially if income or liquidity also falls.

For Estonia, model the **bridge** using each person's actual pension access and
payment conditions, not fixed ages of 60 or 65. Accessible assets and other
available income must fund any shortfall before pensions start, and the portfolio
may need to cover spending again after finite pension payments end. See
[pension access and payouts](pensions.md#access-ages-and-payout-conditions).

## Reading list

- [Bengen's explanation of the rule](https://www.bengenfs.com/the-4-percent-rule/) — the author's retrospective, not a reproduction of the original paper.
- [Early Retirement Now's SWR series](https://earlyretirementnow.com/safe-withdrawal-rate-series/) — author research with scenario-specific assumptions; no universal rate endorsed here.
- [Sources & verification](verification.md) — scope of this project's checks and unresolved questions.

## Next

Tax and account treatment affect the cash available to spend; do not treat the simplified target as a complete plan. See the [investment-account guide](investment-account.md).

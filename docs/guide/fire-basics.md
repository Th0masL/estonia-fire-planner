# FIRE fundamentals

> **Partial review, 20 September 2026:** withdrawal-rule mechanics and the cited author explanations below were checked. Historical results are not forecasts. The earlier savings-rate, spending and FIRE-variant guidance still needs separate review.

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

## Why spending is the dominant variable

Spending appears on *both* sides of the problem, which is why it dwarfs every other lever:

1. It lowers the target (25× multiplier)
2. It raises the savings rate (which sets the timeline)

Cutting **€500/month** of recurring spend removes **€150,000** from your FI number at 4% — *and* adds {{pillar3.maxAnnual|money}}/year to savings. A €500/month raise, after 22% tax and typical lifestyle creep, does maybe a third as much.

## Time to FI is a function of savings rate, not income

Starting from zero, 5% real return, 4% withdrawal:

| Savings rate | Years to FI |
|---:|---:|
| 10% | ~51 |
| 20% | ~37 |
| 30% | ~28 |
| 40% | ~22 |
| 50% | ~17 |
| 60% | ~12.5 |
| 70% | ~8.5 |
| 80% | ~5.5 |

Income only matters through its effect on this ratio. Two people earning €3k and €10k net with the same 50% savings rate reach FI in the same number of years — they just live very different lives afterwards.

**The Estonian nuance:** the 22% flat income tax means marginal income can be unusually well-preserved compared with many progressive systems. High earners in Estonia may therefore be able to sustain comparatively high savings rates. This is a structural advantage worth quantifying — see [strategy-levers.md](strategy-levers.md).

## FIRE variants

| Variant | Definition | Fits when |
|---|---|---|
| **LeanFIRE** | Cover a minimal budget (~€1,200–1,800/mo in EE) | Low spend, high flexibility, no kids or grown kids |
| **RegularFIRE** | Cover current lifestyle | The default target |
| **FatFIRE** | Cover an expanded lifestyle (travel, property, no compromise) | High income, long runway |
| **CoastFIRE** | Portfolio is big enough that compounding alone reaches FI by traditional retirement age — you stop *saving*, keep working to cover current spend | Front-loaded savings; frees you to take a lower-paid, better job |
| **BaristaFIRE** | Portfolio covers most spend; part-time work covers the rest | **Especially strong in Estonia** — a small salary also keeps health insurance alive |

**CoastFIRE deserves attention.** As an illustration, €200k invested at 35 and compounding at 5% real becomes about €860k at 65 with zero further contributions. The point at which no further retirement saving is required can arrive *decades* before full FI.

**BaristaFIRE deserves more attention in Estonia specifically**, because the health insurance rules make "zero earned income" expensive. See the [health-insurance guide](health-insurance.md).

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

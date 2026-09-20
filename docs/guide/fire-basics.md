# FIRE fundamentals

## The one equation

You are financially independent when:

```
portfolio_value × safe_withdrawal_rate ≥ annual_spending
```

Rearranged, the **FI number**:

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

## Safe withdrawal rate — where the 4% rule breaks

The "4% rule" comes from the Trinity study and Bengen's 1994 work. Its assumptions:

- **US** stocks and bonds, **1926–1995**
- **30-year** horizon
- Fixed real withdrawals, no flexibility
- No fees, no taxes

Every one of these is wrong for a 40-year-old European.

**Horizon.** Retire at 45, plan to {{defaults.planToAge}} → 55 years, not 30. Failure rates rise sharply past 30 years. Karsten Jeske's (Early Retirement Now) SWR series puts a 50–60 year horizon closer to **3.25–3.5%** for a high success probability.

**Country.** The 4% figure is survivorship bias on the single best-performing large market of the 20th century. Wade Pfau's international work found SWRs below 4% for most developed markets, and well below for some. A globally diversified portfolio is the honest hedge, but it also means you shouldn't expect US-history returns.

**Inflation basket.** A household's spending need not track an aggregate price
index. The [ECB's 2% target](https://www.ecb.europa.eu/mopo/strategy/pricestab/html/index.en.html)
concerns the euro area over the medium term, not a household forecast. Test
several assumptions; this guide has not established 2.5–3% as a sufficient range
for every Estonian plan. See [inflation risk](risks.md#estonian-inflation--eurozone-inflation).

**Practical stance:** plan at **3.25–3.5%**, treat 4% as the optimistic case, and build in flexibility rather than trying to find the one true number. Flexibility is worth more than precision here.

## Sequence-of-returns risk

The single biggest threat, and the most misunderstood.

Two retirees with *identical* average returns over 30 years can have wildly different outcomes purely from the **order** those returns arrive in. A crash in years 1–5, while you're withdrawing, permanently destroys capital that never gets to participate in the recovery. The same crash in year 25 is nearly harmless.

Roughly: **the first ~10 years determine the outcome.** After that, you've usually pulled far enough ahead that failure is unlikely.

Mitigations, roughly in order of effectiveness:

1. **Flexible spending** — cutting withdrawals 10–20% in bad years does more than any asset allocation trick. This is the big one.
2. **Earned income in early retirement** — even €500/month of part-time work in a bad stretch changes everything (and see: health insurance).
3. **Cash / short-bond buffer** — 2–3 years of spending, so you never sell equities into a crash.
4. **Bond tent / rising equity glidepath** — hold *more* bonds at the retirement date, then spend them down and let equity share drift back up. Counterintuitive but well-supported.
5. **Dynamic withdrawal rules** — Guyton-Klinger guardrails, VPW, or CAPE-based rates instead of a fixed real amount.

## Accumulation vs decumulation are different problems

Worth separating explicitly, because good accumulation advice is often bad decumulation advice:

| | Accumulation | Decumulation |
|---|---|---|
| Enemy | Fees, taxes, behaviour | Sequence risk, inflation, longevity |
| Volatility is | Your friend (buying cheap) | Your enemy (selling cheap) |
| Right allocation | ~100% equities, simple | Glidepath, buffer, flexibility |
| Key metric | Savings rate | Withdrawal rate + flexibility |

In Estonia there's a third phase people forget — **the bridge**: from early retirement age to 60/65 when pension pillars unlock. That bridge has to be funded entirely from taxable/investment-account assets. Sizing it is a core planning step.

## Reading list

- **Early Retirement Now** — [SWR series](https://earlyretirementnow.com/safe-withdrawal-rate-series/). The most rigorous work on withdrawal rates. Long, worth it.
- **Big ERN's Google Sheet toolbox** — historical backtesting with configurable glidepaths
- **Bogleheads wiki** — [Non-US investor pages](https://www.bogleheads.org/wiki/Outline_of_non-US_domiciles) specifically
- **Wade Pfau**, *Retirement Planning Guidebook* — on glidepaths and annuities
- **Kogumispension / Rahandusministeerium** materials for the Estonian pension side
- r/EuropeFIRE, r/Eesti — for local reality checks, with the usual forum caveats

## Next

The math above is universal. What makes it *actionable* is the tax wrapper — and Estonia's is unusually useful. See the [investment-account guide](investment-account.md).

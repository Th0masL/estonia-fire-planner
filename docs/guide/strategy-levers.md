# Strategy levers, ranked by impact

Ordered by expected effect per unit of effort. The top three are worth more than everything below them combined.

---

## Tier 1 — the levers that actually decide the outcome

### 1. Savings rate

Everything in [fire-basics.md](fire-basics.md#time-to-fi-is-a-function-of-savings-rate-not-income) reduces to this. Going from 30% to 50% cuts ~11 years off the timeline. No portfolio optimisation, tax trick, or property deal comes close.

Two sub-levers, and they are not equally valued:

- **Cut recurring spend** — worth 25–30× its annual value, because it moves the target *and* the rate. Housing, cars, and subscriptions are where the money is. One-off purchases barely matter; recurring ones matter enormously.
- **Raise income** — worth ~78% of gross at Estonia's flat 22%, *if* you don't spend it. The flat tax makes marginal income unusually valuable here compared to progressive systems.

**Measure it before optimising it.** Most people are wrong about their own savings rate by 10+ percentage points. Three months of actual categorised data beats any amount of estimating.

### 2. Consider an OÜ for genuine business income

For genuinely independent consulting or contract revenue, routing income through an OÜ and **retaining it** can mean investing pre-distribution-tax euros rather than post-tax personal income. Compounding €100k instead of €60k for 20 years is roughly €265k vs €159k.

This can be a high-leverage *structural* move for genuine Estonian business income. See [Using an OÜ](company.md).

Requires: real business substance, a defensible salary, an accountant. Not a DIY area.

### 3. Use the investment account for everything liquid

Free, indefinite tax deferral plus tax-free withdrawal of principal first. There is no downside and no cap. If liquid assets are sitting outside an IK, that's an unforced error — fix it before optimising anything else.

### 4. Fill Pillar III to the limit

**A guaranteed 22% back on up to {{pillar3.maxAnnual|money}}/year** — €1,320, for the effort of setting up a standing order. Nothing else on this list offers a certain return of that size.

⚠️ **Per earner, not per person.** The refund is a deduction against your own income tax, so a partner with no taxable income gets nothing back from their own €6,000. A single-earner household has €6,000 of usable capacity, not €12,000.

The "it's locked until 60" objection is weakened by the arithmetic: because the refund lets pre-tax euros compound, Pillar III can **beat an ETF in an investment account even after an early withdrawal taxed at 22%**. See the worked examples in [Pension pillars II and III](pensions.md#why-it-beats-the-investment-account--even-if-you-withdraw-early).

Two conditions: use a **low-cost index** Pillar III fund (Tuleva, LHV index), and **reinvest the refund** instead of spending it.

---

## Tier 2 — real money, moderate effort

### 5. Portfolio: one fund, then stop

Global equity, accumulating, Irish-domiciled, inside the IK. See [portfolio.md](portfolio.md#vwce-vs-webn) for the VWCE/WEBN decision. Other reasonable candidates:

| Fund | TER | Coverage |
|---|---|---|
| **VWCE** (Vanguard FTSE All-World Acc) | **0.14%** | Developed + emerging, 3,757 holdings — **recommended** |
| **WEBN** (Amundi Prime All Country World Acc) | **0.07%** | Large & mid cap only, ~2,400–3,400 holdings |
| **SPYI** (SPDR ACWI IMI) | ~0.17% | Broadest — includes small caps |
| **IWDA + EIMI** (iShares) | ~0.20% blended | Manual EM weighting |

Any of these is fine. The decision to *stop optimising* is worth more than the gap between them. Pick one, automate the buy, never touch it.

**Bonds:** near-zero allocation during accumulation is defensible when you have decades and stable income. They matter at the retirement date, for the bond tent — not before. If held, prefer **EUR-hedged** global aggregate, because unhedged foreign bonds are mostly currency risk wearing a bond costume.

**Home bias:** for an Estonia-resident household, salary, housing, banking and pensions may already be concentrated locally. An Estonian-heavy or Europe-heavy portfolio can amplify that exposure.

### 6. Solve health insurance deliberately

**{{healthInsurance.voluntaryMonthly|money12}}/year per uninsured adult** — €6,528 for a retired couple, about **€187k of FI number**. The family routes that used to make this free were **abolished on 1 January 2026**; the voluntary Tervisekassa contract replaced them and no longer requires prior insurance history. See [household.md](household.md#health-insurance--the-family-exit-closed-in-2026) and the [health-insurance guide](health-insurance.md).

### 7. Keep Pillar II, then choose the contribution rate by liquidity needs

The 4% social-tax match is hard to beat, so don't exit for FIRE reasons. Be in a low-cost index fund (Tuleva, LHV index) and size the bridge portfolio to cover the years before it unlocks.

**Think twice before raising 2% → 6%.** The state's 4% does not increase, so there is no extra match to capture — only more salary locked away until the unlock age. Where the bridge to that age is the binding constraint, or near-term borrowing capacity matters, Pillar II may be the last wrapper to increase rather than the first. See [Pension pillars II and III](pensions.md#2-4-or-6--should-you-raise-your-rate).

---

## Tier 3 — situational, and easy to overrate

### 8. Real estate

Estonia's 17.6% effective rate on residential rent is genuinely good.

But be honest about what it is: **a leveraged, illiquid, undiversified, management-intensive bet on one city.** It works when you have an edge — better data than the average buyer, or a trade you can do yourself — and most buyers are working from listing-page impressions. Model actual net yield after vacancy, maintenance (budget 1%+ of value/yr), management, and land tax. Gross yield is a marketing number.

**Buy vs rent for a primary home** requires household-specific figures — the answer in Tallinn has swung hard with rates and is not obvious in either direction.

### 9. Geographic arbitrage

Earning at higher international rates while spending at Estonian levels can be a large lever, whether through remote employment or genuine business activity.

Watch the tax residency rules if it ever becomes "live abroad, keep the Estonian company" — permanent establishment and residency tests are where these plans fail.

### 10. Coast FIRE as a real target

Full FIRE may be 15+ years out. **CoastFIRE might be 5.** Hitting the point where you never need to save again — and can therefore take a lower-paid, more interesting job — is often the outcome people actually want. It's worth calculating explicitly rather than treating FI as binary.

---

## Explicitly not levers

Worth naming, because they consume attention disproportionate to their effect:

- **Stock picking / market timing** — negative expected value after effort and tax
- **Crypto beyond a small speculative slice** — no loss offset in Estonia, and self-custodied coins can't be moved into an IK without triggering the tax the account is meant to defer
- **Chasing 0.05% TER differences** — real, but rounding error next to savings rate
- **Complex option strategies** — the covered-call-income genre in particular converts an equity return into a taxed, capped return
- **P2P lending** — Estonia has a large local industry (Bondora, Mintos) with a history of platform failures. Yields are credit risk, priced as if it were interest

---

## A rough sequence

1. **Measure** — 3 months of real spending data, and current net worth by account
2. **Fix the wrappers** — IK declared, Pillar III maxed, Pillar II in an index fund
3. **Decide the OÜ question** — income structure and health insurance in one decision
4. **Automate** — standing order into one global ETF on payday, before you see the money
5. **Model** — FI number, bridge size and CoastFIRE date in the [simulator](../simulator.html)
6. **Then** consider real estate or anything more exotic

Steps 1–4 capture most of the available value and can be done in a few weekends. Everything after is refinement.

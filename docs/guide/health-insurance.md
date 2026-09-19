# Health insurance — the Estonian FIRE trap

**This is the thing that breaks naive Estonian FIRE plans.**

Estonian health insurance (`ravikindlustus`) is not a residency right. It's tied to **social tax being paid on your behalf**. Employees are covered; people living off a portfolio are **not**.

**Dividends do not carry social tax** — which is tax-efficient and exactly why they leave you uninsured. The efficiency and the coverage are in direct conflict.

> **The dependent-spouse route was abolished on 1 January 2026.** The state no longer guarantees coverage for dependent spouses raising children; all such coverage ended by **31 January 2026**. Anyone who was relying on it **has already lost cover** — see [household.md](household.md#health-insurance--the-family-exit-closed-in-2026).

Options, with verified 2026 costs:

| Route | Mechanism | Cost | Notes |
|---|---|---|---|
| **Employment** | Any job, incl. part-time | €0 — employer pays | BaristaFIRE. Simplest route by far |
| **Voluntary Tervisekassa contract** | Direct contract with the health fund | **{{healthInsurance.voluntaryMonthly|money}}/mo · {{healthInsurance.voluntaryMonthly|money12}}/yr** (from 1 Jul 2026) | **Now the default fallback** — see below |
| **Parent of a child under 3** | Own right, not dependant | €0 | Only **one parent per family**. Expires at the child's 3rd birthday |
| **Receiving parental benefit** | Own right | €0 | Covers the benefit period |
| **Large family** | Non-working large-family allowance, 3–6 children under 19, ≥1 under 8 | €0 | One parent only |
| **Board fee from your own OÜ** | Fee ≥ **{{socialTaxMinimumBaseMonthly|money}}/mo gross** triggers the €292.38 minimum social tax | **€1,178/mo total company cost** | Also accrues Pillar I/II. Expensive purely as insurance |
| **FIE** (sole trader) | Self-employed registration | Similar minimum obligation | More admin, rarely better than an OÜ |
| ~~Dependent spouse~~ | ~~Via insured spouse~~ | — | **Abolished 1 Jan 2026** |

**The voluntary contract got much better in 2026, and that partly offsets the loss above.** It used to require 12 months of prior insured status within the last 24. That requirement is **gone** — the only condition now is permanent residence in Estonia. Terms: 1-year fixed contract via Terviseportaal, coverage starts one month after signing, covers everything **except sick-leave benefits**, refunded pro-rata if you leave early.

**Budget {{healthInsurance.voluntaryMonthly|money12}}/year per uninsured adult.** At a 3.5% SWR that's **~€93,000 of extra FI number per person** — €187,000 for a couple with no earned income. Most FIRE spreadsheets omit this entirely.

**Children remain covered unconditionally** from birth to 19, regardless of either parent's status. That part is unchanged and confirmed.

**Practical conclusion:** the voluntary contract at {{healthInsurance.voluntaryMonthly|money12}}/yr is cheaper and far simpler than running an OÜ purely for coverage — a board fee big enough to trigger the minimum social tax costs the company €1,178/month. Keep the OÜ argument for cases where the company earns real income; don't build one just to stay insured.

---


## The five-year gap, and a lever that might close it

Pillar access does not establish health coverage. Pension-based cover depends
on receiving a **state pension**, not simply reaching an estimated age. The
planner now budgets {{healthInsurance.voluntaryMonthly|money}} a month per
uncovered person until a user-confirmed ongoing coverage start. If no date is
confirmed, premiums continue through the horizon and remain in the perpetual
target. Selecting zero pension benefits does not cancel a confirmed health route.
Older plans may therefore show higher targets; review coverage rather than
assuming automatic entitlement. Temporary routes do not establish lifelong cover.
See [Tervisekassa's eligibility guidance](https://tervisekassa.ee/en/people/health-insurance/persons-equivalent-insured-persons)
(checked 19 September 2026).

There is a mechanism that may close it. **RPKS §9¹** allows the state pension
itself to be taken up to five years early — the *paindlik vanaduspension*. Since
cover follows receipt of a state pension rather than reaching a particular age,
drawing it early should bring the free cover forward with it.

**The catch is service.** Each year of drawing early demands five more years of
it — 20 years of service to draw one year early, 25 for two, and **40 for the
full five**. That lands badly on exactly the people who would want it: a short
career is the point of retiring early, and it is what disqualifies you here.
Someone stopping at 45 with 20 years of service qualifies for one year, not five.

**And the reduction is permanent.** Sotsiaalkindlustusamet's forecast multipliers
— they vary by birth date now, and are recalculated each January:

| Drawn | Adjustment, for life |
|---|---|
| 5 years early | −22.98% |
| 3 years early | −14.60% |
| 1 year early | −5.14% |
| 1 year late | +5.57% |
| 3 years late | +18.35% |
| 5 years late | +33.68% |

Note the asymmetry: **deferring pays more than claiming early costs**, at every
matching year.

**So the trade genuinely flips**, and the simulator will tell you which side you
are on. Modest spending makes it worth taking — the health saving is a large
share of what you need, and one year early costs only 5%. Higher spending makes
it worth skipping, because the reduction compounds against a bigger requirement
while the €272 saving stays the same size. There is no general answer, which is
why it is a setting rather than advice.

One thing it does not require: **you may keep working while drawing it.** The
2021 reform removed that restriction, and wages carry on adding to your accrual
on top of the locked-in reduction.

---

## The routes that do not work, and the one that does

The obvious thought for an early retiree is to register as unemployed. It does
not work, and the reason is worth knowing precisely so you do not plan around it.

**Registration confers nothing.** Ravikindlustuse seadus grants cover to a person
*receiving* `töötuskindlustushüvitis` — not to a person registered as unemployed.
There is no "registered jobseeker" category in RaKS §5 at all.

**And the benefit is out of reach anyway.** It requires **12 months of
unemployment-insurance contributions within the preceding 36** — which someone
who stopped working years ago does not have. The means-tested `töötutoetus`
fails on a similar work-history test *and* is not a coverage trigger under RaKS
regardless. Both run for months, not years: 180 to 360 days. Neither could bridge
a decade even for someone who qualified.

Registration itself has no wealth test and is realistically available. It simply
buys nothing.

**So the voluntary contract is the route**, and its terms matter for planning:

| | |
|---|---|
| Cost | {{healthInsurance.voluntaryMonthly|money}}/month — RaKS §24(3): 0.13 × the last published average gross wage, reset annually |
| Cover starts | **one month after signing** — a gap cannot be closed retroactively |
| Minimum term | **one year** — it cannot be bought for a few weeks |
| Ends automatically | if employment resumes, or if you move abroad |
| Eligibility | permanent residency, since the 2026 liberalisation removed the insurance-history test |

### One exception that does still exist

There are **two** provisions people call "the dependent spouse route", and
conflating them is the source of a great deal of confusion — including in earlier
drafts of this guide.

| | Children-based route | RaKS §5(4)(4) |
|---|---|---|
| Who | a spouse raising young children | a spouse **within five years of pension age** |
| Children needed | yes | **no** |
| Status | **abolished**, cover ended 31 January 2026 | **in force** |

Tervisekassa's announcement that dependent-spouse cover ended in January 2026
describes the first. The second — no children required, keyed purely on being
within five years of state pension age and married to or in a registered
partnership with an insured person — was not repealed and remains good law.

**Two conditions, and the second is the catch.** The supporting partner must
themselves be an *insured person*, which in practice means still working and
paying social tax. So this closes the gap for a household where one person has
stopped and the other has not — and stops the moment the second one stops too.
For a couple retiring together it is worth nothing; for a couple retiring years
apart, it can be worth {{healthInsurance.voluntaryMonthly|money}} a month for up
to five years.

**It is not automatic.** Unlike the children-based route, which was filed through
Sotsiaalkindlustusamet, this one puts the obligation on the person themselves:
they must submit the documents to Tervisekassa to have the entry made. Cover ends
automatically if the conditions stop being met — the marriage ends, or the
supporting partner's own insured status lapses.

---

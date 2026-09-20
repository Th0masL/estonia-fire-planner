# Buying a home

A near-term home purchase can constrain the rest of a FIRE plan, because the deposit must remain liquid while the future mortgage and running costs alter long-term spending.

> ⚠️ Euribor levels, bank margins and KredEx terms move constantly. Every number here needs checking against current offers before it drives a decision.

## The one non-negotiable rule

**Money you need within ~3 years does not go into equities.**

This isn't risk tolerance, it's arithmetic. Global equity has drawn down 30–50% multiple times in living memory, and recovery has taken 2–5 years. If a down payment is in VWCE and the market falls 25% in month 10, the intended purchase may become impossible or the loss may have to be crystallised. The expected extra return over a few months does not compensate for that risk.

So the ETF plan from [portfolio.md](portfolio.md) applies to **surplus beyond the house budget**, not to the house budget.

## Where the down payment should sit

Ranked, best first:

| Option | Return | Notes |
|---|---|---|
| **EUR money market UCITS ETF, inside the LHV IK** | ~ECB rate minus ~0.1% | **Best option** — see the tax point below |
| **Term deposit** (LHV/Swedbank/SEB/Coop) | Competitive, fixed | Interest taxed at 22% immediately if held outside an IK. Match the maturity to the purchase date |
| **Savings account** | Lower | Fully liquid, simplest |
| Equities | — | **No** |

**The tax point, and it's a good one:** interest earned *outside* an investment account is taxed at 22% in the year you receive it. Interest earned *inside* an IK is deferred — and since you'll be withdrawing less than you contributed, that withdrawal is **tax-free**. Parking the down payment in a EUR money market fund inside the LHV investment account therefore earns money-market interest with **no tax at all** on the way out.

Two practical caveats: allow **T+2 settlement** plus a bank transfer when timing the notary date, and understand a money market fund is not a deposit — it's very low risk, not zero risk.

## Estonian mortgage mechanics

Bank of Estonia sets binding limits on all housing loans ✅ — **unchanged since 1 March 2015**, no amendment found in the last three years:

| Limit | Value |
|---|---|
| Max LTV | **85%** (up to 90% with a KredEx guarantee) |
| Max DSTI (loan payments / net income) | **50%** |
| Max maturity | **30 years** |
| Stress test | Affordability checked at a higher rate, not the current one |

Other things to budget for:

- **Rate** = 6-month Euribor + bank margin (roughly 1.5–2.2% depending on profile and LTV). Almost all Estonian mortgages are **floating** — your payment moves with Euribor. Budget for it being 2pp higher than today
- **KredEx guarantee** ✅ — verified, and **the categories are narrower than they sound**. The "young family" category needs a parent ≤35 with a child ≤16, or ≤40 with *two* children ≤16; every category except large families also requires that the applicant **does not already own a home** unless it is sold within 12 months; and a KredEx-guaranteed property **cannot be rented out**. Applicants with a sufficiently large down payment may not need the guarantee
- **Transaction costs**: notary fee + state fee + valuation + bank contract fee. Budget **~1.5–2%** of the purchase price on top of the down payment
- **Mortgage interest is not tax-deductible.** The personal deduction was abolished, so don't assume any tax relief
- **Home insurance** is mandatory; **land tax** is rising post-reform — check the specific plot

**Avoid reducing assessed net income shortly before applying.** Banks assess affordability on net take-home against the DSTI limit, so raising a Pillar II rate, starting large payroll pension deductions or taking unpaid leave may reduce borrowing capacity. See [Pillar II rates](pensions.md#2-4-or-6--should-you-raise-your-rate).

**Shop the margin.** Get offers from at least three banks. A 0.3pp difference in margin on a €200k, 25-year loan is roughly €9,000 over the life of the loan, and banks negotiate.

---

## Loan term, deposit size, and the bank relationship

Three structural choices, made once at signing.

### Loan term: it barely changes the FI date — choose it for flexibility

A shorter term is tempting: less interest, debt gone sooner. But if you can afford either, which actually gets you to FI faster?

**Almost neither — the term makes very little difference.** Worked on a €300,000 loan at 4%, for a household whose surplus is whatever is left after housing:

| Term | Payment @4% | Total interest | Extra saved vs 15 yr | FI reached |
|---|---:|---:|---:|---|
| 15 yr | €2,219 | €99,431 | — | baseline |
| 20 yr | €1,818 | €136,306 | €401/mo | ~same |
| 25 yr | €1,584 | €175,053 | €636/mo | ~same |
| 30 yr | €1,432 | €215,609 | €787/mo | ~same |

*(FI here means the portfolio covers the target **and** clears whatever mortgage remains — the internally consistent definition.)*

They converge because a shorter term doesn't create wealth; it moves money from "portfolio" to "mortgage paid down". Either way you own the same net amount. **A faster mortgage is not a faster retirement.**

So choose the term on the things that genuinely differ:

**1. Cash-flow flexibility.** On the example above, 30 years frees **€787/month** versus 15. That's the difference between a plan that absorbs a job loss, a bad year or a second child, and one that doesn't.

**2. Total wealth on the same budget.** Commit the same amount each month either way — short loan then invest everything afterwards, versus long loan investing the difference throughout — and the longer term ends ahead, because the money invested early compounds for longer than the interest saved late.

**3. Irreversibility.** You can always overpay a 30-year loan (fee capped at 3 months' interest, usually waived with notice). You can never under-pay a 15-year one.

**Recommendation: take the longest term available**, and treat the freed-up monthly amount as a decision you re-make each year against the prepay thresholds above. If you want the debt gone faster, overpay a long loan — same result, and you keep the option to stop.

⚠️ Check the age cap: many Estonian banks want the loan repaid by 65–70, so if you are over about 37 the real maximum on offer may be shorter than 30 years.

### Deposit size: put down exactly enough to reach the best margin tier

An extra euro of deposit earns a **guaranteed, tax-free return equal to the mortgage rate** — around 4%. An extra euro invested earns an expected but uncertain 6–7%. On that alone, a smaller deposit wins.

What breaks it is the **margin ladder**: banks price margin by LTV band, and crossing a band reprices the *entire* loan, not just the extra slice.

**The method, once you have quotes:**

1. Ask each bank for its margin at **60%, 70%, 75%, 80% and 85% LTV**. Most have two or three breakpoints.
2. Find the **lowest LTV at which the margin stops improving**. That is the efficient deposit.
3. Put down exactly that much — **not a euro more**.

Beyond that point extra deposit earns only the mortgage rate, locked into an illiquid asset. Below it you pay a higher margin on the whole loan.

**Worked example on a €360,000 property.** Margin 1.70% at ≤75% LTV, 2.00% above:

| Deposit | Loan | Rate | Annual interest |
|---|---:|---:|---:|
| 25% (€90,000) | €270,000 | 3.70% | €9,990 |
| 15% (€54,000) | €306,000 | 4.00% | €12,240 |

The extra €36,000 costs €2,250/year — an **effective marginal rate of 6.25%**, not 4%. If the margin were unchanged, the same €36,000 would cost 3.70%; the repricing of the whole loan changes the answer.

The efficient deposit is household-specific. Preserve transaction costs, furnishing and an emergency reserve first, then compare the remaining feasible deposits against each bank's actual LTV breakpoints.

### Does holding your ETF at LHV get you a better rate?

**Possibly, marginally — but don't count on it, and don't let it drive where you invest.**

Estonian banks price the margin mainly on LTV, income stability, DSTI and negotiation. An existing relationship — salary account, investments, other products — does feed the credit assessment and can help at the edges, but it is not a published discount and no bank commits to it.

**It's worth asking about, because the stakes are asymmetric.** A **0.1pp** margin difference on €300,000 over 30 years is roughly **€5,000–5,500** of interest — far more than several years of a small custody fee. So:

- **Do** ask each bank directly whether a salary account, existing investments, or bundling affects the margin, and get it in writing
- **Do** get offers from at least three banks and use them against each other — this is worth more than any relationship effect
- **Don't** move or keep assets at LHV *hoping* it helps. Decide custody on fees and reporting, then negotiate the mortgage separately

## Funding the down payment from crypto

If any of it comes from crypto, establish the treatment of the actual holdings
before budgeting. Qualifying MiCA acquisitions and investment-account holdings
are not interchangeable with non-qualifying crypto. See the sourced
[crypto guidance](crypto.md) for the loss-offset and reporting distinctions.

**Practical implications:**

1. **Compute net proceeds before committing.** For a single taxable sale outside an investment account, €60,000 proceeds minus €20,000 basis gives €40,000 gain. At an assumed 22% rate, with no fees, deductible losses or other relief, reserve €8,800 and budget €51,200. This is a conditional illustration, not the tax on every crypto sale.
2. **Keep the tax reserve separate.** Check the applicable declaration and payment deadlines with EMTA; this example does not establish them. The simulator reserves estimated tax immediately, not on the statutory payment date.
3. **Check transaction history and timing.** Do not assume splitting sales has no effect on the final bill, or that wallet location determines eligibility. The simulator's aggregate crypto estimate is not a transaction-level calculation.

## What this does to the FIRE plan

Worth being clear-eyed, without being preachy about it.

**A bigger home raises the FI number permanently.** Utilities, maintenance, insurance, land tax and furnishing all scale with size. If the new place costs **€400/month more to run**, that's **€4,800/year**, which at a 3.5% SWR adds **~€137,000** to the amount you need before you can stop working. The mortgage payment itself eventually ends; the running costs don't.

That can still be the right trade: space and stability are legitimate uses of money. But it should be a deliberate decision. **Model the new running cost, not just the mortgage payment.**

**Two things that partly offset it:**
- Your primary residence is **exempt from income tax on sale** in Estonia, so home equity is one of the few genuinely untaxed assets available to you
- A mortgage is cheap, long-dated leverage against an inflating asset, in a country with no wealth tax

**Mortgage vs invest:** covered properly in its own section below, since the answer moves with Euribor.

---

## When does prepaying beat investing?

Prepaying a mortgage is an **investment with a guaranteed, risk-free, tax-free return exactly equal to your mortgage rate**. So the question is simply: does that beat what the same euro would do in the investment account?

### Two things that make Estonia different

**1. No mortgage interest deduction** (abolished 2024). The headline rate is therefore the borrower's true financing cost, without an income-tax deduction lowering it.

**2. The investment account is unusually tax-efficient**, which pushes the other way. Two cases:

| | Effective return on the invested euro |
|---|---|
| Gains eventually taxed at 22% | **5.8–6.3% nominal** (from a 7% gross expectation, depending on horizon) |
| Withdrawn inside the tax-free contribution base | **7.0% nominal** |

Because the IK lets you withdraw contributions tax-free first — often a decade or more of spending — a large share of what you invest is never taxed at all. There's also a hidden benefit: **every euro contributed raises your future tax-free withdrawal allowance.** Prepaying the mortgage does nothing for that.

So the honest expectation on invested money is somewhere around **6–7% nominal**, versus a **certain** return equal to the mortgage rate.

### The thresholds

Your all-in rate is **6-month Euribor + your bank margin** (expect ~1.5–2.2%), resetting twice a year.

| All-in mortgage rate | What to do | Why |
|---|---|---|
| **Below 4.5%** | **Invest everything** | The expected gap is 1.5pp+ and wide enough to survive being wrong |
| **4.5–5.5%** | **Still invest** | Gap narrows but remains positive; liquidity and diversification favour the ETF |
| **5.5–6.5%** | **Split it**, half to each | Genuinely marginal. A risk-free 6% is a good return; splitting is a legitimate answer, not a fudge |
| **6.5–7.5%** | **Favour prepaying** | You'd be earning your full expected equity return with **zero risk and zero tax** |
| **Above 7.5%** | **Prepay aggressively** | Guaranteed return exceeds what equities are likely to deliver |

**With a ~1.7% margin, the 6.5% trigger means 6-month Euribor above roughly 4.8%** — higher than its late-2023 peak of ~4%. So on current rates (all-in ~3.5–4.5%), **investing wins clearly**, and it would take an unusual rate environment to change that.

### What a rate rise actually costs you

| All-in rate | Payment on illustrative €300k loan | Total interest over 30 yrs |
|---|---:|---:|
| 4% | €1,432 | €215,600 |
| 5% | €1,610 | €279,800 |
| 6% | €1,799 | €347,500 |
| 7% | €1,996 | €418,500 |

Check the household-specific DSTI in the simulator rather than inferring it from this table. The closer DSTI runs to the regulatory limit, the more the decision becomes about resilience rather than optimisation.

### Three adjustments worth making

**If a household has no equity exposure yet.** Establishing a diversified portfolio may reduce an existing concentration in local property. This diversification benefit belongs alongside the rate comparison, although it does not eliminate market risk.

**Prepaying is irreversible.** Estonia has no consumer home-equity line to draw the money back out. Money in the IK stays accessible; money in the mortgage doesn't. Before FI, that liquidity has real value.

**The calculus flips near retirement.** In the last ~3 years before FI, a paid-off house is worth more than the rate comparison implies, because eliminating a fixed obligation is the single best defence against a bad sequence of returns in the first decade of withdrawals. Whatever balance remains at that point, clearing it is a reasonable target even if rates never rise — and the calculator will show you what that balance is.

### Practical mechanics

- **Ask explicitly for a term reduction, not a payment reduction.** ✅ Both are available at every major Estonian bank — but **the defaults differ**, and some (Citadele, for example) reduce the monthly payment while keeping the end date unless you say otherwise. Keeping the payment constant and shortening the term saves far more interest, so state your preference in writing with each repayment.
- **There is an early-repayment fee, but it is capped.** Under **VÕS §403⁴(4)** a bank may claim **up to three months' interest** on the amount repaid early. On a €50,000 prepayment at 4% that's roughly **€500**.
- **Advance notice can remove it.** Several banks waive the charge entirely with ~3 months' notice, and most require at least 10 days' notice to process any early repayment. **Give notice and the fee usually disappears** — worth building into the routine rather than prepaying on impulse.
- For a **fixed-rate** period the cap is different: **1% of outstanding principal** if more than a year of the fixed period remains, **0.5%** if less — or an interest-differential charge, which only bites when market rates have fallen below your fixed rate.
- **Don't prepay from the emergency fund.** Ever.
- **Review at each Euribor reset** (twice a year) rather than continuously. This is a decision to revisit on a schedule, not to agonise over.

## Sequencing — what to do in what order

1. **Get a mortgage pre-approval now.** It tells you the real budget and therefore the real down payment, which is the input everything else depends on
2. **Size the cash pile**: down payment + ~2% transaction costs + moving/furnishing + any crypto tax due + **an emergency fund kept separate** (3–6 months of expenses — with dependants and a mortgage, closer to 6)
3. **Park that in a money market fund inside the LHV IK** (or a matched-maturity deposit)
4. **Only what's left over goes into the ETF.** It's fine if that is a small amount each month for now. Starting the habit matters more than the size
5. **Buy the house**
6. **Then** scale up ETF contributions properly, with the new housing cost known rather than estimated

**On starting an ETF before the purchase:** only invest money demonstrably surplus to the complete purchase reserve. A small standing order can test the account mechanics without placing the deposit at market risk.

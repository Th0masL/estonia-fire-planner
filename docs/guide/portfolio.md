# Portfolio implementation

How diversified ETFs can fit into an Estonia-based FIRE portfolio, including fund and broker choices.

> ⚠️ Fund data (TER, ISIN, index) and broker fees change. Confirm on the issuer's factsheet and your broker's fee schedule before buying.

## When a global equity ETF fills a diversification gap

For many people starting out, adding public-market exposure is less about chasing returns than about fixing a concentration problem.

A very common Estonian starting position is **property plus an Estonian salary** — two holdings that depend on the same small economy, and that would come under pressure together in exactly the crisis where you would need them not to, with no broad ownership of global productive assets anywhere in the mix. A global equity ETF is the single cleanest fix: one instrument, ~3,500 companies, ~50 countries, ~0.1% a year to run.

Anything else concentrated in one place — crypto, a single employer's shares, a second property — sharpens the same problem rather than solving it.

Three reasons it fits that position particularly well:

1. **Diversification away from Estonia.** For most people here the salary, the property and the bank are all in one country of 1.3 million on a sensitive border. Global equity is the counterweight.
2. **The investment account makes it tax-efficient to a degree crypto and property can't match.** An accumulating ETF inside an IK defers tax until withdrawals exceed recorded contributions. See [The investment account](investment-account.md).
3. **It requires no skill and no attention.** Unlike property and crypto, which demand both.

**The caveat that matters more than the fund choice:** money earmarked for a home purchase within roughly three years generally should *not* go into equities. See [property-purchase.md](property-purchase.md).

---

## VWCE vs WEBN

Both are the right *kind* of thing: accumulating, Irish-domiciled, global, all-cap-ish, cheap.

| | **VWCE** | **WEBN** |
|---|---|---|
| Full name | Vanguard FTSE All-World UCITS ETF (Acc) | Amundi Prime All Country World UCITS ETF (Acc) |
| ISIN | IE00BK5BQT80 | IE0003XJA0J9 |
| Domicile | Ireland ✅ | Ireland ✅ |
| Distribution | Accumulating ✅ | Accumulating ✅ |
| TER | **0.14%** ✅ | **0.07%** ✅ |
| Index | FTSE All-World | Solactive GBS Global Markets **Large & Mid Cap** |
| Holdings | **3,757** | ~2,400–3,400 (sources vary) |
| Small-cap tail | Broader | Large & mid only |
| Replication | Optimised sampling | Full physical |
| Emerging markets | Yes | Yes |
| Launched | July 2019 | **June 2024** |
| Fund size | **~€48.7bn** | ~€0.4–2.2bn (sources vary) |
| Issuer track record | Vanguard — excellent | Amundi — active pattern of merging funds |

**The cost gap is 0.07%/year, which is not enough to decide it.** On a €500k portfolio that's €350/year — real, but small against a fund that is ~25× larger, four years older, and holds a broader slice of the market.

**On Amundi's track record:** WEBN itself has not had its index changed or been merged since launch — but Amundi merged its *Prime Global* siblings in November 2024, absorbed a €3.8bn Lyxor EM fund, and rebranded ~38 Lyxor ETFs across 2023–24. The pattern is real, even though WEBN hasn't been caught by it yet. Inside an Estonian IK a merger isn't a taxable event, so the *tax* consequence is neutralised — but you'd still be moved into a fund you didn't choose.

**Recommendation: VWCE.** With the gap at 0.07%, the deeper liquidity, longer record, broader index and vastly larger asset base are worth more than the remaining fee saving — particularly for a position you intend to hold for decades and never think about again. WEBN remains perfectly reasonable if you'd rather have the lowest possible TER; this is a close call, not a clear error either way.

**Within a single broker, hold one of them, not both** — they own nearly identical companies, so a second world index adds admin without adding diversification. If you later want to add something, add bonds or small caps, not another global fund.

**Across two brokers, holding one in each is reasonable** — see [VWCE at LHV, WEBN at IBKR](#vwce-at-lhv-webn-at-ibkr) below.

Practical checks before you buy:
- Confirm **LHV actually lists WEBN** and on which exchange (it trades on Xetra and others — availability varies by broker)
- Compare the **spread** at your trade size, not just the TER — on a smaller fund it can eat part of the savings on small, frequent buys
- Buy in **EUR on a European exchange** (Xetra) to avoid FX conversion

---

## What "UCITS" means, and why the house money doesn't go into the ETF

**UCITS** stands for *Undertakings for Collective Investment in Transferable Securities* — the EU regulatory framework that virtually every European retail fund is authorised under. It imposes rules on diversification, liquidity, leverage limits, independent custody of assets, and disclosure. It is a **quality and safety standard, not a type of investment**.

So "UCITS ETF" just means an ETF built to EU retail rules. VWCE is one. A "EUR money market UCITS fund" is one too. It matters here for three reasons: UCITS funds are explicitly eligible for the investment account, they hold assets in independent custody (see [account-protection.md](account-protection.md)), and non-UCITS funds are largely unavailable to EU retail investors anyway.

### Why not just put the house money in the ETF?

Because they do completely different jobs:

| | **Money market fund** | **Global equity ETF** |
|---|---|---|
| Holds | Short-term government bills, bank deposits, commercial paper | ~3,700 company shares worldwide |
| Expected return | ≈ ECB rate (currently ~2%) | ~7% nominal long-run |
| Worst realistic year | Roughly flat | **−30% to −50%** |
| Right horizon | Days to ~2 years | 10 years+ |

If a deposit is needed in under twelve months, a 25% drawdown in month ten can make the intended purchase impossible or force the loss to be crystallised. There is no expected return that compensates for that risk over a few months.

The money market fund isn't an investment in any meaningful sense; it's a **parking space that earns the ECB rate instead of nothing**, while staying inside the investment account so the interest is tax-deferred and comes back out tax-free.

### The vocabulary, since none of this is obvious

| Term | What it actually is |
|---|---|
| **Xetra** | The main German stock exchange, run by Deutsche Börse. Most European ETFs are listed there, so it's simply *where you buy* — the same role as the Tallinn or New York exchange. LHV gives you access to it |
| **Ticker** | The short code identifying a fund on an exchange — `VWCE`, `XEON`. Like a stock symbol |
| **ISIN** | The fund's unique 12-character international ID, e.g. `IE00BK5BQT80`. More reliable than a ticker, since the same fund can trade under different tickers on different exchanges. **Search by ISIN** |
| **Accumulating (Acc)** | The fund reinvests dividends internally instead of paying them out. No annual dividend to declare |

**How buying actually works:** log into LHV, search the ISIN, choose the Xetra listing, enter an amount, buy. It looks and feels like buying a share. Settlement is T+2.

**Money market funds to look at** (all EUR, all trading on Xetra) — ⚠️ confirm the current ISIN on the issuer's page before buying, as tickers change:

- **XEON** — Xtrackers EUR Overnight Rate
- **CSH2** — Amundi EUR Overnight Return
- Or any short-dated EUR government bond fund

Any of them is fine. You're buying safety and liquidity, not return.

⚠️ A money market fund is very low risk, **not zero risk** — it is not a deposit and carries no guarantee. Allow **T+2 settlement** plus a transfer when timing the notary date.

### Where you can buy these

Any Estonian provider with Xetra access and automatic reporting to the Tax Board
will do: **LHV**, **Swedbank**, **SEB** or **Lightyear**. They differ on cost
rather than capability, and the differences are set out in full — along with the
custody fee structures, which are not the same shape — in
[Brokers & parking cash](brokers.md).

Two numbers are worth repeating here, because they matter once the amounts get
large.
Swedbank never charges more than {{brokers.swedbankCustodyMonthlyCap|money}} a
month to hold your shares, which is {{brokers.swedbankCustodyMonthlyCap|money12}}
a year however much you own. LHV charges
{{brokers.lhvCustodyAboveMonthly|pct3}} a month with no maximum, so its fee keeps
growing as the balance does. Lightyear charges nothing. Swedbank's figure holds
only while the account contains nothing but fund units; a single ordinary share
in the same account adds {{vat|pct}} VAT to the whole fee.

Swedbank's {{brokers.swedbankMinCommission|money2}} minimum beats LHV's {{brokers.lhvMinCommission|money2}}, and it cut that from €9.90 in July 2025. On everything that matters here — Xetra access, 0.14%, free custody to {{brokers.custodyFreeThreshold|money}}, automated Table 6.5 reporting — **they are functionally the same broker.**

**This makes a second Estonian account genuinely cheap:** {{brokers.custodyFreeThreshold|money}} at LHV plus the same again at Swedbank is **twice that in foreign securities with zero custody fees**, both reporting automatically, and e-MTA aggregating them for you.

**The trade-off against IBKR is now clearer.** Swedbank is easier (automated reporting, Estonian support) but keeps everything inside the Estonian banking system. IBKR is more work (manual ledger) but is the only option that actually diversifies custody out of Estonia. Which you pick second depends on which goal you weight — see the phasing below.

### Example: a balance held at a foreign EEA bank

For illustration, short-term cash held at a foreign EEA bank such as N26 may earn less than a money market fund. The table below uses a **1.5% example rate**; current rates must be checked. Interest from a foreign bank is generally **taxable in Estonia at 22%** as received ⚠️ unless the account and assets qualify for the investment-account regime.

| | N26 at 1.5% | Money market fund inside the LHV IK |
|---|---:|---:|
| Gross return on an illustrative €50,000 | €750 | ~€1,000 |
| Estonian tax | −€165 (22%) | €0 — deferred, then tax-free within your contribution base |
| **Net** | **€585** | **€1,000** |

About **€415/year** in this illustration — small, though consolidating a purchase fund can also simplify IK accounting.

**One point against:** N26 is a German bank, so a balance there sits under Germany's deposit guarantee — a genuinely separate {{protection.depositGuarantee|money}} bucket from Estonian deposits. That's real diversification. But a money market fund isn't a deposit at all, so it sidesteps the {{protection.depositGuarantee|money}} question entirely rather than just relocating it (see [account-protection.md](account-protection.md)).

### Can you invest *through* N26?

**It's available, but don't — the tax status is genuinely unresolved.**

N26 launched stocks and ETFs in Estonia in **October 2024**. The product itself is good: 4,000+ instruments, **€0.90 per trade**, fractional shares from €1, free recurring savings plans, and **10 free trades a month on Metal**.

**The problem is structural.** N26's own documentation states that execution and custody are provided not by N26 Bank but by **Upvest Securities GmbH**, a separately incorporated German firm. Estonian law requires the investment account to be a cash account **at** a qualifying institution — so whether you would be declaring "an account at N26" or "an account at Upvest", and whether the latter satisfies §17²(3), is unsettled. **No EMTA guidance addresses this structure.**

N26 also states plainly that it does **not** withhold or report tax for customers in Estonia.

**The downside is asymmetric.** If the structure doesn't qualify, you lose the deferral entirely and owe back tax with interest. Against that, the upside is €0.90 trades — which IBKR roughly matches anyway, with confirmed eligibility.

**So: N26 can be considered for cash, not investing.** Before attempting to use its investment product as an IK, obtain a written answer from EMTA.

### Not wanting everything in Estonian banks — the right way to do it

The goal is sound. Two things make it easier than it looks.

**First, a global ETF's assets sit outside Estonia regardless of broker.** VWCE is **Irish-domiciled** (`IE00BK5BQT80`). Its underlying shares are held by an Irish depositary under Irish and EU law. LHV is a link in the custody chain, not the place your assets live. Buying through an Estonian broker does not make the portfolio "Estonian" in any meaningful sense.

What a non-Estonian broker actually buys you is narrower but still real: **resilience of the access path** — a second, independent route to the holdings if Estonian institutions were disrupted or capital controls were imposed. That's the argument in [account-protection.md](account-protection.md), and it's about reachability, not ownership.

**Second, IBKR Ireland is the tool for this, not N26.** It's confirmed eligible as an investment account, it's an Irish entity outside the Estonian banking system, it has no custody fee, and it gives full market access.

### Phasing, if custody diversification matters to you

On cost alone, a second account only pays for itself above about €200,000. If holding assets outside the Estonian banking system matters in its own right, bring it forward:

| Phase | Where | Why |
|---|---|---|
| **Now → ~{{brokers.custodyFreeThreshold|money}}** | All at LHV | Automated reporting while the mechanics are new; zero custody fee at this size |
| **~{{brokers.custodyFreeThreshold|money}} onward** | Direct **new** contributions to **IBKR** | Starts the second jurisdiction, no custody fee, nothing needs selling |
| **Optional third** | Swedbank, up to its own {{brokers.custodyFreeThreshold|money}} | If you'd rather defer the manual ledger — but it doesn't diversify out of Estonia |

Transfers between declared accounts are tax-neutral and e-MTA aggregates them, so **there is no tax cost to splitting** — the only cost is IBKR's manual ledger. That makes the sequencing purely a question of how much admin you'll tolerate versus how much you want custody outside Estonia.

**Don't open everything at once.** One account until {{brokers.custodyFreeThreshold|money}}; the second buys you something real, a third rarely does.

### VWCE at LHV, WEBN at IBKR

This works, and it's better suited to Estonia than to most countries.

**Why the usual objection doesn't apply here.** Holding two funds normally means tracking two cost bases and matching lots at sale. **Inside an investment account there is no cost basis to track at all** — the declaration records only money in and money out of the *account*. Two funds create no extra tax admin whatsoever. That objection simply doesn't exist under the Estonian regime.

**What it genuinely gets you:**

- **The lower TER on new money.** WEBN at 0.07% versus VWCE at 0.14%. On the IBKR half growing to €500,000, that's ~€350/year.
- **A working position at each broker.** If one became unavailable, the other is fully functional — which is the actual point of the two-broker setup.
- **A little provider-level diversification.** Different managers, different depositaries, different securities-lending counterparties. UCITS assets are segregated so manager failure shouldn't cost you anything, but the risk isn't precisely zero, and splitting halves it.

**What it does *not* get you:** any diversification of market exposure. Both funds hold nearly the same companies in nearly the same weights. Don't mistake two tickers for two bets.

**The one real risk is behavioural.** Two lines side by side invites comparing their performance and "fixing" the laggard. They will diverge slightly — different indices, different sampling — and that divergence means nothing. If you think you'd be tempted to act on it, hold the same fund at both brokers instead. Either choice is defensible; the tinkering is what costs money.

**On the custody threshold:** capping LHV around {{brokers.custodyFreeThreshold|money}} is exactly the fee-optimal point, since custody is free up to there and {{brokers.lhvCustodyAboveAnnual|pct}}/yr above. Note it will drift past {{brokers.custodyFreeThreshold|money}} through market growth alone — that's fine and not worth acting on. At €150,000 the fee is about €60/year. Only revisit if the LHV side grows well beyond that.

### Where short-term cash might sit

One possible split is:

| Purpose | Possible home | Why |
|---|---|---|
| **Emergency fund (typically 3–6 months of spending)** | Insured instant-access deposit | Liquidity and deposit protection matter more than maximising yield |
| **Known near-term purchase fund** | Matched-maturity deposit or low-risk money market fund inside an IK | May improve yield, but settlement time and the distinction between a fund and a guaranteed deposit must be understood |

The appropriate institutions and amounts depend on liquidity needs, deposit-guarantee exposure and the purchase date.

---

## LHV or IBKR for the ETF itself?

### The two costs that matter

Both of these apply, and they pay for different things.

| | **LHV** | **IBKR** |
|---|---|---|
| **Eligible as an IK?** | Yes | **Yes** ✅ — IBKR Ireland is an EEA investment firm, explicitly covered by the widened §17² definition and listed on Finantsinspektsioon's cross-border register |
| IK reporting | **Automatic** — one-click report matching Table 6.5 Part II, plus foreign dividend/interest data for Tables 8.1/8.8 | **Manual** — you track every in/out yourself |
| Xetra commission | **0.14%, min €5** ✅ | Far lower |
| **Custody fee** | Free to €100k, then **0.01%/month** on the excess (**0.12%/yr**) ✅ | Effectively none |
| FX | Worse | Excellent |
| Custody location | Estonia | Ireland |
| Estonian support | Yes, in Estonian | No |

**LHV is a reasonable default for a first declared investment account.** Its automated IK reporting reduces the risk of misreporting contributions and withdrawals over long periods. That convenience can justify the fee difference while balances are modest.

**But LHV's custody fee sets a crossover point.** Above {{brokers.custodyFreeThreshold|money}} of foreign securities, LHV charges 0.01% per month — **{{brokers.lhvCustodyAboveAnnual|pct}}/year**, which is *more than the fund's own TER*. At €300k that's €240/year; at €600k, €600/year, growing forever. IBKR has no equivalent charge.

**IBKR is cheaper, but the gap is almost entirely custody, not commission.** On a €5,000 monthly purchase, LHV charges ~€7 and IBKR ~€1–3. That's €50–70 a year: real, but trivial. The custody fee is what compounds:

| Portfolio | LHV custody fee/yr | IBKR |
|---:|---:|---:|
| {{brokers.custodyFreeThreshold|money}} | €0 | €0 |
| €300,000 | €240 | €0 |
| €600,000 | €600 | €0 |
| €1,500,000 | €1,680 | €0 |

**Recommendation: start at LHV, move to IBKR at around €200,000.**

Starting at LHV can be reasonable because automated IK reporting is valuable and custody below €100k is free. Reassess around €200,000, when the fee reaches about €120 a year and keeps rising and custody outside Estonia may start to matter for its own sake (see [account-protection.md](account-protection.md)).

**Switching later is unusually painless here**, and this is worth knowing in advance: because the investment account defers tax, **selling at LHV and rebuying at IBKR is not a taxable event**. You'd pay spread and commission, nothing more. In most countries changing broker means either an in-kind transfer or a tax bill; in Estonia neither applies, as long as both accounts are declared investment accounts and the cash moves directly between them.

**Don't split across both.** Two accounts means two ledgers, two reports, and two chances to get the contribution base wrong — for a fee saving measured in tens of euros.

### When does IBKR add enough value?

For a small one-fund global ETF portfolio, LHV provides Xetra access, investment-account integration and automated tax reporting. Below {{brokers.custodyFreeThreshold|money}} its custody fee is zero.

**IBKR currently charges no inactivity fee**, so an unused account need not create an ongoing cost. Confirm the current schedule before relying on this.

**What IBKR would add later:**

| | Worth adding? |
|---|---|
| No custody fee above the free threshold | ✅ **The actual reason** — revisit at ~€200,000 |
| Custody outside Estonia | ✅ Meaningful as the portfolio grows ([account-protection.md](account-protection.md)) |
| Far wider market access, fractional shares | ➖ Irrelevant to a one-fund plan |
| US-listed ETFs and stocks | ❌ You should be avoiding US-domiciled funds anyway |
| Options, futures, margin | ❌ Explicitly not part of this plan |

On cost grounds alone, IBKR becomes more compelling around €200,000. Broader market access is not itself a benefit to a deliberately simple one-fund plan.

✅ **IBKR Ireland can be declared as an investment account.** The widened §17² definition explicitly covers accounts at an EEA investment firm ("lepinguriigi investeerimisühing"), and IBKR Ireland appears on Finantsinspektsioon's register of cross-border providers. The only real cost is that you do the contribution/withdrawal bookkeeping by hand.

**Do declare it before trading in it.** An undeclared account means every sale is immediately taxable at 22% and the whole deferral benefit is lost.

---

## Mechanics — the actual steps

1. **Declare the LHV account as an investment account.** In practice this means telling EMTA in the annual declaration which account it is (`Form A`, the investment-account tables). LHV's interface flags the account; the declaration happens at tax time. ⚠️ Confirm the current procedure — do this *before* the first trade so the contribution base starts clean.
2. **Fund it from your own bank account.** Every euro in is a contribution; keep the trail clean and don't mix in money that came from somewhere untracked.
3. **Buy one fund, in EUR, on Xetra.**
4. **Automate a standing order** on payday — before you see the money.
5. **Record contributions and withdrawals** even though LHV tracks them. A one-line spreadsheet per transfer is cheap insurance over 20 years.

## What not to do

- **Don't buy US-domiciled ETFs** (VT, VTI, VOO). US estate tax exposure above $60k for non-residents, no Estonia–US estate tax treaty, and PRIIPs blocks most EU retail access anyway.
- **Don't buy distributing versions** if you have the choice — accumulating avoids the dividend handling entirely.
- **Coins bought outside the regime cannot be moved into the IK.** Since 2026 crypto can be held there, but only if it is bought through a MiCA-licensed provider using money from the declared account. Coins bought any other way have to be sold first, and that sale is taxed. See [Crypto](crypto.md).
- **Don't start with a lump sum you need for the house.** Covered next.

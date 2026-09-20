# Account protection and systemic risk

Three questions: how IBKR interacts with the investment account, whether the {{protection.depositGuarantee|money}} guarantee means splitting across banks, and what actually protects you in a Greece- or Cyprus-shaped crisis.

**Pending review:** the account procedures, custody conclusions and crisis
examples below are not verified recommendations. For the narrower checked
deposit-versus-fund distinction, see [the cash guide](brokers.md#deposits-and-funds-do-different-jobs).
Securities segregation is not a guarantee of value or immediate access.

## 1. Multiple investment accounts — how it actually works

**You may hold as many declared investment accounts as you like, at as many institutions as you like.** There is no statutory cap, and they can sit at different banks and in different countries.

**Tax is calculated across all of them together, not per account.** Tax is triggered only when total disbursements from *all* your investment accounts exceed total contributions into *all* of them. e-MTA aggregates the reports automatically at declaration time.

**Transfers between your own investment accounts are tax-neutral.** TuMS §17²(4) explicitly excludes them from the definition of a disbursement, and EMTA's Form A instructions equally exclude them from counting as a fresh contribution on the receiving side. Your contribution balance simply carries across. The transfer is disclosed on the return but drops out of the taxable calculation at both ends.

| | IBKR **not** declared | IBKR **declared** as an IK |
|---|---|---|
| LHV → IBKR transfer | A **disbursement** from the LHV IK | **Disregarded** — tax-neutral, balance carries over |
| Assets bought at IBKR | **Outside the regime.** Every sale immediately taxable at 22% | Deferred as normal |
| Your contribution base | Falls by the transferred amount | Preserved |

**So declare any account before you fund it.** The declaration is what makes the transfer a non-event; without it you spend down the tax-free withdrawal allowance and then pay 22% on every realised gain at the far end.

**Currency conversion inside an investment account is also explicitly not a disbursement** (TuMS §17²) — converting EUR to USD to buy a US-listed security triggers nothing. FX movements only wash into the euro figure at the point of an actual withdrawal, calculated at the ECB daily rate.

### What the annual declaration looks like

You report **each investment account separately** on Form A — its own contributions and disbursements. So:

- **LHV** generates its report automatically (one click, matching Table 6.5 Part II)
- **IBKR** does not. You maintain the ledger yourself: every euro in, every euro out, dated, in EUR

**The LHV-side movements alone are not sufficient.** LHV can only see what happens in its own account. Once money is at IBKR, LHV has no visibility, and the transfer out is exactly the event that needs correct treatment.

### Practical consequences

- **Keep the ledger from day one.** A dated spreadsheet of every transfer in and out of the IBKR account. Reconstructing it years later is far worse than maintaining it.
- **Currency conversion is safe.** Converting inside the account isn't a taxable event, so buying in USD wouldn't create a problem. Buying the Irish ETF **in EUR on Xetra** is still simpler and avoids the spread.
- **The admin, not the tax, is the reason to keep accounts few.** Transfers are free and the tax is aggregated, so the only real cost of a second account is the second ledger — and only at IBKR, since Estonian banks report automatically.

---

## 2. The {{protection.depositGuarantee|money}} guarantee — and why it matters less than you'd think

**The crucial distinction: cash and securities are protected by completely different regimes.**

| | **Deposits** (cash) | **Securities** (ETF units, shares) |
|---|---|---|
| Scheme | Deposit Guarantee Scheme — Estonian **Tagatisfond** | Investor Compensation Scheme |
| Limit | **{{protection.depositGuarantee|money}}** per depositor, per bank (aggregate of all your accounts there) | **{{protection.investorCompensation|money}}** per investor, per firm |
| Why the limit is what it is | A deposit is a **loan to the bank**. If it fails, you're a creditor | Securities are **your property**, held in segregated custody, not on the bank's balance sheet |
| If the bank fails | You claim from Tagatisfond up to €100k, paid within 7 working days | Your units are **transferred to another custodian**. The €20k scheme is a backstop for a shortfall, not the primary protection |

**This is the key point, and Tagatisfond states it outright:** *"Investeerimisfondide varadele Tagatisfondi kaitse ei laiene"* — the compensation scheme does **not** extend to investment fund assets, precisely because those are already legally segregated from the manager under depositary rules. The protection is structural, not a compensation cap.

So a €1,000,000 portfolio of VWCE at LHV is **not** "€980,000 unprotected". The ETF units never belonged to LHV; they sit in segregated custody, outside its insolvency estate. The {{protection.investorCompensation|money}} figure is a backstop for the case where segregation broke down and a shortfall exists anyway — as happened with **AS Cresco Väärtpaberid**, whose licence was revoked in 2024 and whose clients were compensated up to {{protection.investorCompensation|money}} each.

**So: no, you don't need multiple investment accounts at different banks for securities.** That would add real admin for a risk that the custody structure already handles.

### Example: a temporarily large cash balance

Suppose a property sale temporarily leaves **€175,000 at one bank**. Everything above **{{protection.depositGuarantee|money}}** ranks as an ordinary claim if the bank fails, unless the balance qualifies for temporary-high-balance protection.

Possible controls include:

1. **Compare eligible deposits with investment alternatives.** Moving money into a fund replaces deposit exposure with the fund's risks; it does not establish a better trade. Use the [purchase-reserve checklist](property-purchase.md#where-the-down-payment-should-sit) before putting a dated payment at investment risk.
2. **Split the money across banks.** Keep less than {{protection.depositGuarantee|money}} at each of LHV, Swedbank and SEB. Note Swedbank and SEB Estonia are subsidiaries of *Swedish* parents while LHV is purely domestic, so this diversifies the parent risk too. But it's three sets of admin, and if you want each to stay inside the IK regime, three declared accounts.
3. **Assess any uncovered balance explicitly.** A short holding period does not make an uninsured deposit safe; determine whether a loss or access delay would jeopardize the payment.

**Temporary high-balance protection may apply.** Estonia applies an **additional {{protection.temporaryHighBalance|money}}** on top of the standard limit, for **{{protection.temporaryHighBalanceMonths}} months**, to qualifying money received from a residential property transaction. Tagatisfond's current guidance is the source used here.

The catch is the direction of travel: it covers **sale proceeds**, not savings accumulated in order to buy. A deposit saved up over years falls outside it; the proceeds of selling a home do not.

**Joint accounts are covered per holder** — a two-holder joint account can carry **twice the limit**, with {{protection.depositGuarantee|money}} attributed to each holder's share. Eligibility and ownership should be confirmed with the bank rather than assumed.

---

## 3. What actually protects you in a systemic crisis

Greece and Cyprus are the two precedents worth knowing, and they failed in quite different ways.

### What happened

**Cyprus, 2013: the bail-in.** This is the example that matters most here. The EU limit then was also €100,000, and these are the figures as they stood — they are history, not current law. Deposits **above** €100,000 at Laiki and Bank of Cyprus were seized: at Bank of Cyprus roughly 47.5% of the excess was forcibly converted to equity. Deposits **under €100,000 were fully protected** and honoured. **Shares held in custody were not touched at all**, because they were never the bank's to take.

**Greece, 2015 — capital controls.** A different failure. Banks weren't bailed in, but a three-week bank holiday was imposed, ATM withdrawals were capped at €60/day, and transfers abroad were restricted. Controls persisted in some form until 2019. Your money was *safe* but *unreachable* — which for a year or more is nearly as bad.

**Neither country left the euro.** Redenomination remained a tail risk that didn't materialise.

### What the rules say now

Cyprus led directly to the EU **Bank Recovery and Resolution Directive (BRRD)**, which formalised the loss hierarchy. In a failing bank, losses fall in this order:

1. Shareholders
2. Junior/subordinated debt
3. Senior unsecured debt
4. **Uninsured deposits — the portion above {{protection.depositGuarantee|money}}**
5. **Covered deposits (under {{protection.depositGuarantee|money}}) — explicitly excluded from bail-in**

So the {{protection.depositGuarantee|money}} line isn't just a compensation ceiling; it's a **statutory position in the queue**. Below it you're protected by design. Above it you are, by design, part of the loss-absorbing capital.

### What this means for a FIRE plan

**The strongest protection is structural: own securities, not deposits.** Converting a large cash balance into a global equity ETF moves you from "unsecured creditor of an Estonian bank" to "owner of ~3,700 companies worldwide, held in segregated custody". That is the single biggest improvement to resilience available here, and it is something a FIRE plan does anyway for unrelated reasons.

**A global equity fund is a natural hedge against a eurozone crisis.** VWCE is ~60%+ US assets, denominated in dollars, yen and pounds. If the euro fell sharply, those holdings would rise **in euro terms**. A eurozone-specific crisis is close to the one scenario where a globally diversified equity portfolio does its job best for a euro-based investor.

**Capital controls are the residual risk, and custody location is the answer.** Controls apply to residents, not just institutions — but assets custodied outside the domestic banking system are meaningfully less exposed to a domestic freeze. This is the real argument for eventually holding some of the portfolio at **IBKR Ireland** rather than the fee saving. It also connects to the concentration point in [risks.md](risks.md).

**Estonia is not Greece, and it's worth being accurate about that.** Estonia has the **lowest public debt in the EU** (~20% of GDP against Greece's ~180% in 2010). It has no sovereign debt overhang, and its two largest banks are subsidiaries of Swedish groups rather than domestically-funded institutions. The realistic Estonian tail risks are geopolitical, not fiscal.

### A possible priority order

| Priority | Action | Addresses |
|---|---|---|
| **1** | Keep bare deposits within the applicable guarantee, or evaluate a suitable money market fund inside the IK | Deposit-limit exposure and forgone interest |
| **2** | Use diversified securities for genuinely long-term money | Converts creditor exposure into ownership; global currency diversification |
| **3** | Consider a second custodian once the portfolio and risk justify the extra administration | Custody outside Estonia; access-path resilience |
| 4 | Keep documents portable — statements, ISINs, account numbers, off one machine | Practical access in any disruption |
| 5 | Don't over-engineer beyond this | The base case is that nothing happens |

**What isn't worth doing:** three investment accounts at three banks for securities, physical gold, or holding cash outside the banking system. Those solve problems the custody structure already solves, at real cost in admin and returns.

---

## Sources

This page's previous research-round completion label is not sufficient evidence
that every account rule, guarantee limit or broker comparison is current.
Protection schemes and commercial comparisons remain open in the
[evidence register](verification.md#open-review). Check the applicable Income Tax
Act, Guarantee Fund Act, Tagatisfond guidance and provider terms before relying
on the figures; this register update did not reverify them.

The temporary-high-balance protection is narrow and time-limited. Confirm that the source of funds and dates qualify with Tagatisfond or the bank before relying on it.

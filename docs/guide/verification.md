# Verification queries

Copy-pasteable research prompts covering every ⚠️-flagged claim in these docs. They are ordered by **how much an answer could change the guidance**.

Each entry gives the claim, the prompt and **what changes if the claim is wrong**, making it easier to distinguish material assumptions from details.

## Preamble to prepend

AI search tools work better on this material with a framing instruction. Prepend this to any query below:

```
You are checking Estonian tax and social law as it stands in 2026. For every
figure: state the exact amount or rate, the date it took effect, and whether it
has changed in the last 3 years. Cite primary sources — emta.ee, riigiteataja.ee,
sotsiaalkindlustusamet.ee, tervisekassa.ee, eestipank.ee — and give the specific
law and section where relevant. If a rule was announced but later amended or
repealed, say so explicitly. If you are not confident, say so rather than
guessing.
```

After checking the citations against primary sources, update the affected guide and re-run the build.

---

## Tier 1 — these change a recommendation

### 1. Pillar II contribution rate — is there really no extra match?

**Claim:** the 4% from social tax is fixed; raising your own rate from 2% to 6% does not increase it. This is the single load-bearing fact behind "stay at 2%".

```
In Estonia's second pension pillar (kogumispension) in 2026: an employee can
choose a personal contribution rate of 2%, 4% or 6%. Does the state's 4%
contribution from social tax increase if the employee chooses 4% or 6% instead
of 2%, or does it stay fixed at 4% regardless? Also: what are the deadlines and
windows during the year for changing the personal rate, and when does a change
take effect? Cite emta.ee or pensionikeskus.ee.
```

**If the claim is wrong and the state portion scales with the personal contribution**, raising to 6% would earn an additional match and the contribution-rate guidance would need to change.

### 2. Pillar III limits and payout rates

**Claim:** deduct the lower of 15% of gross or {{pillar3.maxAnnual|money}}/yr, refund at 22%, payouts 10% at 60+, 0% as lifetime annuity, 22% before 60.

```
For Estonia's third pension pillar (täiendav kogumispension) in 2026: what is
the maximum annual contribution deductible from taxable income (percentage of
gross income and absolute euro cap)? At what rate is the refund given? Is this
deduction separate from, or included in, the general ~1200 EUR annual cap on
deductions for training expenses and donations? What income tax rates apply to
payouts: before age 60, after age 60, and as a lifetime annuity — and what
conditions (minimum contract duration) apply? Can one spouse use the other's
unused third-pillar deduction in a joint declaration?
```

**If the spouse-transfer claim is wrong**, the household capacity number changes. If the payout rates are wrong, the comparison with the investment account needs to be recalculated.

### 3. Health insurance for a non-working spouse

**Claim:** children are insured unconditionally; a spouse raising a child under 8 can be insured as a dependant of the insured spouse.

```
In Estonia in 2026, who is covered by state health insurance (ravikindlustus)
without paying social tax themselves? Specifically: (a) are children covered
regardless of their parents' insurance status, and up to what age; (b) can a
non-working spouse be insured as a dependant of an insured spouse, and under
exactly what conditions — is raising a child under 8 sufficient, and what is the
rule for three or more children; (c) what are the eligibility conditions and
current premium for a voluntary insurance contract with Tervisekassa?
```

**If the claim is wrong**, a household where one adult stops working may need to budget for voluntary coverage, materially increasing the FI target.

### 4. Investment account — eligible assets and foreign brokers

**Claim:** IK covers financial assets on regulated EEA/OECD markets and UCITS funds; crypto is excluded; a foreign broker account can be declared.

```
For Estonia's investment account regime (investeerimiskonto) in 2026: which
assets qualify — list the categories precisely, including whether UCITS ETFs,
bank deposits, money market funds, and interest from licensed crowdfunding or
P2P platforms are eligible. Is cryptocurrency eligible? Can a cash account held
with a foreign investment firm in the EEA, such as Interactive Brokers Ireland,
be declared as an investment account, or must it be at an Estonian institution?
Cite the Income Tax Act (tulumaksuseadus) sections and EMTA guidance.
```

**If the IBKR claim is wrong**, any guidance that treats it as a declared investment account must be removed; it would instead be a taxable account.

### 5. Crypto — loss offset and what counts as a disposal

**Claim:** 22% on gains, crypto-to-crypto swaps are taxable, losses cannot offset gains.

```
How is cryptocurrency taxed for private individuals in Estonia in 2026? Confirm:
(a) the tax rate on gains; (b) whether exchanging one cryptocurrency directly for
another is a taxable disposal; (c) whether losses from crypto disposals can be
offset against gains from other crypto disposals or other income — and the legal
basis for the answer; (d) how staking and mining rewards are taxed; (e) the
reporting requirements on the annual declaration.
```

**If losses can be netted more broadly**, disposal can cost less than the guide assumes. That matters most where crypto is used to fund a large purchase.

---

## Tier 2 — these change the numbers

### 6. Income tax, basic exemption and child exemptions in 2026

```
What is Estonia's personal income tax rate in 2026, and what is the basic
exemption (maksuvaba tulu)? Confirm whether the universal 700 EUR/month
exemption took effect on 1 January 2026 and whether the previous income-based
taper was abolished. Separately: does the additional tax exemption for children
(täiendav maksuvaba tulu laste eest, from the second child) still exist in 2026,
or was it repealed as part of the same reform? Also confirm whether the planned
2% "security tax" increase to 24% was repealed.
```

### 7. Minimum social tax and OÜ board salary

```
In Estonia in 2026: what is the monthly rate on which the minimum social tax
obligation is calculated, and what is the resulting minimum monthly social tax
payment? If a person is the sole owner and board member of an Estonian OÜ and
wants to maintain state health insurance, what is the minimum salary or board
fee they must pay themselves, and what is the total monthly cost including
social tax? Are there rules requiring a minimum salary where an owner-manager
takes dividends?
```

### 8. Mortgage limits and KredEx

```
What are the Bank of Estonia (Eesti Pank) binding requirements for housing loans
in 2026: maximum loan-to-value ratio, maximum debt service-to-income (DSTI)
ratio, maximum loan maturity, and the interest rate used in the affordability
stress test? Separately: what is the KredEx housing loan guarantee in 2026 — who
is eligible (specifically families with children), what minimum down payment
does it allow, what does it cost, and what are the property and price limits?
```

### 9. Family benefits

```
What Estonian family benefits apply in 2026: the monthly child allowance
(lapsetoetus) for the first, second and third child; the large family allowance
(lasterikka pere toetus) and the number of children needed to qualify; and the
parental benefit (vanemahüvitis) — how it is calculated from previous income,
the maximum and minimum amounts, and the total number of days payable. Note any
changes made in 2024-2026.
```

### 10. Property income and own-home sale

```
In Estonia in 2026: (a) is the automatic 20% expense deduction on residential
rental income received by a private individual still in force, and what is the
resulting effective tax rate; (b) under what conditions is the sale of one's own
home exempt from income tax, and is there a restriction on how often the
exemption can be used; (c) is mortgage interest deductible for private
individuals; (d) how has land tax changed since the 2024 reform and what are the
annual increase caps?
```

### 11. Foreign dividends and the annual declaration

```
In Estonia in 2026, how are dividends from foreign companies taxed for a
resident private individual — specifically, are they exempt if income tax was
withheld abroad or the underlying profit was taxed abroad, and what is the rate
if not? Also: what is the deadline for submitting the annual income tax
declaration and for paying any tax due for income earned in 2026?
```

---

## Tier 3 — funds and brokers

These are better checked on the provider's own site than via Perplexity, but it's a reasonable starting point.

### 12. WEBN vs VWCE

```
Compare these two UCITS ETFs as of 2026: Amundi Prime All Country World UCITS
ETF Acc (ISIN IE0003XJA0J9, ticker WEBN) and Vanguard FTSE All-World UCITS ETF
Acc (ISIN IE00BK5BQT80, ticker VWCE). For each give: current TER, fund domicile,
index tracked, number of holdings, whether emerging markets are included, fund
size (AUM), launch date, replication method, and securities lending policy. Has
Amundi changed the index or merged any of its Prime range ETFs since launch?
```

### 13. LHV and Tuleva

```
For LHV's investment services in 2026: which stock exchanges can retail clients
trade on, what are the commission rates for buying ETFs on Xetra, and does LHV
provide automatic investment account (investeerimiskonto) reporting that
pre-fills the annual tax declaration? Separately: what are the current ongoing
fees for Tuleva's second and third pillar pension funds, which funds does Tuleva
offer, and how do their fees compare to LHV's index pension funds?
```

**Also check directly:** whether WEBN is tradeable in LHV's platform. A search in the LHV app is more reliable than any AI answer.

---

## After obtaining answers

Use the answers to update the relevant guide and rebuild the generated HTML. Sections containing recommendations need especially careful re-checking because a changed premise may reverse the conclusion.

Worth noting: Perplexity is **weakest exactly where these rules are hardest** — recent Estonian amendments, where it tends to confidently report the *announced* version of a reform rather than the *enacted* one. Estonia's 2025–2026 tax changes are a textbook case (the security tax was announced, partly implemented, then partly repealed). Where an answer matters, check it lands on an actual emta.ee or riigiteataja.ee page rather than a news article about a proposal.

---

# Round 2 — what round 1 left open

> ✅ **Round 2 is also complete** (queries 14–19, answered August 2026). Results folded into the docs. Four findings changed the guidance:
> - **Pillar II and III access dates depend on the person's pension age and Pillar III acquisition history**, rather than fixed universal ages
> - **Pillar II payouts can be 0%**, not 10%, if taken as an annuity or properly-paced fund pension
> - **Pillar III is definitively NOT transferable between spouses** — §28²(1¹) covers only §25/§26
> - **A destination country need not recognise the Estonian investment account** — the applicable domestic law and treaty require a country-specific review
>
> The prompts below are kept for reference and re-checking.

### 14. State pension age for a future cohort

**Claim:** future pension ages are not safely represented by today's age 65. The applicable cohort estimate sets the length of the bridge.

```
What is the official state pension age (vanaduspensioniiga) in Estonia for a
person born in a given year — say 1985? Explain how the life-expectancy linkage introduced
from 2027 works, whether an official projected retirement age is published for
each birth cohort, and where to check one's own personal figure. Also confirm
whether second pillar (kogumispension) payouts become available at that same
age or at a different one.
```

**Why it matters:** every year of delay lengthens the bridge the investment account has to cover.

### 15. Pillar II — payout tax and the cost of exiting

**Claim:** payouts taxed at 10% (0% as lifetime annuity), early exit at 22%, with a ~10-year wait to rejoin.

```
In Estonia in 2026, for the second pension pillar (kogumispension): (a) what
income tax rates apply to payouts at retirement age — lump sum, funded pension
payments, and lifetime annuity; (b) if a person withdraws their second pillar
money before retirement age, what tax applies and what are the submission
windows and payment dates during the year; (c) after exiting, how long must a
person wait before they can rejoin; (d) when a person stops contributing or
exits, does the 4% state contribution funded from social tax stop as well, and
does it revert to the first pillar?
```

**Why it matters:** point (d) is the entire basis for "don't exit Pillar II".

### 16. Pillar III spousal transfer — the §26 vs §28 question

**Claim:** unresolved. Round 1 found the transfer exists for §26 deductions under `varaühisus`, but couldn't establish whether it extends to §28 (Pillar III).

```
Under Estonian Tulumaksuseadus, can one spouse transfer their unused
supplementary funded pension (III pillar, TuMS §28) contribution deduction to
the other spouse in a joint declaration? §28²(1¹) appears to name only §26
deductions (training expenses, donations). Clarify whether the third-pillar
allowance is transferable between spouses, whether the varaühisus (joint
property) regime is required, and how the e-MTA declaration form actually
handles it in practice.
```

**Why it matters:** determines how Pillar III capacity works in a single-earner household and whether the matrimonial property regime affects it.

### 17. Cross-border change of tax residence

**Claim:** destination-country treatment must be checked separately for every contemplated move.

```
For a person who accumulated assets while an Estonian tax resident and later
becomes tax-resident in [DESTINATION COUNTRY]: (a) how are withdrawals from
Estonian second- and third-pillar pensions taxed, including under the applicable
double-tax treaty; (b) is an Estonian investeerimiskonto recognised, or are gains
taxed as realised; (c) does the destination apply an entry, exit or wealth tax;
and (d) how are Estonian rental property and its income taxed for a resident of
that country?
```

**Why it matters:** a cross-border move can replace Estonian tax treatment with the destination country's rules. The query must be repeated for the actual destination.

### 18. Mortgage early repayment

```
In Estonia in 2026, can a bank charge compensation or a fee for early partial or
full repayment of a floating-rate (Euribor-linked) housing loan to a consumer?
Cite the Law of Obligations Act (võlaõigusseadus) provisions implementing the EU
Mortgage Credit Directive, and state whether the answer differs for fixed-rate
loans. Also: when making a partial early repayment, can the borrower choose
between shortening the loan term and reducing the monthly payment?
```

### 19. Two smaller items

```
For an Estonian OÜ in 2026: can amounts originally paid in as share capital or
share premium be returned to the owner without income tax, and what conditions
and reporting apply? Separately: which Estonian banks or investment firms
currently support holding crypto-assets directly inside a declared
investeerimiskonto under the 2026 MiCA-based rules?
```

---

## Not Perplexity questions

Three things are better answered by looking directly:

- **Does LHV list VWCE (IE00BK5BQT80)?** Search the LHV app. The recommendation moved from WEBN to VWCE after round 1, so this is the ticker that matters now.
- **The exact procedure to declare an LHV account as an investment account** — LHV's own help pages or support, ideally before the first trade.
- **The early-repayment clause in each mortgage offer.**

---

# Round 3 — accounts, brokers and protection

> ✅ **Complete** (queries 20–23, answered August 2026). Four findings:
> - **Multiple investment accounts are explicitly allowed**, tax is calculated **in aggregate across all of them**, and transfers between your own accounts are **tax-neutral** (TuMS §17²(4)). Currency conversion inside an account is likewise not a disbursement.
> - **Fund assets are not covered by Tagatisfond at all** — because they're already segregated under depositary rules. The {{protection.investorCompensation|money}} investor limit is a backstop for a shortfall, not the primary protection.
> - **Temporary high balance protection covers qualifying property *sale* proceeds**, not ordinary savings accumulated for a purchase. Joint-account coverage is assessed per eligible holder.
> - **Swedbank matches LHV** on Xetra access, 0.14% commission, free custody to €100,000 and automatic e-MTA reporting — with a lower €3.90 minimum. **N26 investing exists in Estonia but its investment-account status is unresolved**, because custody sits with Upvest rather than N26.

The prompts below are kept for reference and re-checking.

### 20. Multiple investment accounts and transfers between them

**Why it matters most:** any multi-account strategy depends on being able to move money between declared investment accounts **without it counting as a withdrawal**. Otherwise each transfer may reduce the tax-free contribution base.

```
Under Estonia's investeerimiskonto regime: may a person hold several declared
investment accounts at the same time? When money is transferred from one
declared investment account to another declared investment account of the same
person, is that treated as a disbursement (väljamakse) from the first and a
contribution (sissemakse) to the second, or is it disregarded entirely? How
should it be reported on Form A table 6.5? Also: how are foreign currency
conversions inside an investment account treated — does an FX gain create a
taxable event, or is it deferred like any other gain within the account?
```

### 21. Deposit guarantee and investor compensation

**Why it matters:** any cash balance above the guarantee limit needs deliberate allocation. Purchase savings and recent property-sale proceeds can receive different treatment.

```
In Estonia in 2026: what is the deposit guarantee limit per depositor per credit
institution under the Tagatisfond, and how are joint accounts treated? Does
Estonia apply the EU option to protect "temporary high balances" above the limit
arising from residential property transactions, and if so up to what amount and
for how long? Separately, what is the investor compensation scheme limit for
securities held with an Estonian investment firm or bank, and what does it
actually cover — insolvency of the institution, or only fraud and failure to
segregate client assets?
```

### 22. N26 and other EEA banks as an investment account

**Why it matters:** decides whether the a balance held at a foreign EEA bank can ever be more than a cash reserve, and whether a non-Estonian bank is a viable second investment venue.

```
Can a German bank account, such as N26 Bank AG, be declared as an Estonian
investeerimiskonto by an Estonian tax resident? Does it matter whether the
securities purchased through such a bank are actually held by a separate partner
investment firm rather than the bank itself? Separately: does N26 currently
offer stock and ETF investing to residents of Estonia, and which markets and
funds are available?
```

### 23. Swedbank brokerage fees

**Why it matters:** if Swedbank has no custody fee it becomes a serious alternative to IBKR for the second account, with Estonian-language support and possibly automated reporting — though it wouldn't diversify custody outside Estonia.

```
For Swedbank Estonia in 2026: which foreign stock exchanges can retail clients
trade on, specifically whether Xetra (Frankfurt) is available? What is the
commission for buying an ETF on Xetra, and the minimum per trade? What is the
custody/safekeeping fee for foreign securities, and is there a free allowance?
Does Swedbank generate an automatic investeerimiskonto report that pre-fills
Form A table 6.5, as LHV does? Compare against LHV's published pricelist.
```

---

## Also worth checking directly, not via Perplexity

- **Does LHV list VWCE** (`IE00BK5BQT80`) and **WEBN** (`IE0003XJA0J9`)? Search the LHV app by ISIN.
- **The exact procedure to declare an LHV account as an investment account** — LHV support, ideally before the first trade.
- **The early-repayment clause in each mortgage offer.**
- **Each bank's margin at 60/70/75/80/85% LTV.** This is what decides how big a deposit to put down.


---

# Round 4 — transfers and ownership between spouses

### 24. Gifts between spouses and investment-account contributions

**Why it matters:** this determines whether a gift can establish the recipient spouse's independent investment-account contribution base.

```
In Estonia in 2026: is a gift of money between spouses subject to any tax or
reporting obligation for either party? If one spouse gifts money to the other,
and the recipient pays it into their own declared investeerimiskonto, does that
count as a valid contribution (sissemakse) building the recipient's own
tax-free withdrawal base — or does the source of the funds matter? Does the
answer change depending on the marital property regime (varaühisus vs
varalahusus)? Cite the Income Tax Act and any EMTA guidance.
```

### 25. Matrimonial property regime for a cross-border couple

**Why it matters:** decides whether "separation of property" achieves what you intend, and under which country's law.

```
For a hypothetical couple with different EU nationalities, marrying in
Estonia and resident in Estonia: under EU Regulation 2016/1103 on matrimonial
property regimes, which country's law applies by default, and can the couple
choose? If they choose Estonian varalahusus (separation of property), what
happens to each spouse's separately-held investment accounts and pension
pillars on divorce, and on death? Is a notarised marital property contract
required, and how is it recognised in the other spouse's country?
```

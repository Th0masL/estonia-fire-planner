# The investment account

**This is the single most important Estonian FIRE tool.** Learn it properly.

## How it works

You designate an ordinary bank account as an investment account and declare it to the tax authority. Then:

- Money **in** = contributions (`sissemaksed`)
- Money **out** = disbursements (`väljamaksed`)
- **Tax is due only when cumulative disbursements exceed cumulative contributions**, and only on the excess, at 22%

That's it. Inside the account, you can buy, sell, rebalance, and realise gains **with no tax event at all**. Deferral is indefinite and there is no cap.

## Why this is enormous for FIRE

**During accumulation:** you can rebalance annually, switch funds when a cheaper one appears, or take profits — none of it triggers tax. The compounding drag that dominates taxable-account investing in most countries is simply absent.

**During decumulation:** this is the part people miss. Because tax is only due once withdrawals *exceed contributions*, an early retiree can withdraw **their entire contribution base tax-free first**. If you contributed €400k over 15 years and it grew to €900k, your first €400k of withdrawals is **0% tax**. At €40k/year that is **ten years of completely tax-free retirement income** — precisely covering the sequence-risk-critical early window and the bridge to pension age.

Effectively, Estonia hands you a Roth conversion ladder for free, with no paperwork and no five-year rule.

## Constraints (read carefully)

Eligible assets under TuMS §17¹(2) ✅:

- **Publicly traded securities** on a regulated market or MTF in an EEA or OECD state
- **Fund units** — UCITS ETFs qualify cleanly
- **Bank deposits**, including fixed-term deposits
- **Investment-risk life insurance contracts**
- **Loans and equity via EEA-licensed crowdfunding platforms** (EU Crowdfunding Regulation 2020/1503) — added 2023–24. Unlicensed platforms stay outside
- **Qualifying crypto-assets acquired through a MiCA-authorised provider or issuer** — from **1 January 2025**, not 2026. Check authorisation at acquisition and the separate account-funding rules; see [Crypto](crypto.md).

Constraints:

- Follow the account-funding and receipt rules; do not assume an outside purchase can simply be relabelled as an investment-account asset. Statutory exceptions require separate evidence. See [EMTA's investment-account guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account), “How are taxable gains calculated”.
- The **cash account itself** must sit at a bank, payment institution, e-money institution or investment firm. An account held **at** a crowdfunding or crypto platform cannot be the investment account, even though assets bought through such platforms can qualify.
- **Direct real estate is not eligible.** Neither is private company equity or physical gold.
- Bookkeeping is on you (declared annually in Form A, table 6.5/7.2). Banks like LHV automate most of it if you use their account.
- Moving money out for a house deposit resets progress against your contribution base — plan large withdrawals deliberately.

## Practical setup

The canonical Estonian FIRE portfolio is boring and correct:

> **Accumulating, Irish-domiciled UCITS ETF (global equity), held inside an investment account.**

- **Accumulating** — no dividend distributions, so no annual taxable events at all even outside IK edge cases, and no reinvestment friction
- **Irish-domiciled** (ISIN starts `IE00…`) — Ireland's US tax treaty means **15%** withholding on US dividends inside the fund instead of 30% for e.g. Luxembourg funds. On a US-heavy global index that's roughly 0.15–0.25%/yr of pure, permanent return
- **Never US-domiciled** (`US…` tickers like VTI, VOO) — US estate tax hits non-resident aliens above **$60,000** with no Estonia–US estate tax treaty to protect you, and PRIIPs rules make them hard to buy from EU brokers anyway

Brokers: **LHV** (best IK integration, Xetra 0.14% min €5, custody free to €100k then 0.12%/yr), **Lightyear** (Estonian-founded, cheap, IK-aware), **Interactive Brokers** (cheapest at scale, custody outside Estonia, **confirmed IK-eligible** as an EEA investment firm — but IK reporting is manual). Detail in [portfolio.md](portfolio.md#lhv-or-ibkr-for-the-etf-itself).

---

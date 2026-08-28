# Where to hold it — brokers, and parking cash

This guide keeps running into two practical questions. Which provider should you
buy through, and where should you put cash that you need soon and don't want to
put in shares? Most people can answer both the same way, so both are on this
page.

## The short version

Use any Estonian provider that reports to the Tax Board for you. LHV, Swedbank,
SEB and Lightyear all do this. They send your investment account report in
automatically, so you don't have to keep the records yourself, and that is what
keeps the tax deferral working.

They cost different amounts. Lightyear is free to buy ETFs and free to hold them.
The banks charge {{brokers.commissionRate|pct}} each time you buy, and they start
charging you to hold your shares once you have more than
{{brokers.custodyFreeThreshold|money}}. If you buy an ETF every month, that adds
up.

It doesn't matter much if you pick the wrong one. All four are regulated in
Estonia, all four keep your shares separate from their own money, and you can
move later.

## The field

| | **Lightyear** | **LHV** | **Swedbank** | **SEB** | **Interactive Brokers** |
|---|---|---|---|---|---|
| What it is | investment firm | bank | bank | bank | foreign broker |
| Cost to buy an ETF | **free** | {{brokers.commissionRate|pct}}, min {{brokers.lhvMinCommission|money2}} | {{brokers.commissionRate|pct}}, min {{brokers.swedbankMinCommission|money2}} | about the same as LHV | a few cents |
| Cost to hold shares | **nothing** | free up to {{brokers.custodyFreeThreshold|money}}, then {{brokers.lhvCustodyAboveMonthly|pct3}} a month | free up to {{brokers.custodyFreeThreshold|money}}, then {{brokers.swedbankCustodyAboveMonthly|pct3}} a month, **never more than {{brokers.swedbankCustodyMonthlyCap|money}} a month** | free up to {{brokers.custodyFreeThreshold|money}} | nothing |
| Changing currency | {{brokers.lightyearFxFee|pct}} | market rate | market rate | market rate | close to market rate |
| Reports to the Tax Board | ✅ automatically | ✅ automatically | ✅ automatically | ✅ automatically | ❌ **you do it yourself, every year** |
| Baltic shares | ❌ | ✅ | ✅ | ✅ | only some |
| Regulated in | Estonia | Estonia | Estonia | Estonia | Ireland / US |

Luminor also sells securities services, but it publishes very little that you can
compare against the others. This guide doesn't know enough about it to recommend
it or to warn you off it.

### Lightyear is the cheap one, and it is Estonian

Lightyear Europe AS has a licence from the Estonian Financial Supervision
Authority. It is an Estonian company under Estonian supervision, not an app based
somewhere far away. It charges nothing to buy ETFs and nothing to hold them, it
works with the investment account, and it sends your report to the Tax Board the
same way the banks do.

There are four things to know before you choose it:

- **It is not a bank.** You get no current account, no card and no mortgage. Your
  cash there is covered by investor protection, which pays up to
  {{protection.investorCompensation|money}}, and not by the deposit guarantee,
  which pays up to {{protection.depositGuarantee|money}}. This matters less than
  it sounds for money you have invested, because all of these providers keep your
  shares separate from their own money. It matters more for cash you leave
  sitting there.
- **You cannot buy Baltic shares.** If you are buying global index funds, which
  is what most plans in this guide do, you will never notice.
- **Changing currency costs {{brokers.lightyearFxFee|pct}}.** The banks don't
  charge you separately for this. If you buy ETFs priced in euros, you never pay
  it.
- **It is younger than the banks.** It has been around for less time and has less
  history behind it. That is something you have to judge for yourself.

### LHV and Swedbank do the same job

Both give you access to the same markets, both charge
{{brokers.commissionRate|pct}}, both charge nothing until the shares in the
account are worth more than {{brokers.custodyFreeThreshold|money}}, and both
report to the Tax Board for you. Swedbank has a lower minimum fee per trade
({{brokers.swedbankMinCommission|money2}}, against LHV's
{{brokers.lhvMinCommission|money2}}), which only matters if you buy small amounts
each month. LHV's app is nicer to use, but that is a matter of taste.

Pick whichever bank you already use and don't think about it any further.

### The fee for holding shares, which is easy to miss

Above {{brokers.custodyFreeThreshold|money}} the two banks stop being the same.
Swedbank has a maximum monthly fee. LHV does not.

| Value of the shares | LHV charges | Swedbank charges |
|---|---|---|
| {{brokers.custodyFreeThreshold|money}} | nothing | nothing |
| €300,000 | €240 a year | €96 a year |
| €600,000 | €600 a year | €96 a year |
| €1,000,000 | €1,080 a year | €96 a year |

Both banks only charge you on the money above
{{brokers.custodyFreeThreshold|money}}. Swedbank never charges more than
{{brokers.swedbankCustodyMonthlyCap|money}} a month, which is
{{brokers.swedbankCustodyMonthlyCap|money12}} a year, however big your portfolio
gets. That is a small enough amount to ignore.

**One condition on those Swedbank numbers.** VAT at {{vat|pct}} is added to the
fee, unless the account holds nothing but fund units. An account holding only
ETFs pays no VAT, so the figures above are what you actually pay. Buy a few
individual shares and hold them in the same account, and the whole fee gains
{{vat|pct}}, so {{brokers.swedbankCustodyMonthlyCap|money12}} becomes about €119.
This guide builds all-ETF portfolios, so the exemption normally applies, but it
is worth knowing that one single share can switch it off.

LHV does not publish whether the same exemption applies to its fee, so assume VAT
is added there and treat LHV's numbers above as the lower bound.

### What Interactive Brokers is actually good for

There is one good reason to open an account there, and two reasons that used to
be good and are not any more.

**The good reason is that shares can be held outside Estonia.** In a typical
Estonia-resident plan, employment income, housing, banking and pensions may all be tied to one
small country. Holding some financial assets through another jurisdiction spreads a risk that
nothing else in this guide deals with.

**It is no longer the cheapest way to buy.** Lightyear lets you buy ETFs for
free, and that is what most people reading this are doing.

**It no longer saves you much on fees for holding shares.** Swedbank will never
charge you more than {{brokers.swedbankCustodyMonthlyCap|money12}} a year, and
Lightyear charges nothing at all, so there is not much to save.

**What it costs you is the paperwork.** Estonian providers tell the Tax Board
about your investment account for you. Interactive Brokers does not, and it never
will. You have to write down every payment in and every payment out yourself, and
keep it correct for as long as the account is open. If you get it wrong, you lose
the tax deferral. That is work you take on forever, in exchange for holding your
money in another country.

### What to do first

1. **Open one Estonian account.** Choose Lightyear if you care most about cost
   and you are buying ETFs. Choose LHV or Swedbank if you want it next to your
   bank account, or if you want to buy Baltic shares.
2. **Only open a second one if you can say why.** Wanting your money held outside
   Estonia is a good reason. Saving
   {{brokers.swedbankCustodyMonthlyCap|money12}} a year is not.
3. **A third account is almost never worth it.**

---

## Parking cash: a money market fund inside the investment account

Some money has a job to do soon. A deposit on a house, an emergency fund, a tax
bill due next October. Shares are the wrong place for it, and a normal savings
account pays almost nothing. The usual answer is to buy a **EUR money market fund
inside your investment account**, though a fixed-term deposit is a real
alternative and sometimes the better one.

### Why this beats a savings account

| | Savings account at a bank | Money market fund in an investment account |
|---|---|---|
| What you earn | nothing much on a current account, more on a fixed term | roughly the ECB rate, minus about 0.1% |
| Tax | you pay {{incomeTax|pct}} on the interest **in the year you receive it** | **you pay nothing** until you take out more than you put in |
| If the bank fails | the deposit guarantee pays up to {{protection.depositGuarantee|money}} | this is not a deposit, so it is not covered — see below |
| Getting your money | straight away | you sell, wait two days for settlement, then transfer |

The tax difference is the one that grows over time. Interest on a savings account
is taxed the year you earn it. Money earned inside an investment account is not
taxed until you take more out of the account than you put in. So the money that
would have gone to the Tax Board each spring stays invested and keeps earning.

### How to do it

1. **Get an investment account.** Tell the Tax Board in e-MTA that one of your
   bank accounts is an *investeerimiskonto*. Estonian providers usually make this
   a checkbox when you open a securities account. [The investment account
   guide](investment-account.md) explains the rules you have to follow.
2. **Move the cash into that account.** Every euro you put in counts as a
   contribution, and you can take that same amount back out later without paying
   tax on it.
3. **Buy a EUR money market fund** in that account. Pick an **accumulating**
   version. It pays nothing out to you, so there is nothing to declare and no
   money leaves the account.
4. **Leave it alone.** Sell it when you need the money. Allow two days for the
   sale to settle and another day to transfer the money, and work that out before
   you book the notary rather than on the day.

Lightyear does this for you as a savings product instead of a fund you buy
yourself. Your money goes into money market funds run by someone else, it costs
{{brokers.lightyearMoneyMarketFee|pct}} a year or less, and you can get it back
the same day or the next day. It is a reasonable way to do the same thing with
less effort, but you don't get to choose the fund.

### Which providers actually pay the ECB rate on cash

The ECB deposit facility rate is {{marketRates.ecbDepositFacility|pct}}
({{marketRates.asOf}}). Here is what the different routes pay against it, and
what each one costs in tax and in flexibility.

| Route | Pays now | Tax on the return | Money is protected by | Getting it back |
|---|---|---|---|---|
| **Money market fund** at LHV, Swedbank or SEB | about {{marketRates.moneyMarketFundNet|pct}} | deferred inside an investment account | fund assets held separately, no deposit guarantee | sell, then two days |
| **Lightyear Savings** | about {{marketRates.lightyearSavings|pct}} | deferred inside an investment account | same, held in third-party funds | same or next day |
| **Term deposit** at Bigbank, Holm or Inbank | up to about {{marketRates.termDepositBest|pct}} | {{incomeTax|pct}}, in the year it is paid | deposit guarantee, {{protection.depositGuarantee|money}} | locked until the term ends |
| **Term deposit** at LHV, SEB or Swedbank | up to about {{marketRates.termDepositBigBanks|pct}} | {{incomeTax|pct}}, in the year it is paid | deposit guarantee, {{protection.depositGuarantee|money}} | locked until the term ends |
| **Interactive Brokers cash** | about {{marketRates.ibkrEurCash|pct}} | {{incomeTax|pct}}, declared by hand | investor protection, not the deposit guarantee | same day |
| **Ordinary current account** | roughly nothing | nothing to tax | deposit guarantee, {{protection.depositGuarantee|money}} | instant |

Three things stand out.

**The smaller Estonian banks pay more than the ECB rate, not less.** Bigbank,
Holm Bank and Inbank compete for funding and price above the big banks. They are
all licensed in Estonia and covered by the same
{{protection.depositGuarantee|money}} guarantee. A term deposit there is a
sensible home for money with a fixed date, and it beats what a money market fund
can reach.

**The money market fund wins on tax and on flexibility, not on rate.** Its
advantage is that the return is not taxed while it stays in the investment
account, and that it can be sold on any day rather than at the end of a fixed
term. But that tax advantage is smaller than it first looks for money that is
going to be spent. Taking money out to buy a house is a withdrawal, and once
withdrawals pass contributions, the gain is taxed. The deferral changes *when*
the tax is paid, not whether it is paid at all.

**Interactive Brokers is the worst of these for cash.** It pays a spread below
the benchmark, it pays nothing at all on the first
{{marketRates.ibkrCashThreshold|money}}, and below
{{marketRates.ibkrFullRateNav|money}} of account value the rate is scaled down
further. It is a place to hold investments, not cash.

⚠️ These rates move. They are a snapshot from {{marketRates.asOf}}, and unlike
most numbers in this guide they are not law. Compare current deposit rates at
minuraha.ee, which publishes a barometer of what Estonian banks are paying.

### Cash at a bank in another country

Plenty of people living in Estonia still have a bank account somewhere else,
often in the country they moved from. Two things decide whether it is a good
place to keep cash, and neither of them is the advertised rate.

**A tax exemption in another country does not survive Estonian residency.** Many
national savings products pay a modest rate and make it tax-free, and the tax
break is the entire point of the product. An Estonian tax resident is taxed by
Estonia on worldwide income at {{incomeTax|pct}}, and under the usual tax treaty
wording interest is taxed where the saver lives. So a tax-free account abroad is
not tax-free here, and a rate that looked competitive can end up below what an
ordinary Estonian term deposit pays. Always compare these after Estonian tax,
never on the headline.

**A second country's deposit guarantee is genuinely separate.** Every EU country
runs its own scheme covering {{protection.depositGuarantee|money}}, funded by
that state. Cash split between an Estonian bank and a bank in another EU country
is covered twice over, not once. For a balance well above the limit, that is a
real reason to keep the foreign account open even when its rate is poor.

Two pieces of admin come with it. The interest has to be declared in Estonia and
taxed here, even where the other country taxed none of it. And the foreign bank
reports the account to the Estonian tax authority automatically under the common
reporting standard, so the balance is visible either way.

### Which fund to buy

You want a fund that follows **€STR**, which is the euro short-term rate. When
people say "the ECB rate", this is roughly what they mean. Look for one that
costs less than about 0.15% a year, that is accumulating, and that trades on
Xetra so your Estonian provider can buy it.

The biggest one by far is the **Xtrackers II EUR Overnight Rate Swap UCITS ETF
1C**. Its ticker on Xetra is XEON and its ISIN is LU0290358497. It costs 0.10% a
year, it is accumulating, it is based in Luxembourg, and it holds about €22
billion. **Amundi Smart Overnight Return** (LU1190417599) costs the same and does
a similar job, though it is actively managed rather than following an index.

⚠️ **Check that you can actually buy it before you plan around it.** Neither LHV
nor Swedbank publishes a list of what you can buy. You search for the ticker or
the ISIN once you are logged in. Both banks give you broad access to Xetra and
XEON is one of the most traded things on that exchange, so it should be there,
but search for it in your own account first.

**Three things the fee doesn't tell you:**

**XEON doesn't hold what it tracks.** Instead of holding short-term loans, it has
swap agreements with several banks that pay it the rate. This is normal, and it
is why the fund is cheap, but it means you depend on those banks in a way you
wouldn't with a fund that holds the real thing. If this money absolutely has to
be there, that is worth more thought than a small difference in fees.

**It follows €STR plus 0.085%, not €STR itself.** The fee comes out of that. The
difference is small, but it explains why the rate you read about and the return
you get are not the same number.

**It is not a savings account, and it can lose money.** A money market fund is
not covered by the {{protection.depositGuarantee|money}} deposit guarantee at
all. Your money is held separately from the provider's own, which actually
protects you better in the case that matters — if the broker fails, your holding
is still yours — but it is a different kind of protection, not a bigger version
of the same one. And the value can fall. XEON lost 0.03% in 2022, when the
underlying rate was still around zero. That is a small loss, but it is a loss, so
don't treat this as a savings account.

### When a savings account is still the better choice

If the amount is small, or you might need the money within a week, or you don't
want to worry about a two-day wait before a notary appointment, use a savings
account and accept the slightly worse rate. On €20,000 over six months the
difference is about €100 before tax. That is not worth the extra complication if
you would rather not deal with it.

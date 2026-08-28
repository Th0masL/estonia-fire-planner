# Household, not individual

Dependants and multiple adults change a FIRE plan in more ways than simply increasing spending. This chapter describes the rules and scenarios that households should model explicitly.

> ✅ Figures in this document were verified against Sotsiaalkindlustusamet, Tervisekassa and EMTA in August 2026. Two things changed on 1 January 2026 and are reflected below: the **dependent-spouse health insurance route was abolished**, and the **parental benefit cap was cut** from 3× to 2× the average wage. The child-related income tax exemption was repealed earlier, in **2024**.

## The good news first

### Two adults — where the allowances do and don't double

Estonian allowances are **per person**, but most of them only have value against actual income:

| Wrapper | Per person | Household of two | Useful with one earner? |
|---|---|---|---|
| Pillar III contribution with 22% refund | {{pillar3.maxAnnual|money}}/yr | €12,000/yr | ❌ **No** — see below |
| Basic exemption | {{basicExemptionMonthly|money}}/month | €1,400/month | ❌ Only against actual income |
| Investment accounts | Unlimited | Each adult may have one | ✅ Yes |
| Pillar II | Individual | Two accounts accruing | Only on earned income |

> **Pillar III capacity is per earner, not per person.** The refund is a deduction against your own income tax, so a partner with no earnings who contributes €6,000 gets **nothing back**. In a single-earner household the usable figure is **€6,000 and €1,320**.
>
> Unused room cannot be passed to the other spouse: TuMS §28²(1¹) allows spousal transfer only for §25 and §26 deductions (housing interest, training costs, donations), never §28. See [Pension pillars II and III](pensions.md#the-spousal-transfer-caveat-for-single-earner-households).

**Separate investment accounts can be useful for both adults**, since the wrapper capacity is unlimited and unconditional.

### Children are genuinely cheap in Estonia

The Estonian state covers or subsidises several major child-related costs:

- **Public school**: free, including school lunch
- **Kindergarten** (`lasteaed`): heavily subsidised municipal fee plus food
- **Healthcare**: children are **covered regardless of whether their parents are insured**, birth to 19 ✅
- **Higher education**: free in Estonian-language programmes
- **Child allowance** (`lapsetoetus`) ✅: **€80/month** for the 1st and 2nd child, **€100** for the 3rd and each subsequent, until 19
- **Large family allowance** ✅: **€450/month** for 3–6 children, €650 for 7+ — automatic, no application
- **Parental benefit** (`vanemahüvitis`) ✅: 100% of prior income, capped — see the 2026 changes below

This matters for FIRE arithmetic: in many countries kids add €500–1,500/month of unavoidable cost. In Estonia the number is much smaller, and a big chunk of the remainder is discretionary.

### Health insurance — the family exit closed in 2026

**The dependent-spouse route was abolished on 1 January 2026**, with all remaining coverage ending by 31 January 2026. What applies now:

1. **Children are covered unconditionally**, birth to 19, regardless of either parent's status ✅ — unchanged
2. ~~A spouse raising a child under 8 insured as a dependant~~ — **abolished**
3. A parent can still be covered **in their own right** — not as a dependant — if they are:
   - **receiving parental benefit** (`vanemahüvitis`), or
   - **raising a child under 3**, or
   - receiving the non-working large-family allowance (3–6 children under 19, at least one under 8)

   Only **one parent per family** can use these.

**What this means in practice:** once the youngest child turns 3 the own-right route closes, and the dependent-spouse route closed in January 2026. **A non-working adult in that position is most likely uninsured and may not know it** — worth checking rather than discovering it at a GP visit.

**The fix is cheaper than it used to be.** The voluntary Tervisekassa contract was liberalised in 2026: the old requirement for 12 months of prior insured status is **gone**, and the only condition is permanent residence in Estonia. It costs **{{healthInsurance.voluntaryMonthly|money}}/month — {{healthInsurance.voluntaryMonthly|money12}}/year** (from 1 July 2026). One year, fixed term, covers everything except sick-leave benefits.

**A new child may restore free coverage for one parent** — during parental benefit and then through the under-3 route. The exact period depends on dates and eligibility, after which the same gap can reopen.

**Net effect on the plan:** budget **{{healthInsurance.voluntaryMonthly|money12}}/year per uninsured adult**. For a fully retired couple that's €6,528/year, or about **€187,000 of extra FI number** at a 3.5% SWR. It can be one of the larger FIRE line items and strengthens the case for at least one adult retaining qualifying earned income.

---

## What gets harder

### The FI number is a household number

One portfolio, one set of expenses, two people's preferences. Practical consequences:

- **Both partners have to actually want this.** A FIRE plan one partner is enthusiastic about and the other tolerates does not survive 15 years. This is the single most common failure mode, and no spreadsheet detects it
- **Two incomes are a risk buffer**, not just more money — the probability of both incomes stopping at once is far lower than one
- **"Retire early" rarely means both at once.** One partner stopping while the other keeps working is usually the first realistic milestone, and in Estonia it's also the health-insurance solution

### Spending is not flat — model it in phases

Standard FIRE maths assumes constant real spending forever. With children that's simply wrong, and it makes the FI number too high:

```
Now ──────────► Kids at home (~20 yrs) ──────────► Kids independent ──────► 
     elevated spending: food, childcare,              spending drops back
     bigger home, activities, holidays ×4             toward two-adult level
```

Child costs are a **finite liability**, not a perpetual one. Multiplying today's with-kids spending by 28.6 assumes you'll be paying for children for the rest of your life.

**Better approach:** work out your **two-adult baseline spending**, base the FI number on that, and treat the child years as a separate, time-limited block to be funded from income and a dedicated sinking fund. It's more accurate and usually gives a noticeably lower target.

The one exception: **university and helping with a first home** land *after* the kids leave. Budget those as discrete future liabilities rather than assuming spending simply drops.

### Insurance stops being optional

This is where single-person FIRE advice actively misleads. With dependents and a mortgage, the risk that matters isn't a bad sequence of returns — it's one earner dying or becoming disabled while the children are young and the loan is outstanding.

- **Term life insurance** on adults whose income or unpaid work the household relies on, covering at least the outstanding mortgage plus several years of spending until the portfolio is large enough to self-insure. Pricing depends on age and health
- **Disability / critical illness cover** — statistically more likely than death during working years, and more financially damaging because expenses continue
- Buy **standalone term life** rather than the bank's loan-protection product where possible. Bank policies are convenient but typically more expensive, decline in value with the loan, and are tied to the lender
- The stay-at-home or lower-earning partner needs cover too — their unpaid work has a real replacement cost

### Legal structure

Households combining dependants, debt and cross-border legal ties should treat this as load-bearing rather than routine paperwork:

- **Wills** for both partners
- **Guardianship** for the children — who, and under which country's law
- **Matrimonial property regime** — the applicable national regime determines who owns the portfolio and what happens on death
- **Inheritance and estate taxation** — Estonia has no inheritance tax, but another relevant jurisdiction may apply one

For a cross-border couple this is a legal question as much as a financial one, and the two are best handled together rather than separately.

---

## Modelling changes in family size

Financially, the main variables:

Two rules changed on **1 January 2026**, and they pull in opposite directions ✅:

- **The cap was cut from 3× to 2× the average wage** — from €5,265/month to **€3,806/month**, a 28% reduction. This applies to children born from 2026 onward; children born by 31 December 2025 keep the old cap. For a high earner this is a significant loss.
- **The earned-income reduction was abolished.** Previously, earning above a threshold while receiving parental benefit cut the benefit. That limit is **gone** — a parent can now earn unlimited income and still receive the full benefit. For a household where the higher earner keeps working, this is a straightforward gain.

Other considerations:

- **Parental benefit is based on the prior calendar year's income**, so a parent with little or no qualifying income may receive an amount near the statutory floor regardless of household income. The benefit follows the individual, not the household
- The marginal cost of an additional child may be lower where equipment and other fixed costs are reused
- **A third child** unlocks the €450/month large-family allowance plus much better KredEx terms (5% down payment, 2% fee)
- **Space requirements** feed straight back into [property-purchase.md](property-purchase.md); expected household changes belong in the property scenario
- It may **restore health insurance** for one eligible parent during the benefit period and then through the under-3 route

**This shouldn't be a financial decision.** But it does shift the FIRE timeline by a few years, and it's better to know that going in than to discover it later.

---

## What the simulator needs at household level

- Combined net income
- Combined spending, including all child costs
- **Both** partners' assets, pension pillars, and investment accounts
- A separate two-adult baseline spending figure for the FI calculation
- Existing life and disability cover, if any

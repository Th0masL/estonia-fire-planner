# Household, not individual

Dependants and multiple adults change a FIRE plan in more ways than simply increasing spending. This chapter describes the rules and scenarios that households should model explicitly.

> **Partial review — 20 September 2026:** healthcare cross-references have been
> corrected. The remaining benefit amounts, formulas, education claims and
> household recommendations below are still under review, not certified by this
> notice. Confirm them before relying on them in a plan.

## The good news first

### Two adults — where the allowances do and don't double

Estonian allowances are **per person**, but most of them only have value against actual income:

| Wrapper | Per person | Household of two | Useful with one earner? |
|---|---|---|---|
| Pillar III deduction ceiling | Up to {{pillar3.maxAnnual|money}}/yr, subject to income and tax | Assess each taxpayer separately | Depends on each person's taxable income, not employment alone |
| Basic exemption | {{basicExemptionMonthly|money}}/month | €1,400/month | ❌ Only against actual income |
| Investment accounts | Unlimited | Each adult may have one | ✅ Yes |
| Pillar II | Individual | Two accounts accruing | Only on earned income |

> **Pillar III deductions depend on each taxpayer's eligible income and available tax.** Non-salary income may matter. A contribution alone does not guarantee a refund.
>
> The simulator does not transfer unused allowance between partners. Spousal-transfer legal details remain open in the current review; see [Pension pillars II and III](pensions.md#the-spousal-transfer-caveat-for-single-earner-households).

**Separate investment accounts can be useful for both adults**, since the wrapper capacity is unlimited and unconditional.

### Children are genuinely cheap in Estonia

The Estonian state covers or subsidises several major child-related costs:

- **Public school**: free, including school lunch
- **Kindergarten** (`lasteaed`): heavily subsidised municipal fee plus food
- **Healthcare**: children have a separate residence-based eligibility route; see the healthcare section below.
- **Higher education**: free in Estonian-language programmes
- **Child allowance** (`lapsetoetus`) ✅: **€80/month** for the 1st and 2nd child, **€100** for the 3rd and each subsequent, until 19
- **Large family allowance** ✅: **€450/month** for 3–6 children, €650 for 7+ — automatic, no application
- **Parental benefit** (`vanemahüvitis`) ✅: 100% of prior income, capped — see the 2026 changes below

This matters for FIRE arithmetic: in many countries kids add €500–1,500/month of unavoidable cost. In Estonia the number is much smaller, and a big chunk of the remainder is discretionary.

### Health insurance — check each person's route

The domestic child-related dependent-spouse route ended in January 2026, but
other family routes remain. Confirm which parent is insured: changing benefit
recipients or parental leave can change coverage. A child's third birthday does
not prove that every other route has ended.

Children have a separate residence-based route; near-pension-age dependants
and cross-border S1 cases need distinct checks. See the
[reviewed healthcare guide](health-insurance.md#family-routes-distinguish-the-different-bases)
for the sources, conditions and unresolved personal questions.

Model the actual uncovered period and possible future premiums. Do not treat a
temporary gap as a perpetual expense or assume that one working partner covers
the other. Temporary coverage is not a confirmed lifelong healthcare start.
---

## What gets harder

### The FI number is a household number

One portfolio, one set of expenses, two people's preferences. Practical consequences:

- **Both partners have to actually want this.** A FIRE plan one partner is enthusiastic about and the other tolerates does not survive 15 years. This is the single most common failure mode, and no spreadsheet detects it
- **Two incomes are a risk buffer**, not just more money — the probability of both incomes stopping at once is far lower than one
- **Compare different stopping dates.** One partner's continued employment does not automatically insure the other; confirm both people's coverage separately.

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

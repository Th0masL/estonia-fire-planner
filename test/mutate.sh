#!/usr/bin/env bash
# Mutation testing: break the engine on purpose and check the suites notice.
#
# A suite that passes is not evidence of anything until you know it can fail.
# Each mutation below is a defect that could plausibly be written by accident;
# any that survives is a gap, and every gap found this way has produced a real
# test - twice it produced a real bug fix as well.
#
# A mutation whose target text is no longer in the source counts as a failure:
# a stale target tests nothing, and reporting success over it hides the gap.
# Suites run fastest first and stop at the first one that notices.
#
#   ./test/mutate.sh
set -u
cd "$(dirname "$0")/.."
FILES="src/calc.js src/rules.js src/investment-account-tax.js"
BAK=$(mktemp -d)
for f in $FILES; do cp "$f" "$BAK/$(basename "$f")"; done
restore() { for f in $FILES; do cp "$BAK/$(basename "$f")" "$f"; done; }
trap 'restore; rm -rf "$BAK"' EXIT

SUITES="review-fixes audit-fixes verify crosscheck pillar3 pension-service health-coverage
  cash-reserve mortgage-spending pension-lump-sum pension-stress funded-fi coast
  solver-window investment-account-tax tax-integration monotonic roundtrip invariants"

apply() {
  restore
  python3 - "$1" "$2" "$3" <<'PY'
import sys
p, old, new = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(p, encoding='utf-8').read()
if old not in s:
    sys.exit('  !! mutation target no longer in ' + p + ': ' + old[:60])
open(p, 'w', encoding='utf-8').write(s.replace(old, new, 1))
PY
}

survived=0
stale=0
check() {
  local name="$1"; shift
  if ! apply "$1" "$2" "$3"; then
    printf '  STALE     %s\n' "$name"
    stale=$((stale + 1))
    return
  fi
  local suite
  for suite in $SUITES; do
    if ! node "test/$suite.mjs" >/dev/null 2>&1; then
      printf '  caught    %s (by %s)\n' "$name" "$suite"
      return
    fi
  done
  printf '  SURVIVED  %s\n' "$name"
  survived=$((survived + 1))
}

echo
# ---- calc.js
check "draw taken after growth instead of before" src/calc.js \
  'let shortfall = reserveCash(balances, reserve);
  const spent = spendPortfolio(balances, withdrawal, reserve);
  shortfall += spent.shortfall;
  const cashBeforeReturn = bucketTotal(balances, '"'"'cash'"'"');
  const investedBeforeReturn = bucketTotal(balances, '"'"'invested'"'"');
  growBalances(balances, duration, cashReturn, investmentReturn);' \
  'const cashBeforeReturn = bucketTotal(balances, '"'"'cash'"'"');
  const investedBeforeReturn = bucketTotal(balances, '"'"'invested'"'"');
  growBalances(balances, duration, cashReturn, investmentReturn);
  let shortfall = reserveCash(balances, reserve);
  const spent = spendPortfolio(balances, withdrawal, reserve);
  shortfall += spent.shortfall;'

check "spending growth added to the withdrawal rate" src/calc.js \
  'return Math.max(0, spend / (a.swr - g) - permanent / a.swr);' \
  'return Math.max(0, spend / (a.swr + g) - permanent / a.swr);'

check "the state's Pillar II share dropped" src/calc.js \
  'const rate = (p.pillar2Rate ?? 0.02) + RATES.pillar2.stateRate;' \
  'const rate = (p.pillar2Rate ?? 0.02);'

check "unemployment insurance not deducted" src/calc.js \
  'const ui = grossAnnual * RATES.unemploymentInsuranceEmployee;' \
  'const ui = 0;'

check "mortgage term read as months" src/calc.js \
  'const i = r / 12, n = termYears * 12;' \
  'const i = r / 12, n = termYears;'

check "rental income not netted off" src/calc.js \
  'const perpetual = discretionaryAnnual + housingRunningAnnual - rentalNet;' \
  'const perpetual = discretionaryAnnual + housingRunningAnnual;'

check "Pillar I solidarity half ignored" src/calc.js \
  'return solidarity * p1.solidarityWeight + insurance * (1 - p1.solidarityWeight);' \
  'return insurance;'

check "health cover charged past its confirmed start" src/calc.js \
  'return x + healthPerPerson * overlapYears(from, to, -Infinity, healthEndFor(p));' \
  'return x + healthPerPerson * (to - from);'

check "fund payments ignore market returns" src/calc.js \
  'income += base * active * (1 + a.realReturn) ** Math.max(0, from - draw) *' \
  'income += base * active *'

check "pension haircut not applied" src/calc.js \
  'const base = potAtDraw(p, yearsToFi, kind) / p.payoutYears * share;' \
  'const base = potAtDraw(p, yearsToFi, kind) / p.payoutYears;'

check "child costs charged for the whole working life" src/calc.js \
  '(date < childCostsEndYear ? 12 * (s.childCosts || 0) : 0)' \
  '12 * (s.childCosts || 0)'

check "part-year deposit valued below principal" src/calc.js \
  'const annuityFactor = (r, n) => (r === 0 || n <= 1 ? n :' \
  'const annuityFactor = (r, n) => (r === 0 ? n :'

check "haircut replay keeps the haircut" src/calc.js \
  'pensionBreakdownIn(year, yearsToFi, null, { pots: 1, state: 1 })' \
  'pensionBreakdownIn(year, yearsToFi, null)'

check "CoastFIRE target taken from the first person" src/calc.js \
  'coastToPensionUnlock: coastAt(Math.max(...people.map((p) => p.pensionUnlockYear))),' \
  'coastToPensionUnlock: coastAt(primary.birthYear + ages.pillarUnlockAge),'

# ---- rules.js
check "years after the pots mixes people" src/rules.js \
  'const alone = Math.max(0, sim.timeline.planEndYear - last.pillarIncomeEndYear);' \
  'const alone = Math.max(0, sim.assumptions.planToAge - sim.fi.pillarIncomeEndsAge);'

check "a voluntary contract ignored as health cover" src/rules.js \
  'const insured = p.employed || p.healthInsurance;' \
  'const insured = p.employed;'

check "unused Pillar III allowance never reported" src/rules.js \
  'if (p3.unclaimed > 1) {' \
  'if (p3.unclaimed > 1e9) {'

# ---- investment-account-tax.js
check "withdrawal not grossed up for tax" src/investment-account-tax.js \
  'const requiredGross = taxFree + (requestedNet - taxFree) / (1 - taxRate);' \
  'const requiredGross = requestedNet;'

check "tax-free allowance never used up" src/investment-account-tax.js \
  'allowance: Math.max(0, account.allowance - gross) },' \
  'allowance: account.allowance },'

check "real withdrawal not converted to nominal" src/investment-account-tax.js \
  'const result = withdrawInvestmentAccount(nominal, requestedNetReal * priceLevel, taxRate);' \
  'const result = withdrawInvestmentAccount(nominal, requestedNetReal, taxRate);'

echo
if [ "$stale" -gt 0 ]; then
  echo "$stale mutation target(s) no longer exist - update them to the current code"
fi
if [ "$survived" -gt 0 ]; then
  echo "$survived mutation(s) survived - the suites have a gap there"
fi
if [ "$stale" -gt 0 ] || [ "$survived" -gt 0 ]; then exit 1; fi
echo "every mutation was caught"

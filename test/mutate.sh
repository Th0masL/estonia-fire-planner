#!/usr/bin/env bash
# Mutation testing: break the engine on purpose and check the suites notice.
#
# A suite that passes is not evidence of anything until you know it can fail.
# Each mutation below is a defect that could plausibly be written by accident;
# any that survives is a gap, and every gap found this way has produced a real
# test - twice it produced a real bug fix as well.
#
#   ./test/mutate.sh
set -u
cd "$(dirname "$0")/.."
BAK=$(mktemp)
cp src/calc.js "$BAK"
trap 'cp "$BAK" src/calc.js; rm -f "$BAK"' EXIT

apply() {
  cp "$BAK" src/calc.js
  python3 - "$1" "$2" <<'PY'
import sys
old, new = sys.argv[1], sys.argv[2]
p = 'src/calc.js'
s = open(p, encoding='utf-8').read()
if old not in s:
    sys.exit('  !! mutation target no longer in the source: ' + old[:60])
open(p, 'w', encoding='utf-8').write(s.replace(old, new, 1))
PY
}

survived=0
check() {
  local name="$1"; shift
  apply "$1" "$2" || return
  local caught=0
  for suite in crosscheck verify monotonic invariants; do
    node "test/$suite.mjs" >/dev/null 2>&1 || caught=$((caught + 1))
  done
  if [ "$caught" -eq 0 ]; then
    printf '  SURVIVED  %s\n' "$name"
    survived=$((survived + 1))
  else
    printf '  caught    %s (%d suites)\n' "$name" "$caught"
  fi
}

echo
check "draw taken after growth instead of before" \
  'pf -= Math.max(0, needIn(year, fiYear) - pensionIncomeIn(year, y));
      if (pf < -1e-6) return false;
      pf *= 1 + a.realReturn;' \
  'pf *= 1 + a.realReturn;
      pf -= Math.max(0, needIn(year, fiYear) - pensionIncomeIn(year, y));
      if (pf < -1e-6) return false;'

check "spending growth added to the withdrawal rate" \
  'return Math.max(0, (spend - permanent) / (a.swr - g));' \
  'return Math.max(0, (spend - permanent) / (a.swr + g));'

check "the state's Pillar II share dropped" \
  'const rate = (p.pillar2Rate ?? 0.02) + RATES.pillar2.stateRate;' \
  'const rate = (p.pillar2Rate ?? 0.02);'

check "unemployment insurance not deducted" \
  'const ui = grossAnnual * RATES.unemploymentInsuranceEmployee;' \
  'const ui = 0;'

check "mortgage term read as months" \
  'const i = r / 12, n = termYears * 12;' \
  'const i = r / 12, n = termYears;'

check "rental income not netted off" \
  'const perpetual = discretionaryAnnual + housingRunningAnnual - rentalNet;' \
  'const perpetual = discretionaryAnnual + housingRunningAnnual;'

check "Pillar I solidarity half ignored" \
  'const perYear = p1.solidarityWeight + (1 - p1.solidarityWeight) * wageRatio;' \
  'const perYear = wageRatio;'

check "health cover charged past state pension age" \
  '(x, p) => x + (year < p.statePensionYear ? healthPerPerson : 0), 0);' \
  '(x, p) => x + healthPerPerson, 0);'

check "fund payments ignore market returns" \
  'income += base * active * (1 + a.realReturn) ** Math.max(0, from - draw) *' \
  'income += base * active *'

check "pension haircut not applied" \
  'const base = (potAtUnlock(p, yearsToFi) / p.payoutYears) * potsShare;' \
  'const base = potAtUnlock(p, yearsToFi) / p.payoutYears;'

echo
if [ "$survived" -gt 0 ]; then
  echo "$survived mutation(s) survived - the suites have a gap there"
  exit 1
fi
echo "every mutation was caught"

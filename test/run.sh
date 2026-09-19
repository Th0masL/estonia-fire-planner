#!/usr/bin/env bash
# Every suite, in the order that fails fastest.
#
#   arithmetic  - is this number right?
#   crosscheck  - does it match arithmetic computed OUTSIDE the engine?
#   monotonic   - does the answer move the right way when an input moves?
#   invariants  - do the numbers in one run agree with each other?
#   roundtrip   - does a plan survive storage, a file and a share link?
#   output      - does the built site match the engine?
#
# Only crosscheck can catch a model that is consistently wrong: the others all
# compare the engine to itself. Run test/mutate.sh to check the suites still bite.
#
# output.mjs reads the built HTML, so build first.
set -e
cd "$(dirname "$0")/.."
python3 build.py > /dev/null
for suite in verify crosscheck audit-fixes pillar3 pension-service health-coverage monotonic invariants roundtrip output; do
  node "test/$suite.mjs"
done
echo "all suites passed"

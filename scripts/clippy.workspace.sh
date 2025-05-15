#!/usr/bin/env bash

set -euo pipefail

CANISTERS=console,observatory,mission_control,orbiter,satellite,test_satellite

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    ./docker/clippy "--$canister"
done

./docker/clippy --sputnik
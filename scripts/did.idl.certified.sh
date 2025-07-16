#!/usr/bin/env bash

function generate_certified_did_idl() {
  local canister=$1
  local declaration_path=$2

  sed "s/\['query'\]/\[\]/g" "$declaration_path"/"$canister".factory.did.js > "$declaration_path"/"$canister".factory.certified.did.js
}

CANISTERS=console,observatory,mission_control,orbiter,satellite,sputnik

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_certified_did_idl "$canister" "src/declarations/$canister"
done

FIXTURES=test_satellite

for fixture in $(echo $FIXTURES | sed "s/,/ /g")
do
    generate_certified_did_idl "$fixture" "src/tests/declarations/$fixture"
done

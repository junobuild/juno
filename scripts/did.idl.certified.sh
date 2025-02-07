#!/usr/bin/env bash

function generate_certified_did_idl() {
  local canister=$1
  local declaration_path=$2

  sed "s/\['query'\]/\[\]/g" src/declarations/"$declaration_path"/"$canister".factory.did.js > src/declarations/"$declaration_path"/"$canister".factory.certified.did.js
}

CANISTERS=console,observatory,mission_control,orbiter,satellite

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_certified_did_idl "$canister" "$canister"
done

FIXTURES=test_satellite

for fixture in $(echo $FIXTURES | sed "s/,/ /g")
do
    generate_certified_did_idl "$fixture" "fixtures/$fixture"
done

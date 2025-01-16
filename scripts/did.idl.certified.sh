#!/usr/bin/env bash

function generate_certified_did_idl() {
  local canister=$1

  sed "s/\['query'\]/\[\]/g" src/declarations/"$canister"/"$canister".factory.did.js > src/declarations/"$canister"/"$canister".factory.certified.did.js
}

CANISTERS=console,observatory,mission_control,orbiter,satellite

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_certified_did_idl "$canister"
done


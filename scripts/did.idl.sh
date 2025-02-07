#!/usr/bin/env bash

function generate_did_idl() {
  local canister=$1
  local canister_root=$2

  if [ ! -d "src/declarations/$canister" ]
  then
       mkdir "src/declarations/$canister"
  fi

  didc bind -t ts "$canister_root"/"$canister".did > src/declarations/"$canister"/"$canister".did.d.ts
  didc bind -t js "$canister_root"/"$canister".did > src/declarations/"$canister"/"$canister".did.js
}

CANISTERS=console,observatory,mission_control,orbiter,satellite

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did_idl "$canister" "src/$canister"
done

FIXTURES=test_satellite

for fixture in $(echo $FIXTURES | sed "s/,/ /g")
do
    generate_did_idl "$fixture" "src/tests/fixtures/$fixture"
done

generate_did_idl "ic" "candid"

#!/usr/bin/env bash

function generate_did_idl() {
  local canister=$1
  local canister_root=$2
  local declaration_path=$3

  if [ ! -d "$declaration_path" ]
  then
       mkdir "$declaration_path"
  fi

  didc bind -t ts "$canister_root"/"$canister".did > "$declaration_path"/"$canister".did.d.ts
  didc bind -t js "$canister_root"/"$canister".did > "$declaration_path"/"$canister".did.js
}

CANISTERS=console,observatory,mission_control,orbiter,satellite

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did_idl "$canister" "src/$canister" "src/declarations/$canister"
done

generate_did_idl "ic" "candid" "src/declarations/ic"

# Fixtures

FIXTURES=test_satellite

for fixture in $(echo $FIXTURES | sed "s/,/ /g")
do
    generate_did_idl "$fixture" "src/tests/fixtures/$fixture" "src/tests/declarations/$fixture"
done


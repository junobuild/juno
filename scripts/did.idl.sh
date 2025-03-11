#!/usr/bin/env bash

function generate_did_idl() {
  local canister=$1
  local canister_root=$2
  local declaration_path=$3

  if [ ! -d "$declaration_path" ]
  then
       mkdir "$declaration_path"
  fi

  junobuild-didc -t ts --input "$canister_root"/"$canister".did --output "$declaration_path"/"$canister".did.d.ts
  junobuild-didc -t js --input "$canister_root"/"$canister".did --output "$declaration_path"/"$canister".did.js
}

# Assert junobuild-didc is installed

if [[ ! "$(command -v junobuild-didc)" || "$(junobuild-didc --version)" != "junobuild-didc 0.0.1" ]]
then
    echo "could not find junobuild-didc 0.0.1"
    echo "junobuild-didc version 0.0.1 is needed, please run the following command:"
    echo "  cargo install junobuild-didc --version 0.0.1"
    exit 1
fi

# Canisters

CANISTERS=console,observatory,mission_control,orbiter,satellite,sputnik

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


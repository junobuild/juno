#!/usr/bin/env bash

source ./scripts/did.utils.sh

CANISTERS=console,observatory,mission_control,orbiter

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did "$canister" "src/$canister"
done

# With serverless functions

function prepend_import_did() {
  local crate=$1
  local canister_root=$2
  local canister=$3
  local canister_extension=$4

  echo -e "import service \"$canister_extension.did\";\n\n$(cat  "$crate")" >  "$canister_root/$canister.did"
}

# Satellite specific code due to inheritance of the crate
generate_did satellite "src/satellite" satellite_extension

function prepend_satellite_import_did() {
  local canister=$1
  local canister_extension=$2

  crate_root="src/libs/$canister"
  canister_root="src/$canister"

  prepend_import_did "$crate_root/$canister.did" "$canister_root" "$canister" "$canister_extension"
}

prepend_satellite_import_did satellite satellite_extension

# Fixtures

FIXTURES=test_satellite

for fixture in $(echo $FIXTURES | sed "s/,/ /g")
do
    generate_did "$fixture" "src/tests/fixtures/$fixture" "$fixture"_extension
done

prepend_import_did "src/libs/satellite/satellite.did" "src/tests/fixtures/test_satellite" test_satellite test_satellite_extension
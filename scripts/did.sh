#!/usr/bin/env bash

source ./scripts/did.utils.sh

CANISTERS=console,observatory,mission_control,orbiter

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did "$canister" "src/$canister"
done

# Satellite specific code due to inheritance of the crate
generate_did satellite "src/satellite" satellite_extension

function prepend_import_did() {
  local canister=$1
  local canister_extension=$2

  crate_root="src/libs/$canister"
  canister_root="src/$canister"

  echo -e "import service \"$canister_extension.did\";\n\n$(cat  "$crate_root/$canister.did")" >  "$canister_root/$canister.did"
}

prepend_import_did satellite satellite_extension
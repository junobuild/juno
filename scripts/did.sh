#!/usr/bin/env bash

source ./scripts/did.utils.sh

################
# Root modules #
################

CANISTERS=console,observatory,mission_control,orbiter

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did "$canister" "src/$canister"
done

##############
# Root crate #
##############

SATELLITE_CRATE_DID="src/libs/satellite/satellite.did"

#########################################
# Satellite (with serverless functions) #
#########################################

generate_did satellite "src/satellite" satellite_extension

prepend_import_did $SATELLITE_CRATE_DID "src/satellite" satellite satellite_extension

#######################################
# Sputnik (with serverless functions) #
#######################################

generate_did sputnik "src/sputnik" sputnik_extension

prepend_import_did $SATELLITE_CRATE_DID "src/sputnik" sputnik sputnik_extension

#############################################
# Fixtures (with Rust serverless functions) #
#############################################

RUST_FIXTURES=test_satellite

for fixture in $(echo $RUST_FIXTURES | sed "s/,/ /g")
do
    generate_did "$fixture" "src/tests/fixtures/$fixture" "$fixture"_extension
done

prepend_import_did $SATELLITE_CRATE_DID "src/tests/fixtures/test_satellite" test_satellite test_satellite_extension

#############################################
# Fixtures (with TypeScript serverless functions) #
#############################################

TYPESCRIPT_FIXTURES=test_sputnik:sputnik

for fixture in $(echo $TYPESCRIPT_FIXTURES | sed "s/,/ /g")
do
    canister=$(echo $fixture | cut -d: -f1)
    wasm=$(echo $fixture | cut -d: -f2)

    generate_did "$canister" "src/tests/fixtures/$canister" "$canister"_extension "$wasm"
done

prepend_import_did $SATELLITE_CRATE_DID "src/tests/fixtures/test_sputnik" test_sputnik test_sputnik_extension

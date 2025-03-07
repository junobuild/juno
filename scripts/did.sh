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

#######################################
# Fixtures (with serverless functions) #
#######################################

FIXTURES=test_satellite

for fixture in $(echo $FIXTURES | sed "s/,/ /g")
do
    generate_did "$fixture" "src/tests/fixtures/$fixture" "$fixture"_extension
done

prepend_import_did $SATELLITE_CRATE_DID "src/tests/fixtures/test_satellite" test_satellite test_satellite_extension
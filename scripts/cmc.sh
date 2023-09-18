#!/usr/bin/env bash

# Install Cmc locally:
# - the canister ID must be rkp4c-7iaaa-aaaaa-aaaca-cai
# - you can set an arbitrary canister ID as the governance canister id in the initial payload for CMC. This canister ID would then have be allowed to make the calls that only the governance canister could make. Or you can set it to aaaaa-aa and then no canister would be able to make the privileged calls.

IC_VERSION=6223a38cfae726e9cc83db9ae27f35ca979dd0d8
curl -o cmc.wasm.gz "https://download.dfinity.systems/ic/$IC_VERSION/canisters/cycles-minting-canister.wasm.gz"
gunzip cmc.wasm.gz

# We need a custom did file to install the Cmc locally because the did files in the repo has not initial param for the service
# curl -o cmc.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/nns/cmc/cmc.did"
# That's why we use the custom cmc.did available in [../candid/cmc.did]

dfx identity new minter
dfx identity use minter
MINT_ACC=$(dfx ledger account-id)

dfx identity use default

LEDGER_ID=$(dfx canister id ledger)

dfx deploy cmc --specified-id rkp4c-7iaaa-aaaaa-aaaca-cai --argument '(record {minting_account_id = opt"'${MINT_ACC}'"; ledger_canister_id = principal"'${LEDGER_ID}'"; governance_canister_id = principal"'aaaaa-aa'"; last_purged_notification = opt 0;})'
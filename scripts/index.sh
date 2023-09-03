#!/usr/bin/env bash

IC_VERSION=6223a38cfae726e9cc83db9ae27f35ca979dd0d8
curl -o index.wasm.gz "https://download.dfinity.systems/ic/$IC_VERSION/canisters/ic-icp-index-canister.wasm.gz"
gunzip index.wasm.gz
curl -o index.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/rosetta-api/icp_ledger/index/index.did"

LEDGER_ID=$(dfx canister id ledger)

dfx deploy index --specified-id r7inp-6aaaa-aaaaa-aaabq-cai --argument '(record {ledger_id = principal"'${LEDGER_ID}'";})'

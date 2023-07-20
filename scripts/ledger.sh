#!/usr/bin/env bash

# Install ledger locally as documented in:
# https://internetcomputer.org/docs/current/developer-docs/integrations/ledger/ledger-local-setup

IC_VERSION=f02cc38677905e24a9016637fddc697039930808
curl -o ledger.wasm.gz "https://download.dfinity.systems/ic/$IC_VERSION/canisters/ledger-canister_notify-method.wasm.gz"
gunzip ledger.wasm.gz
curl -o ledger.private.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/rosetta-api/ledger.did"
curl -o ledger.public.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/rosetta-api/icp_ledger/ledger.did"

dfx identity new minter
dfx identity use minter
MINT_ACC=$(dfx ledger account-id)

dfx identity use default

# LEDGER_ACC=$(dfx ledger account-id)
LEDGER_ACC=1fac02b103220f2fe5ad314b98767db6ea7443cafc6a0a34c8adba4198a14d03

dfx deploy ledger --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai --argument '(record {minting_account = "'${MINT_ACC}'"; initial_values = vec { record { "'${LEDGER_ACC}'"; record { e8s=100_000_000_000 } }; }; send_whitelist = vec {}})'

# Rust example to transfer ICP
# https://github.com/dfinity/examples/tree/master/rust/tokens_transfer
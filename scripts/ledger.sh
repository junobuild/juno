#!/usr/bin/env bash

# Install ledger locally as documented in:
# https://internetcomputer.org/docs/current/developer-docs/integrations/ledger/ledger-local-setup

IC_VERSION=d87954601e4b22972899e9957e800406a0a6b929
curl -o ledger.wasm.gz "https://download.dfinity.systems/ic/$IC_VERSION/canisters/ledger-canister.wasm.gz"
gunzip ledger.wasm.gz
curl -o ledger.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/rosetta-api/icp_ledger/ledger.did"

dfx identity new minter
dfx identity use minter
MINTER_ACCOUNT_ID=$(dfx ledger account-id)

dfx identity use default

LEDGER_ACCOUNT_ID=$(dfx ledger account-id)

dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai ledger --argument "
  (variant {
    Init = record {
      minting_account = \"$MINTER_ACCOUNT_ID\";
      initial_values = vec {
        record {
          \"$LEDGER_ACCOUNT_ID\";
          record {
            e8s = 100_000_000_000 : nat64;
          };
        };
      };
      send_whitelist = vec {};
      transfer_fee = opt record {
        e8s = 10_000 : nat64;
      };
      token_symbol = opt \"LICP\";
      token_name = opt \"Local ICP\";
    }
  })
"
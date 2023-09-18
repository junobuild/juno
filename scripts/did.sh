#!/usr/bin/env bash

function generate_did() {
  local canister=$1
  canister_root="src/$canister"

  cargo build --manifest-path="$canister_root/Cargo.toml" \
      --target wasm32-unknown-unknown \
      --release --package "$canister"

  candid-extractor "target/wasm32-unknown-unknown/release/$canister.wasm" > "$canister_root/$canister.did"
}

CANISTERS=console,observatory,mission_control,satellite,orbiter

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did "$canister"
done
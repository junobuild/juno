#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <module_name>"
  exit 1
fi

MODULE=$1
WASM_MODULE="${MODULE}.wasm"

cargo build --target wasm32-unknown-unknown -p $MODULE  --release --locked

# TODO: did

# TODO: ic-wasm

mkdir -p ./target/deploy

gzip -c "./target/wasm32-unknown-unknown/release/${WASM_MODULE}" > "./target/deploy/${WASM_MODULE}.tmp.gz"

mv "./target/deploy/${WASM_MODULE}.tmp.gz" "./target/deploy/${WASM_MODULE}.gz"
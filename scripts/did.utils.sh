function generate_did() {
  local canister=$1
  local canister_root=$2
  local did_filename=$3

  cargo build --manifest-path="$canister_root/Cargo.toml" \
      --target wasm32-unknown-unknown \
      --release --package "$canister"

  if [ -z "$did_filename" ]; then
    candid-extractor "target/wasm32-unknown-unknown/release/$canister.wasm" > "$canister_root/$canister.did"
  else
    candid-extractor "target/wasm32-unknown-unknown/release/$canister.wasm" > "$canister_root/$did_filename.did"
  fi
}
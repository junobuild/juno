function clippy_wasm32() {
  local member=$1

  RUSTFLAGS='--cfg getrandom_backend="custom"' cargo clippy --target=wasm32-unknown-unknown -p "$member" -- -A deprecated
}

function clippy_wasi() {
  local member=$1

  RUSTFLAGS='--cfg getrandom_backend="custom"' cargo clippy --target=wasm32-wasip1 -p "$member" -- -A deprecated
}

CANISTERS=console,observatory,mission_control,orbiter,satellite,test_satellite

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    clippy_wasm32 "$canister"
done

clippy_wasi sputnik
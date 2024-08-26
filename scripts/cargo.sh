#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <module_name>"
  exit 1
fi

CARGO_HOME=${CARGO_HOME:-$HOME/.cargo}

MODULE=$1
WASM_MODULE="${MODULE}.wasm"

TARGET="wasm32-unknown-unknown"
RUSTFLAGS="--remap-path-prefix $CARGO_HOME=/cargo -C link-args=-zstack-size=3000000"

# Build module WASM
RUSTFLAGS="$RUSTFLAGS" cargo build --target "$TARGET" -p "$MODULE" --release --locked

# Generate metadata for Docker image
VERSION=$(cargo metadata --format-version=1 --no-deps | jq -r '.packages[] | select(.name == "'"$MODULE"'") | .version')
node ./scripts/cargo.metadata.mjs "$MODULE" "$VERSION"

RELEASE_DIR="./target/${TARGET}/release"

# Clean and create temporary and output folder
WASM_DIR="./target/wasm"
DID_DIR="./target/did"
DEPLOY_DIR="./target/deploy"

rm -rf "${WASM_DIR}"
mkdir -p "${WASM_DIR}"

rm -rf "${DID_DIR}"
mkdir -p "${DID_DIR}"

mkdir -p "${DEPLOY_DIR}"

# Generate did
candid-extractor "${RELEASE_DIR}/${WASM_MODULE}" > "${DID_DIR}/${WASM_MODULE}.did"

# Optimize WASM and set metadata
ic-wasm \
    "${RELEASE_DIR}/${WASM_MODULE}" \
    -o "${WASM_DIR}/${WASM_MODULE}" \
    shrink

# adds the content of did to the `icp:public candid:service` custom section of the public metadata in the wasm
ic-wasm "${WASM_DIR}/${WASM_MODULE}" -o "${WASM_DIR}/${WASM_MODULE}" metadata candid:service -f "${DID_DIR}/${WASM_MODULE}.did" -v public

if [ "${WASM_MODULE}" == "satellite" ]
then
  # add the type of build "stock" to the satellite. This way, we can identify whether it's the standard canister ("stock") or a custom build ("extended") of the developer.
  ic-wasm "${WASM_DIR}/${WASM_MODULE}" -o "${WASM_DIR}/${WASM_MODULE}" metadata juno:build -d "stock" -v public
fi

if [ "${MODULE}" == "satellite" ] || [ "${MODULE}" == "console" ];
then
  # indicate support for certificate version 1 and 2 in the canister metadata
  ic-wasm "${WASM_DIR}/${WASM_MODULE}" -o "${WASM_DIR}/${WASM_MODULE}" metadata supported_certificate_versions -d "1,2" -v public
fi

gzip -c --no-name --force "${WASM_DIR}/${WASM_MODULE}" > "${DEPLOY_DIR}/${WASM_MODULE}.tmp.gz"

mv "${DEPLOY_DIR}/${WASM_MODULE}.tmp.gz" "${DEPLOY_DIR}/${WASM_MODULE}.gz"

echo ""
echo "👉 ${DEPLOY_DIR}/${WASM_MODULE}.gz"
echo ""
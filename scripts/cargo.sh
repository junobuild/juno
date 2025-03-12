#!/usr/bin/env bash

set -euo pipefail

USAGE="Usage: $0 <canister_name>"

if [ -z "$1" ]; then
  echo "$USAGE"
  exit 1
fi

CARGO_HOME=${CARGO_HOME:-$HOME/.cargo}

CANISTER=
WITH_CERTIFICATION=0
BUILD_TYPE=

# Source directory where to find $CANISTER/Cargo.toml
SRC_ROOT_DIR="$PWD/src"

# Default target is wasm32-unknown-unknown
TARGET=wasm32-unknown-unknown

# Parse optional arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mission_control)
      CANISTER="mission_control"
      break
      ;;
    --satellite)
      WITH_CERTIFICATION=1
      CANISTER=satellite
      BUILD_TYPE="stock"
      break
      ;;
    --console)
      CANISTER="console"
      WITH_CERTIFICATION=1
      break
      ;;
    --observatory)
      CANISTER="observatory"
      break
      ;;
    --orbiter)
      CANISTER="orbiter"
      break
      ;;
    --sputnik|--test_sputnik)
      CANISTER="sputnik"
      WITH_CERTIFICATION=1
      BUILD_TYPE="extended"
      TARGET="wasm32-wasip1"
      break
      ;;
    --test_satellite)
      CANISTER="test_satellite"
      WITH_CERTIFICATION=1
      BUILD_TYPE="extended"
      SRC_ROOT_DIR="$PWD/src/tests/fixtures"
      break
      ;;
    *)
      echo "ERROR: unknown argument $1"
      echo "$USAGE"
      exit 1
      ;;
  esac
done

WASM_CANISTER="${CANISTER}.wasm"

############
# Metadata #
############

# Generate metadata for Docker image
VERSION=$(cargo metadata --format-version=1 --no-deps | jq -r '.packages[] | select(.name == "'"$CANISTER"'") | .version')
node ./scripts/cargo.metadata.mjs "$CANISTER" "$VERSION"

#########
# Build #
#########

# We do not want to build only the dependencies in this script
ONLY_DEPS=

# Clean and create temporary and output folder
BUILD_DIR="./target/wasm"
DEPLOY_DIR="./target/deploy"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

mkdir -p "${DEPLOY_DIR}"

# Ensure we rebuild the canister. This is useful locally for rebuilding canisters that have no code changes but have resource changes.
touch "$SRC_ROOT_DIR"/"$CANISTER"/src/lib.rs

# Source the script to set environment variables before building the canister
source "$PWD/docker/build-set-env"

# Define environment variables
build_set_env "$@"

# Source the script to effectively build the canister
source "$PWD/docker/build-canister"

# Build the canister
build_canister "$CANISTER" "$SRC_ROOT_DIR" "$BUILD_DIR" "$ONLY_DEPS" "$WITH_CERTIFICATION" "$BUILD_TYPE" "$TARGET"

# Move the result to the deploy directory to upgrade the canister in the local replica
mv "$BUILD_DIR/${WASM_CANISTER}.gz" "${DEPLOY_DIR}/${WASM_CANISTER}.gz"

echo ""
echo "👉 ${DEPLOY_DIR}/${WASM_CANISTER}.gz"
echo ""
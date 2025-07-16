#!/usr/bin/env bash

set -euo pipefail

USAGE="Usage: $0 <canister_name>"

if [ -z "$1" ]; then
  echo "$USAGE"
  exit 1
fi

CARGO_HOME=${CARGO_HOME:-$HOME/.cargo}

CANISTER=
OUTPUT=
WITH_CERTIFICATION=0

# Source directory where to find $CANISTER/Cargo.toml
SRC_ROOT_DIR="$PWD/src"
# Source directory where to find $CANISTER/juno.package.json
PKG_JSON_DIR=

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
    --test_sputnik)
      CANISTER="sputnik"
      OUTPUT="test_sputnik"
      WITH_CERTIFICATION=1
      TARGET="wasm32-wasip1"
      PKG_JSON_DIR="$PWD/src/tests/fixtures/$OUTPUT"
      break
      ;;
    --sputnik)
      CANISTER="sputnik"
      WITH_CERTIFICATION=1
      TARGET="wasm32-wasip1"
      break
      ;;
    --test_satellite)
      CANISTER="test_satellite"
      WITH_CERTIFICATION=1
      SRC_ROOT_DIR="$PWD/src/tests/fixtures"
      PKG_JSON_DIR="$PWD/src/tests/fixtures/$CANISTER"
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
OUTPUT_CANISTER="${OUTPUT:-$CANISTER}.wasm"

# if not set the default package.json path to search for is the source of the canister
if [ ${#PKG_JSON_DIR} -eq 0 ]; then
    PKG_JSON_DIR="$SRC_ROOT_DIR/$CANISTER"
fi

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

# Source the script to prepare the package.json metadata for the canister
source "$PWD/docker/prepare-package"

create_canister_package_json "$CANISTER" "$SRC_ROOT_DIR" "$PWD/src" "$PKG_JSON_DIR" "$OUTPUT"

# Ensure we rebuild the canister. This is useful locally for rebuilding canisters that have no code changes but have resource changes.
touch "$SRC_ROOT_DIR"/"$CANISTER"/src/lib.rs

# Source the script to perform tasks before building the canister
source "$PWD/docker/pre-build-canister"

# Run pre-build steps
pre_build_canister "$@"

# Source the script to effectively build the canister
source "$PWD/docker/build-canister"

# Build the canister
build_canister "$CANISTER" "$SRC_ROOT_DIR" "$PKG_JSON_DIR" "$BUILD_DIR" "$ONLY_DEPS" "$WITH_CERTIFICATION" "$TARGET"

# Move the result to the deploy directory to upgrade the canister in the local replica
mv "$BUILD_DIR/${WASM_CANISTER}.gz" "${DEPLOY_DIR}/${OUTPUT_CANISTER}.gz"

echo ""
echo "👉 ${DEPLOY_DIR}/${OUTPUT_CANISTER}.gz"
echo ""
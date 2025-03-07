#!/usr/bin/env bash

set -euo pipefail

USAGE="Usage: $0 <module_name> [--with-certification] [--build-type=stock|extended] [--fixture]"

if [ -z "$1" ]; then
  echo "$USAGE"
  exit 1
fi

CARGO_HOME=${CARGO_HOME:-$HOME/.cargo}

MODULE=$1
WASM_MODULE="${MODULE}.wasm"
WITH_CERTIFICATION=0
BUILD_TYPE=

# Source directory where to find $CANISTER/Cargo.toml
SRC_ROOT_DIR="$PWD/src"

# Parse optional arguments
shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-certification)
      WITH_CERTIFICATION=1
      shift
      ;;
    --build-type=*)
      BUILD_TYPE="${1#--build-type=}"
      shift
      ;;
    --fixture)
      SRC_ROOT_DIR="$PWD/src/tests/fixtures"
      shift
      ;;
    *)
      echo "ERROR: unknown argument $1"
      echo "$USAGE"
      exit 1
      ;;
  esac
done

echo "---> $SRC_ROOT_DIR $PWD"

############
# Metadata #
############

# Generate metadata for Docker image
VERSION=$(cargo metadata --format-version=1 --no-deps | jq -r '.packages[] | select(.name == "'"$MODULE"'") | .version')
node ./scripts/cargo.metadata.mjs "$MODULE" "$VERSION"

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

# Source the script to effectively build the canister
source "$PWD/docker/build-canister"

# Build the canister
build_canister "$MODULE" "$SRC_ROOT_DIR" "$BUILD_DIR" "$ONLY_DEPS" "$WITH_CERTIFICATION" "$BUILD_TYPE"

# Move the result to the deploy directory to upgrade the module in the local replica
mv "$BUILD_DIR/${WASM_MODULE}.gz" "${DEPLOY_DIR}/${WASM_MODULE}.gz"

echo ""
echo "👉 ${DEPLOY_DIR}/${WASM_MODULE}.gz"
echo ""
#!/usr/bin/env bash

set -euo pipefail

EXTRA_ARGS=("$@")

export RUSTFLAGS='--cfg getrandom_backend="custom"'

cargo test -p junobuild-auth --lib --tests "${EXTRA_ARGS[@]}"
cargo test -p junobuild-shared --lib --tests "${EXTRA_ARGS[@]}"
cargo test -p junobuild-utils --lib --tests "${EXTRA_ARGS[@]}"
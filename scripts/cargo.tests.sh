#!/usr/bin/env bash

set -euo pipefail

EXTRA_ARGS=("$@")

export RUSTFLAGS='--cfg getrandom_backend="custom"'

cargo test -p junobuild-auth "${EXTRA_ARGS[@]}"
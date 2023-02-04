#!/usr/bin/env bash

MANAGER=$(dfx identity get-principal)

dfx deploy console --argument "$(didc encode '(record {manager = principal"'${MANAGER}'";})' --format hex)" --argument-type raw

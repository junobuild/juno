#!/usr/bin/env bash

if [ -z "$1" ]; then
  read -r -p "Enter the Wallet ID: " PRINCIPAL
else
  PRINCIPAL=$1
fi

curl "http://localhost:5999/ledger/transfer/?to=$PRINCIPAL"
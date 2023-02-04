# Hacking

This document explains how to run locally [Juno](https://juno.build).

## Table of contents

- [Run locally](#run-locally)
- [Development](#development)
- [Top-up](#top-up)

## Run locally

```
cd admin
npm ci
dfx start --clean
```

First, deploy II:

```
dfx deploy internet_identity
```

Collect "internet_identity" canister ID and update [client/src/main.ts](client/src/main.ts) (if not `rrkah-fqaaa-aaaaa-aaaaq-cai`).

Next, deploy the "old" ledger.

Run `npm run ledger:account-id` to get the account identifier for the principal use in NodeJS script.

Then, to install the `ledger` do the two following things:

1. Update the account identifier you just got in the installation script [./script/ledger.sh](./script/ledger.sh)

2. update the entry in `dfx.json` with the private did file

```
"ledger": {
  "type": "custom",
  "wasm": "ledger.wasm",
  "candid": "ledger.private.did"
}
```

then run command line

```
./scripts/ledger.sh
```

Revert `dfx.json`, collect the ledger canister id and update its value in (if not `r7inp-6aaaa-aaaaa-aaabq-cai`):

- [./scripts/ledger.utils.mjs](./scripts/ledger.utils.mjs)
- [shared/src/env.rs](/admin/src/shared/src/env.rs)

double check that you received the balance

```
npm run ledger:balance
```

Next, important, the Cmc canister should be installed at this precise step because somehow its canister ID should reflect the one on mainnet

```
./scripts/cmc.sh
```

The generated canister ID should be `rkp4c-7iaaa-aaaaa-aaaca-cai`

Next finally deploy Juno canisters:

```
./scripts/console.sh
```

Collect "console" canister id and update [shared/src/env.rs](/admin/src/shared/src/env.rs) (if not `rno2w-sqaaa-aaaaa-aaacq-cai`).

```
dfx deploy observatory
```

Collect the deployed canister id and update its value in [shared/src/env.rs](/admin/src/shared/src/env.rs) (if not `renrk-eyaaa-aaaaa-aaada-cai`).

Finally, install mission control center + satellite wasm and deploy frontend:

```
dfx deploy mission_control (it will fail because it needs a user as init param but we need to deploy it for dfx to be able to install the frontend)
dfx deploy satellite (same same)
npm run install:wasm
dfx deploy frontend
```

## Development

To run the console:

```
cd admin
npm run dev
```

## Top-up

Top-up the console with some cycles:

```
npm run topup
```

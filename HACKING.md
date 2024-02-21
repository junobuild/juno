# Hacking

This document explains how to run locally [Juno](https://juno.build).

## Table of contents

- [Run locally](#run-locally)
- [Development](#development)
- [Top-up](#top-up)
- [Troubleshooting](#troubleshooting)

## Run locally

```
git clone https://github.com/junobuild/juno
cd juno
npm ci
dfx start --clean
```

First, deploy II:

```
dfx deploy internet_identity --specified-id rdmx6-jaaaa-aaaaa-aaadq-cai
```

Collect "internet_identity" canister ID and update [client/src/main.ts](client/src/main.ts) (if not `rdmx6-jaaaa-aaaaa-aaadq-cai`).

Next, deploy the ICP ledger:

```
./scripts/ledger.sh
./scripts/index.sh
```

Continue with the installation of the Cmc (note its canister ID should reflect the one on mainnet):

```
./scripts/cmc.sh
```

Finally deploy Juno canisters:

```
dfx canister create console --specified-id cokmz-oiaaa-aaaal-aby6q-cai
dfx deploy observatory --specified-id klbfr-lqaaa-aaaak-qbwsa-cai
dfx deploy console
```

As we need to init those canisters launched at runtime, install mission control center, satellites and orbiters wasm:

```
dfx deploy mission_control (it will fail because it needs a user as init param but we need to deploy it for dfx to be able to install the frontend)
dfx deploy satellite (same same)
dfx deploy orbiter (same same)
npm run console:install:wasm
```

If you wish, you can also deploy the frontend:

```
dfx deploy frontend
```

## Development

To run the console:

```
npm run dev
```

## Top-up

Top-up the local console with some cycles:

```
npm run console:topup
```

## Troubleshooting

### didc command not found

Go to [Candid releases](https://github.com/dfinity/candid/releases) page to download your OS version didc.

Example, for macos

```sh
release=$(curl --silent "https://api.github.com/repos/dfinity/candid/releases/latest" | grep -e '"tag_name"' | cut -c 16-25)
curl -fsSL https://github.com/dfinity/candid/releases/download/$release/didc-macos > ~/.cargo/bin/didc
chmod 755 ~/.cargo/bin/didc
```

### candid-extractor command not found

```sh
cargo install candid-extractor
```

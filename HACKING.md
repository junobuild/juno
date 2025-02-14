# Hacking

This document explains how to run locally [Juno](https://juno.build).

## Table of contents

- [Local Development](#local-development)
- [Building the Smart Contracts](#building-the-smart-contracts)
- [Useful Administration Commands](#useful-administration-commands)
- [Troubleshooting](#troubleshooting)
- [Releasing Crates](#releasing-crates)

## Local Development

Before you begin developing and contributing to Juno, ensure the following tools are installed on your machine:

- NodeJS ([Website](https://nodejs.org/en))
- Rust and Cargo ([Installation](https://doc.rust-lang.org/cargo/getting-started/installation.html))
- Docker ([Windows](https://docs.docker.com/desktop/install/windows-install/), [MacOS](https://docs.docker.com/desktop/install/mac-install/), or [Linux](https://docs.docker.com/desktop/install/linux-install/)).

### Setting Up Your Environment

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/junobuild/juno
cd juno
npm ci
```

### Running the Development Environment

To start Juno locally, perform the following steps:

1. **Start the emulator**: This command runs a local emulator that replicates the behavior of the Internet Computer blockchain, deploying necessary smart contracts using a custom Docker image ([repo](https://github.com/junobuild/juno-docker)) developed specifically for Juno.

```
npm run emulator
```

2. **Launch the front-end administration console**: Open another terminal window and start the console, which is configured to interact with the emulator.

```
npm run dev
```

Both the emulator and the front-end server support live reloading, facilitating a smoother development experience.

## Building the Smart Contracts

You can manually build the smart contracts using standard Rust and Cargo commands targeting `wasm32-unknown-unknown`. For example:

```
cargo build --target wasm32-unknown-unknown -p console  --release
```

However, these commands do not instruct the emulator to redeploy the resulting builds. Therefore, to automate both build and deployment, we provide the following npm commands:

```
npm run build:console
npm run build:observatory
npm run build:satellite
npm run build:mission-control
npm run build:orbiter
```

## Useful Administration Commands

Here are a few commands that can be useful if you spend some time developing and contributing features for Juno:

| Command                   | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `npm run ledger:transfer` | Transfer 55 ICP to a Mission Control aka Wallet. |

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

## Releasing Crates

To publish the `junobuild-shared` or crates, use the following command:

```sh
RUSTFLAGS='--cfg getrandom_backend="custom"' cargo publish --target wasm32-unknown-unknown -p junobuild-shared
```

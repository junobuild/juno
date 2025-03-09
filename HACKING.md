# Hacking

This document explains how to run [Juno](https://juno.build) locally.

## Table of Contents

- [Local Development](#local-development)
- [Building the Modules](#building-the-modules)
- [Required Tools](#required-tools)
- [Useful Administration Commands](#useful-administration-commands)

## Local Development

Before you begin developing and contributing to Juno, ensure the following tools are installed on your machine:

- Node.js ([Website](https://nodejs.org/en))
- Rust and Cargo ([Installation](https://doc.rust-lang.org/cargo/getting-started/installation.html))
- Docker ([Windows](https://docs.docker.com/desktop/install/windows-install/), [MacOS](https://docs.docker.com/desktop/install/mac-install/), or [Linux](https://docs.docker.com/desktop/install/linux-install/))

### Setting Up Your Environment

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/junobuild/juno
cd juno
npm ci
```

### Running the Development Environment

1. **Start the emulator**: This command runs a local emulator that replicates the behavior of the Internet Computer blockchain, deploying necessary smart contracts using a custom Docker image (repo) developed specifically for Juno.

```bash
npm run emulator
```

2. **Launch the front-end administration console**: Open another terminal window and start the console, which is configured to interact with the emulator.

```bash
npm run dev
```

> [!TIP]  
> Both the emulator and the front-end server support live reloading, facilitating a smoother development experience.

## Building the Modules

> [!NOTE]  
> In addition to Cargo, a few additional tools are required to build the modules. See [Required Tools](#required-tools) for details.

You can manually build the smart contracts using standard Rust and Cargo commands targeting `wasm32-unknown-unknown`. For example:

```bash
cargo build --target wasm32-unknown-unknown -p console --release
```

However, these commands do not instruct the emulator to redeploy the resulting builds. Therefore, to automate both build and deployment, we provide the following npm commands:

```bash
npm run build:console
npm run build:observatory
npm run build:satellite
npm run build:mission-control
npm run build:orbiter
```

## Required Tools

The following additional tools are required when building the modules:

### didc

`didc` is required to work with Candid files. You can download it from the [Candid releases](https://github.com/dfinity/candid/releases) page.

For example, to install `didc` on macOS:

```bash
release=$(curl --silent "https://api.github.com/repos/dfinity/candid/releases/latest" | grep -e '"tag_name"' | cut -c 16-25)
curl -fsSL https://github.com/dfinity/candid/releases/download/$release/didc-macos > ~/.cargo/bin/didc
chmod 755 ~/.cargo/bin/didc
```

### candid-extractor

`candid-extractor` is needed to extract Candid interfaces. Install it with:

```bash
cargo install candid-extractor
```

### wasi2ic

`wasi2ic` is required to convert the Wasm of the Sputnik crate for compatibility with the Internet Computer. This is necessary because this module must be built with the `wasm32-wasip1` target.

```bash
cargo install wasi2ic
```

## Useful Administration Commands

Here are a few commands that can be useful when developing and contributing to Juno:

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `npm run ledger:transfer` | Transfer 55 ICP to a Mission Control (Wallet). |

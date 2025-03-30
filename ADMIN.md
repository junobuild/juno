# Administration

This document covers administrative tasks related to managing and maintaining Juno, including releasing crates and other essential operations.

## Table of Contents

- [Releasing Crates](#releasing-crates)
- [Generate Docs Locally](#generate-docs-locally)

## Releasing Crates

To publish the `junobuild-shared` crate, use the following command:

```bash
RUSTFLAGS='--cfg getrandom_backend="custom"' cargo publish --target wasm32-unknown-unknown -p junobuild-shared
```

## Generate Docs Locally

To generate and open the documentation of a crate locally:

```bash
RUSTFLAGS='--cfg getrandom_backend="custom"' cargo doc --target wasm32-unknown-unknown --no-deps -p junobuild-satellite --open
```

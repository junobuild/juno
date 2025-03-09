# Administration

This document covers administrative tasks related to managing and maintaining Juno, including releasing crates and other essential operations.

## Table of Contents

- [Releasing Crates](#releasing-crates)

## Releasing Crates

To publish the `junobuild-shared` crate, use the following command:

```sh
RUSTFLAGS='--cfg getrandom_backend="custom"' cargo publish --target wasm32-unknown-unknown -p junobuild-shared
```

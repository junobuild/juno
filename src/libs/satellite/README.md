# JunoBuild-Satellite

`junobuild-satellite` is a Rust crate that extends the functionality of [Juno](https://juno.build) satellites. This library is intended for developers looking to enhance the capabilities of Juno.

## Getting Started

To include `junobuild-satellite` in your Rust project, add it as a dependency in your `Cargo.toml`:

```toml
[dependencies]
junobuild-satellite = "*"
```

Replace `"*"` with the specific version you want to use, or omit the version to always use the latest version.

## Usage

The primary feature of `junobuild-satellite` is the `include_satellite!` macro. It allows you to include all the stock satellite features required for a Juno satellite to work efficiently.

Example usage:

```rust
use junobuild_satellite::include_satellite;
include_satellite!();
```

By using the `include_satellite!` macro, you can effortlessly integrate all the necessary features into your satellite project.

## Features

- **on_set_doc**: Enables the `on_set_doc` feature.
- **on_set_many_docs**: Enables the `on_set_many_docs` feature.
- **on_delete_doc**: Enables the `on_delete_doc` feature.
- **on_delete_many_docs**: Enables the `on_delete_many_docs` feature.
- **on_upload_asset**: Enables the `on_upload_asset` feature.
- **on_delete_asset**: Enables the `on_delete_asset` feature.
- **on_delete_many_assets**: Enables the `on_delete_many_assets` feature.

These features are enabled by default and do not have additional dependencies.

### Links & Resources

Here are some useful links:

- Looking to get started? Check out the [documentation](https://juno.build).
- Have a look at the [LICENSE](https://github.com/junobuild/juno/blob/main/src/libs/satellite/LICENSE.md) for information about licensing and limitation.
- Have questions, comments or feedback? Join our [Discord](https://discord.gg/wHZ57Z2RAG) or [OpenChat](https://oc.app/community/vxgpi-nqaaa-aaaar-ar4lq-cai/?ref=xanzv-uaaaa-aaaaf-aneba-cai).

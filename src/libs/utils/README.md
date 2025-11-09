# JunoBuild-Utils

`junobuild-utils` provides a collection of utilities designed to support developers working on [Juno](https://juno.build), facilitating easier data handling, serialization, deserialization, and working with specialized data types.

## Getting Started

To include `junobuild-utils` in your Rust project, add it as a dependency in your `Cargo.toml`:

```toml
[dependencies]
junobuild-utils = "*"
```

Replace `"*"` with the specific version you want to use, or omit the version to always use the latest version.

## Usage Examples

### Decoding Document Data

Decode the serialized document data received by a hook.

```rust
#[derive(Deserialize)]
struct MyData {
    // Your data fields here
}

let decoded: MyData = decode_doc_data(&context.data.data.after.data).expect("Failed to decode data");
```

### Encoding Document Data

Encodes a Rust struct into serialized document data to prepare data to be stored.

```rust
#[derive(Serialize)]
struct MyData {
    // Your data fields here
}

let encoded = encode_doc_data(&my_data).expect("Failed to encode data");
```

### Handling Specialized Data Types

Work with custom data types such as `DocDataPrincipal` for principals and `DocDataBigInt` for bigint.

```rust
let principal = DocDataPrincipal { value: candid::Principal::anonymous() };
let big_int = DocDataBigInt { value: 123456789 };
```

### Links & Resources

Here are some useful links:

- Looking to get started? Check out the [documentation](https://juno.build).
- Have a look at the [LICENSE](https://github.com/junobuild/juno/blob/main/src/libs/utils/LICENSE.md) for information about licensing and limitation.
- Have questions, comments or feedback? Join our [Discord](https://discord.gg/wHZ57Z2RAG) or [OpenChat](https://oc.app/community/vxgpi-nqaaa-aaaar-ar4lq-cai/?ref=xanzv-uaaaa-aaaaf-aneba-cai).

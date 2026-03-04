use serde::{Deserialize, Serialize};
use serde_json::{from_slice, to_string, to_vec};

/// Decodes JSON data into a Rust struct.
///
/// Deserializes a byte slice into the specified type using Serde and `serde_json`.
/// Supports Juno's extended JSON conventions for IC types such as `Principal`, `u64` (bigint),
/// and `Vec<u8>` (Uint8Array), which are encoded using `@dfinity/utils` compatible markers.
///
/// # Parameters
/// - `data`: A byte slice (`&[u8]`) containing the JSON-encoded data.
///
/// # Returns
/// - `Ok(T)`: Successfully deserialized data of type `T`.
/// - `Err(String)`: An error string if deserialization fails.
///
/// # Example
///
/// ```rust
/// #[derive(Deserialize)]
/// struct MyData {
///     name: String,
/// }
///
/// let data: MyData = decode_json_data(bytes)?;
/// ```
pub fn decode_json_data<T: for<'a> Deserialize<'a>>(data: &[u8]) -> Result<T, String> {
    from_slice::<T>(data).map_err(|e| e.to_string())
}

/// Encodes a Rust struct into JSON bytes.
///
/// Serializes the provided data into a byte vector using Serde and `serde_json`.
/// Supports Juno's extended JSON conventions for IC types such as `Principal`, `u64` (bigint),
/// and `Vec<u8>` (Uint8Array), which are encoded using `@dfinity/utils` compatible markers.
///
/// # Parameters
/// - `data`: A reference to the Rust data structure to be serialized.
///
/// # Returns
/// - `Ok(Vec<u8>)`: A byte vector containing the JSON-encoded data.
/// - `Err(String)`: An error string if serialization fails.
///
/// # Example
///
/// ```rust
/// #[derive(Serialize)]
/// struct MyData {
///     name: String,
/// }
///
/// let bytes = encode_json_data(&my_data)?;
/// ```
pub fn encode_json_data<T: Serialize>(data: &T) -> Result<Vec<u8>, String> {
    to_vec(data).map_err(|e| e.to_string())
}

/// Encodes a Rust struct into a JSON string.
///
/// Serializes the provided data into a `String` using Serde and `serde_json`.
/// Supports Juno's extended JSON conventions for IC types such as `Principal`, `u64` (bigint),
/// and `Vec<u8>` (Uint8Array), which are encoded using `@dfinity/utils` compatible markers.
///
/// # Parameters
/// - `data`: A reference to the Rust data structure to be serialized.
///
/// # Returns
/// - `Ok(String)`: A JSON string containing the serialized data.
/// - `Err(String)`: An error string if serialization fails.
///
/// # Example
///
/// ```rust
/// #[derive(Serialize)]
/// struct MyData {
///     name: String,
/// }
///
/// let json = encode_json_data_to_string(&my_data)?;
/// ```
pub fn encode_json_data_to_string<T: Serialize>(data: &T) -> Result<String, String> {
    to_string(data).map_err(|e| e.to_string())
}

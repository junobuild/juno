#![doc = include_str!("../README.md")]

mod serializers;

use serde::{Deserialize, Serialize};
use serde_json::{from_slice, to_string, to_vec};

pub use crate::serializers::types::{DocDataBigInt, DocDataPrincipal, DocDataUint8Array};

/// Decodes serialized document data into a Rust struct, tailored for use with Juno hooks.
///
/// This function is a utility for developers working with Juno hooks, particularly
/// when receiving document data that needs to be processed. It uses Serde's deserialization to
/// convert a byte slice into a specified Rust data structure, allowing for direct manipulation
/// of document data within hook functions.
///
/// # Parameters
/// - `data`: A byte slice (`&[u8]`) containing the serialized document data.
///
/// # Returns
/// - `Ok(T)`: Successfully deserialized data of type `T`.
/// - `Err(String)`: An error string if deserialization fails.
///
/// # Examples
/// Within a Juno hook, you might receive document data that needs to be decoded:
/// ```rust
/// #[derive(Serialize, Deserialize)]
/// struct Person {
///     name: String,
///     age: u32,
/// }
///
/// #[on_set_doc(collections = ["people"])]
/// async fn handle_set_person_doc(context: OnSetDocContext) -> Result<(), String> {
///     let person: Person = decode_doc_data(&context.data.data.after.data)
///         .expect("Failed to decode document data");
///
///     // Proceed with custom logic for the decoded `Person` instance
///     println!("Received document for person: {}", person.name);
///
///     Ok(())
/// }
/// ```
pub fn decode_doc_data<T: for<'a> Deserialize<'a>>(data: &[u8]) -> Result<T, String> {
    from_slice::<T>(data).map_err(|e| e.to_string())
}

/// Encodes a Rust struct into serialized document data, designed for use with Juno hooks.
///
/// When preparing document data to be stored, this function facilitates the serialization
/// of a Rust data structure into a byte vector. It leverages Serde's serialization capabilities,
/// ensuring that any Rust type implementing the `Serialize` trait can be efficiently converted
/// into a format compatible with Juno's document requirements.
///
/// # Parameters
/// - `data`: A reference to the Rust data structure to be serialized.
///
/// # Returns
/// - `Ok(Vec<u8>)`: A byte vector containing the serialized data.
/// - `Err(String)`: An error string if serialization fails.
///
/// # Examples
/// In a Juno hook, you might want to modify and then store updated document data:
/// ```rust
/// #[derive(Serialize, Deserialize)]
/// struct Person {
///     name: String,
///     age: u32,
/// }
///
/// #[on_set_doc(collections = ["people"])]
/// async fn handle_set_person_doc(context: OnSetDocContext) -> Result<(), String> {
///     let mut person: Person = decode_doc_data(&context.data.data.after.data)?;
///     person.age += 1; // Increment the person's age
///
///     let updated_data = encode_doc_data(&person)
///         .expect("Failed to serialize updated document data");
///
///     // Use `updated_data` to store the modified document
///
///     Ok(())
/// }
/// ```
pub fn encode_doc_data<T: Serialize>(data: &T) -> Result<Vec<u8>, String> {
    to_vec(data).map_err(|e| e.to_string())
}

/// Encodes a Rust struct into a JSON string, designed for use with Juno hooks.
///
/// This function facilitates the serialization
/// of a Rust data structure representing a document data into a JSON string.
/// It leverages Serde's serialization capabilities,
/// ensuring that any Rust type implementing the `Serialize` trait can be efficiently converted
/// into a format compatible with Juno's document requirements.
///
/// # Parameters
/// - `data`: A reference to the Rust data structure to be serialized.
///
/// # Returns
/// - `Ok(String)`: A JSON string containing the serialized data.
/// - `Err(String)`: An error string if serialization fails.
///
/// # Examples
/// In a Juno hook, you might want to modify and then store updated document data:
/// ```rust
/// #[derive(Serialize, Deserialize)]
/// struct Person {
///     name: String,
///     age: u32,
/// }
///
/// #[on_set_doc(collections = ["people"])]
/// async fn handle_set_person_doc(context: OnSetDocContext) -> Result<(), String> {
///     let mut person: Person = decode_doc_data(&context.data.data.after.data)?;
///     person.age += 1; // Increment the person's age
///
///     let updated_data = encode_doc_data_to_string(&person)
///         .expect("Failed to serialize updated document data");
///
///     // Use `updated_data` to store the modified document
///
///     Ok(())
/// }
/// ```
pub fn encode_doc_data_to_string<T: Serialize>(data: &T) -> Result<String, String> {
    to_string(data).map_err(|e| e.to_string())
}

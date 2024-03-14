use ciborium::{from_reader, into_writer};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

/// Serializes a given value into a byte array.
///
/// # Arguments
/// * `value` - A reference to the value to serialize.
///
/// # Returns
/// A `Cow<[u8]>` representing the serialized data.
///
/// # Panics
/// Panics if serialization fails.
pub fn serialize_to_bytes<T: Serialize>(value: &T) -> Cow<[u8]> {
    let mut bytes = vec![];
    into_writer(value, &mut bytes).expect("Failed to serialize to bytes");
    Cow::Owned(bytes)
}

/// Deserializes a value from a byte array.
///
/// # Arguments
/// * `bytes` - A `Cow<'_, [u8]>` representing the bytes to deserialize from.
///
/// # Returns
/// The deserialized value of type `T`.
///
/// # Panics
/// Panics if deserialization fails.
pub fn deserialize_from_bytes<T: for<'a> Deserialize<'a>>(bytes: Cow<'_, [u8]>) -> T {
    from_reader(&*bytes).expect("Failed to deserialize from bytes")
}

/// Provides a default deserialization value for boolean fields, defaulting to `true`.
///
/// This function is a workaround for handling default values when deserializing with Serde,
/// particularly useful in scenarios where boolean fields need to default to `true` instead
/// of the usual `false` when not explicitly provided in the input.
///
/// # Returns
/// Returns `Some(true)`, indicating the default value to use.
pub fn deserialize_default_as_true() -> Option<bool> {
    // https://github.com/serde-rs/serde/issues/1030#issuecomment-522278006

    Some(true)
}

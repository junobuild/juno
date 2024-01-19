use ciborium::{from_reader, into_writer};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

pub fn serialize_to_bytes<T: Serialize>(value: &T) -> Cow<[u8]> {
    let mut bytes = vec![];
    into_writer(value, &mut bytes).expect("Failed to serialize to bytes");
    Cow::Owned(bytes)
}

pub fn deserialize_from_bytes<T: for<'a> Deserialize<'a>>(bytes: Cow<'_, [u8]>) -> T {
    from_reader(&*bytes).expect("Failed to deserialize from bytes")
}

// https://github.com/serde-rs/serde/issues/1030#issuecomment-522278006
pub fn deserialize_default_as_true() -> Option<bool> {
    Some(true)
}

use crate::constants::{
    METADATA_MAX_ELEMENTS, SERIALIZED_KEY_LENGTH, SERIALIZED_LONG_STRING_LENGTH,
    SERIALIZED_METADATA_LENGTH, SERIALIZED_PRINCIPAL_LENGTH, SERIALIZED_SHORT_STRING_LENGTH,
    SERIALIZED_STRING_LENGTH,
};
use candid::Principal;
use shared::types::state::Metadata;

/// Principal

// Source: https://forum.dfinity.org/t/convert-principal-to-vec-29-bytes-length/22468/3
pub fn principal_to_bytes(p: &Principal) -> [u8; SERIALIZED_PRINCIPAL_LENGTH] {
    let mut bytes: [u8; SERIALIZED_PRINCIPAL_LENGTH] = [0; SERIALIZED_PRINCIPAL_LENGTH];
    let p_bytes: &[u8] = p.as_slice();
    bytes[0] = p_bytes.len() as u8;
    bytes[1..p_bytes.len() + 1].copy_from_slice(p_bytes);
    bytes
}

pub fn bytes_to_principal(bytes: &[u8; SERIALIZED_PRINCIPAL_LENGTH]) -> Principal {
    Principal::from_slice(&bytes[1..1 + bytes[0] as usize])
}

/// String 36 max length

pub fn key_to_bytes(s: &String) -> [u8; SERIALIZED_KEY_LENGTH] {
    let mut bytes: [u8; SERIALIZED_KEY_LENGTH] = [0; SERIALIZED_KEY_LENGTH];
    let p_bytes: &[u8] = s.as_bytes();
    bytes[0] = p_bytes.len() as u8;
    bytes[1..p_bytes.len() + 1].copy_from_slice(p_bytes);
    bytes
}

pub fn bytes_to_key(bytes: &[u8; SERIALIZED_KEY_LENGTH]) -> String {
    String::from_utf8(bytes[1..1 + bytes[0] as usize].to_vec())
        .expect("Failed to convert bytes to key")
}

/// String 128 max length

pub fn short_string_to_bytes(s: &String) -> [u8; SERIALIZED_SHORT_STRING_LENGTH] {
    let mut bytes: [u8; SERIALIZED_SHORT_STRING_LENGTH] = [0; SERIALIZED_SHORT_STRING_LENGTH];
    let p_bytes: &[u8] = s.as_bytes();
    bytes[0] = p_bytes.len() as u8;
    bytes[1..p_bytes.len() + 1].copy_from_slice(p_bytes);
    bytes
}

pub fn bytes_to_short_string(bytes: &[u8; SERIALIZED_SHORT_STRING_LENGTH]) -> String {
    String::from_utf8(bytes[1..1 + bytes[0] as usize].to_vec())
        .expect("Failed to convert bytes to short string")
}

/// String 1024 max length

pub fn string_to_bytes(s: &String) -> [u8; SERIALIZED_STRING_LENGTH] {
    let mut bytes: [u8; SERIALIZED_STRING_LENGTH] = [0; SERIALIZED_STRING_LENGTH];
    let p_bytes: &[u8] = s.as_bytes();
    bytes[0] = p_bytes.len() as u8;
    bytes[1..p_bytes.len() + 1].copy_from_slice(p_bytes);
    bytes
}

pub fn bytes_to_string(bytes: &[u8; SERIALIZED_STRING_LENGTH]) -> String {
    String::from_utf8(bytes[1..1 + bytes[0] as usize].to_vec())
        .expect("Failed to convert bytes to string")
}

/// Long String 4096 max length

pub fn long_string_to_bytes(s: &String) -> [u8; SERIALIZED_LONG_STRING_LENGTH] {
    let mut bytes: [u8; SERIALIZED_LONG_STRING_LENGTH] = [0; SERIALIZED_LONG_STRING_LENGTH];
    let p_bytes: &[u8] = s.as_bytes();
    bytes[0] = p_bytes.len() as u8;
    bytes[1..p_bytes.len() + 1].copy_from_slice(p_bytes);
    bytes
}

pub fn bytes_to_long_string(bytes: &[u8; SERIALIZED_LONG_STRING_LENGTH]) -> String {
    String::from_utf8(bytes[1..1 + bytes[0] as usize].to_vec())
        .expect("Failed to convert bytes to long string")
}

/// Metadata

pub fn metadata_to_bytes(m: &Option<Metadata>) -> [u8; SERIALIZED_METADATA_LENGTH] {
    let mut bytes: Vec<u8> = Vec::new();

    let metadata: Metadata = m.clone().unwrap_or(Metadata::new());

    for (key, value) in metadata.clone().into_iter() {
        bytes.extend_from_slice(&short_string_to_bytes(&key));
        bytes.extend_from_slice(&short_string_to_bytes(&value));
    }

    if metadata.len() < METADATA_MAX_ELEMENTS {
        for _ in 0..METADATA_MAX_ELEMENTS - metadata.len() {
            bytes.extend_from_slice(&short_string_to_bytes(&"".to_string()));
            bytes.extend_from_slice(&short_string_to_bytes(&"".to_string()));
        }
    }

    bytes
        .try_into()
        .expect("Failed to convert hashmap to bytes")
}

pub fn bytes_to_metadata(bytes: &[u8; SERIALIZED_METADATA_LENGTH]) -> Option<Metadata> {
    let iter = bytes.chunks_exact(SERIALIZED_SHORT_STRING_LENGTH);

    let mut metadata: Metadata = Metadata::new();

    let mut key: Option<String> = None;

    for chunks in iter.into_iter() {
        let mut c_bytes: [u8; SERIALIZED_SHORT_STRING_LENGTH] = [0; SERIALIZED_SHORT_STRING_LENGTH];
        c_bytes.copy_from_slice(chunks);

        match key.clone() {
            None => {
                key = Some(bytes_to_short_string(&c_bytes));
            }
            Some(k) => {
                let value = bytes_to_short_string(&c_bytes);

                if !k.is_empty() {
                    metadata.insert(k, value);
                }

                key = None;
            }
        }
    }

    if !metadata.is_empty() {
        return Some(metadata);
    }

    None
}

use crate::db::types::state::{Doc, StableKey};
use crate::types::core::Compare;
use candid::{decode_one, encode_one};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;
use std::cmp::Ordering;

impl Compare for Doc {
    fn cmp_updated_at(&self, other: &Self) -> Ordering {
        self.updated_at.cmp(&other.updated_at)
    }

    fn cmp_created_at(&self, other: &Self) -> Ordering {
        self.created_at.cmp(&other.created_at)
    }
}

impl Storable for Doc {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        decode_one(&bytes).unwrap()
    }
}

impl BoundedStorable for Doc {
    // TODO: auto max_size
    const MAX_SIZE: u32 = 10 * 1024 * 1024; // 10 MB
    const IS_FIXED_SIZE: bool = false;
}

impl Storable for StableKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        decode_one(&bytes).unwrap()
    }
}

impl BoundedStorable for StableKey {
    // TODO: auto max_size
    const MAX_SIZE: u32 = 10 * 1024 * 1024; // 10 MB
    const IS_FIXED_SIZE: bool = false;
}

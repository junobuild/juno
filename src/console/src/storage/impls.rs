use crate::storage::types::state::{BatchStableEncodingChunkKey, BatchStableKey};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use std::borrow::Cow;

impl Storable for BatchStableKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for BatchStableEncodingChunkKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

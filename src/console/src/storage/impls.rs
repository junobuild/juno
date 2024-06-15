use crate::storage::types::state::{AssetKey, ContentChunkKey};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::core::{Hash, Hashable};
use sha2::{Digest, Sha256};
use std::borrow::Cow;

impl Storable for AssetKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for ContentChunkKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Hashable for AssetKey {
    fn hash(&self) -> Hash {
        let mut hasher = Sha256::new();

        hasher.update(self.batch_group_id.to_le_bytes());
        hasher.update(self.collection.to_bytes());
        hasher.update(self.full_path.to_bytes());

        hasher.finalize().into()
    }
}

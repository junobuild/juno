use crate::storage::{ProposalAssetKey, ProposalContentChunkKey};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{
    deserialize_from_bytes, serialize_into_bytes, serialize_to_bytes,
};
use junobuild_shared::types::core::{Hash, Hashable};
use sha2::{Digest, Sha256};
use std::borrow::Cow;

impl Storable for ProposalAssetKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for ProposalContentChunkKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Hashable for ProposalAssetKey {
    fn hash(&self) -> Hash {
        let mut hasher = Sha256::new();

        hasher.update(self.proposal_id.to_le_bytes());
        hasher.update(self.collection.to_bytes());
        hasher.update(self.full_path.to_bytes());

        hasher.finalize().into()
    }
}

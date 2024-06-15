use crate::storage::types::state::{
    Proposal, ProposalAssetKey, ProposalContentChunkKey, ProposalKey, ProposalStatus,
};
use candid::Principal;
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::core::{Hash, Hashable};
use junobuild_shared::types::state::{Timestamp, Version};
use sha2::{Digest, Sha256};
use std::borrow::Cow;

impl Storable for ProposalAssetKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
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

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for ProposalKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Proposal {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Hashable for ProposalAssetKey {
    fn hash(&self) -> Hash {
        let mut hasher = Sha256::new();

        hasher.update(self.batch_group_id.to_le_bytes());
        hasher.update(self.collection.to_bytes());
        hasher.update(self.full_path.to_bytes());

        hasher.finalize().into()
    }
}

impl Proposal {
    pub fn prepare(caller: Principal, current_proposal: &Option<Proposal>, evidence: Hash) -> Self {
        let now = time();

        let created_at: Timestamp = match current_proposal {
            None => now,
            Some(current_proposal) => current_proposal.created_at,
        };

        let version: Version = match current_proposal {
            None => INITIAL_VERSION,
            Some(current_proposal) => current_proposal.version.unwrap_or_default() + 1,
        };

        let owner: Principal = match current_proposal {
            None => caller,
            Some(current_proposal) => current_proposal.owner,
        };

        let status: ProposalStatus = match current_proposal {
            None => ProposalStatus::Open,
            Some(current_proposal) => current_proposal.status.clone(),
        };

        let updated_at: Timestamp = now;

        Proposal {
            owner,
            evidence,
            status,
            executed_at: None,
            created_at,
            updated_at,
            version: Some(version),
        }
    }
}

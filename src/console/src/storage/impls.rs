use crate::storage::types::state::{
    AssetKey, BatchGroupProposal, BatchGroupProposalKey, BatchGroupProposalStatus, ContentChunkKey,
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

impl Storable for BatchGroupProposalKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for BatchGroupProposal {
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

impl BatchGroupProposal {
    fn get_next_version(current_batch_group_proposal: &Option<BatchGroupProposal>) -> Version {
        match current_batch_group_proposal {
            None => INITIAL_VERSION,
            Some(current_proposal) => current_proposal.version.unwrap_or_default() + 1,
        }
    }

    pub fn prepare(
        caller: Principal,
        current_batch_group_proposal: &Option<BatchGroupProposal>,
        sha256: Hash,
    ) -> Self {
        let now = time();

        let created_at: Timestamp = match current_batch_group_proposal {
            None => now,
            Some(current_proposal) => current_proposal.created_at,
        };

        let version = Self::get_next_version(current_batch_group_proposal);

        let owner: Principal = match current_batch_group_proposal {
            None => caller,
            Some(current_proposal) => current_proposal.owner,
        };

        let status: BatchGroupProposalStatus = match current_batch_group_proposal {
            None => BatchGroupProposalStatus::Open,
            Some(current_proposal) => current_proposal.status.clone(),
        };

        let updated_at: Timestamp = now;

        BatchGroupProposal {
            owner,
            sha256,
            status,
            executed_at: None,
            created_at,
            updated_at,
            version: Some(version),
        }
    }

    pub fn accept(
        current_batch_group_proposal: &BatchGroupProposal,
    ) -> Self {
        let now = time();

        let version = Self::get_next_version(&Some(current_batch_group_proposal.clone()));

        BatchGroupProposal {
            status: BatchGroupProposalStatus::Accepted,
            updated_at: now,
            version: Some(version),
            ..current_batch_group_proposal.clone()
        }
    }

    pub fn execute(
        current_batch_group_proposal: &BatchGroupProposal,
    ) -> Self {
        let now = time();

        let version = Self::get_next_version(&Some(current_batch_group_proposal.clone()));
        
        BatchGroupProposal {
            status: BatchGroupProposalStatus::Executed,
            updated_at: now,
            executed_at: Some(now),
            version: Some(version),
            ..current_batch_group_proposal.clone()
        }
    }
}

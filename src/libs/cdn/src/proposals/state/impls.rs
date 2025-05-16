use crate::proposals::{Proposal, ProposalKey, ProposalStatus, ProposalType};
use candid::Principal;
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::core::Hash;
use junobuild_shared::types::state::{Version, Versioned};
use junobuild_shared::version::next_version;
use std::borrow::Cow;

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

impl Proposal {
    fn get_next_version(current_proposal: &Option<Proposal>) -> Version {
        next_version(current_proposal)
    }

    pub fn init(caller: Principal, proposal_type: &ProposalType) -> Self {
        let now = time();

        let version = Self::get_next_version(&None);

        Proposal {
            owner: caller,
            sha256: None,
            status: ProposalStatus::Initialized,
            executed_at: None,
            created_at: now,
            updated_at: now,
            version: Some(version),
            proposal_type: proposal_type.clone(),
        }
    }

    pub fn open(current_proposal: &Proposal, sha256: Hash) -> Self {
        let now = time();

        let version = Self::get_next_version(&Some(current_proposal.clone()));

        Proposal {
            status: ProposalStatus::Open,
            sha256: Some(sha256),
            updated_at: now,
            version: Some(version),
            ..current_proposal.clone()
        }
    }

    pub fn accept(current_proposal: &Proposal) -> Self {
        let now = time();

        let version = Self::get_next_version(&Some(current_proposal.clone()));

        Proposal {
            status: ProposalStatus::Accepted,
            updated_at: now,
            version: Some(version),
            ..current_proposal.clone()
        }
    }

    pub fn execute(current_proposal: &Proposal) -> Self {
        let now = time();

        let version = Self::get_next_version(&Some(current_proposal.clone()));

        Proposal {
            status: ProposalStatus::Executed,
            updated_at: now,
            executed_at: Some(now),
            version: Some(version),
            ..current_proposal.clone()
        }
    }

    pub fn fail(current_proposal: &Proposal) -> Self {
        let now = time();

        let version = Self::get_next_version(&Some(current_proposal.clone()));

        Proposal {
            status: ProposalStatus::Failed,
            updated_at: now,
            version: Some(version),
            ..current_proposal.clone()
        }
    }
}

impl Versioned for Proposal {
    fn version(&self) -> Option<Version> {
        self.version
    }
}

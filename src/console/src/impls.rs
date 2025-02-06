use crate::constants::{ORBITER_CREATION_FEE_ICP, SATELLITE_CREATION_FEE_ICP};
use crate::memory::init_stable_state;
use crate::types::core::CommitProposalError;
use crate::types::ledger::Payment;
use crate::types::state::{
    Fee, Fees, HeapState, MissionControl, Proposal, ProposalKey, ProposalStatus, ProposalType,
    Rate, Rates, State,
};
use candid::Principal;
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;
use junobuild_shared::rate::types::RateTokens;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::core::Hash;
use junobuild_shared::types::state::{Version, Versioned};
use junobuild_shared::version::next_version;
use std::borrow::Cow;
use std::fmt;

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState::default(),
        }
    }
}

impl Default for Rates {
    fn default() -> Self {
        let now = time();

        let tokens: RateTokens = RateTokens {
            tokens: 1,
            updated_at: now,
        };

        Rates {
            satellites: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
            mission_controls: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
            orbiters: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens,
            },
        }
    }
}

impl Default for Fees {
    fn default() -> Self {
        let now = time();

        Fees {
            satellite: Fee {
                fee: SATELLITE_CREATION_FEE_ICP,
                updated_at: now,
            },
            orbiter: Fee {
                fee: ORBITER_CREATION_FEE_ICP,
                updated_at: now,
            },
        }
    }
}

impl Storable for MissionControl {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Payment {
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

impl fmt::Display for CommitProposalError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CommitProposalError::ProposalNotFound(err) => write!(f, "{}", err),
            CommitProposalError::ProposalNotOpen(err) => write!(f, "{}", err),
            CommitProposalError::InvalidSha256(err) => write!(f, "{}", err),
            CommitProposalError::InvalidType(err) => write!(f, "{}", err),
            CommitProposalError::CommitAssetsIssue(err) => write!(f, "{}", err),
            CommitProposalError::PostCommitAssetsIssue(err) => write!(f, "{}", err),
        }
    }
}

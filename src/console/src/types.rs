pub mod state {
    use crate::memory::init_stable_state;
    use crate::types::ledger::Payment;
    use candid::{CandidType, Principal};
    use ic_ledger_types::{BlockIndex, Tokens};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_cdn::{AssetsStable, ContentChunksStable};
    use junobuild_shared::rate::types::{RateConfig, RateTokens};
    use junobuild_shared::types::core::Hash;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Controllers, Timestamp, Version};
    use junobuild_shared::types::state::{MissionControlId, UserId};
    use junobuild_storage::types::state::StorageHeapState;
    use serde::{Deserialize, Serialize};
    use std::collections::{HashMap, HashSet};

    pub type MissionControls = HashMap<UserId, MissionControl>;
    pub type Payments = HashMap<BlockIndex, Payment>;
    pub type InvitationCodes = HashMap<InvitationCode, InvitationCodeRedeem>;

    pub type MissionControlsStable = StableBTreeMap<UserId, MissionControl, Memory>;
    pub type PaymentsStable = StableBTreeMap<BlockIndex, Payment, Memory>;
    pub type ProposalsStable = StableBTreeMap<ProposalKey, Proposal, Memory>;

    #[derive(Serialize, Deserialize)]
    pub struct State {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        pub heap: HeapState,
    }

    pub struct StableState {
        pub mission_controls: MissionControlsStable,
        pub payments: PaymentsStable,
        pub proposals_assets: AssetsStable,
        pub proposals_content_chunks: ContentChunksStable,
        pub proposals: ProposalsStable,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        #[deprecated(note = "Deprecated. Use stable memory instead.")]
        pub mission_controls: MissionControls,
        #[deprecated(note = "Deprecated. Use stable memory instead.")]
        pub payments: Payments,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub rates: Rates,
        pub fees: Fees,
        pub storage: StorageHeapState,
        pub releases_metadata: ReleasesMetadata,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MissionControl {
        pub mission_control_id: Option<MissionControlId>,
        pub owner: UserId,
        pub credits: Tokens,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    pub type ReleaseVersion = String;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct ReleasesMetadata {
        pub mission_controls: HashSet<ReleaseVersion>,
        pub satellites: HashSet<ReleaseVersion>,
        pub orbiters: HashSet<ReleaseVersion>,
    }

    pub type InvitationCode = String;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct InvitationCodeRedeem {
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub redeemed: bool,
        pub user_id: Option<UserId>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Rate {
        pub tokens: RateTokens,
        pub config: RateConfig,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Rates {
        pub mission_controls: Rate,
        pub satellites: Rate,
        pub orbiters: Rate,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Fee {
        pub fee: Tokens,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Fees {
        pub satellite: Fee,
        pub orbiter: Fee,
    }

    pub type ProposalId = u128;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct ProposalKey {
        pub proposal_id: ProposalId,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Proposal {
        pub owner: Principal,
        pub sha256: Option<Hash>,
        pub status: ProposalStatus,
        pub executed_at: Option<Timestamp>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
        pub proposal_type: ProposalType,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum ProposalType {
        AssetsUpgrade(AssetsUpgradeOptions),
        SegmentsDeployment(SegmentsDeploymentOptions),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AssetsUpgradeOptions {
        pub clear_existing_assets: Option<bool>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SegmentsDeploymentOptions {
        pub satellite_version: Option<ReleaseVersion>,
        pub mission_control_version: Option<ReleaseVersion>,
        pub orbiter: Option<ReleaseVersion>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
    pub enum ProposalStatus {
        Initialized,
        Open,
        Rejected,
        Accepted,
        Executed,
        Failed,
    }
}

pub mod interface {
    use crate::types::state::ProposalId;
    use candid::CandidType;
    use junobuild_shared::types::core::Hash;
    use junobuild_storage::types::config::StorageConfig;
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Deserialize)]
    pub struct Config {
        pub storage: StorageConfig,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CommitProposal {
        pub proposal_id: ProposalId,
        pub sha256: Hash,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DeleteProposalAssets {
        pub proposal_ids: Vec<ProposalId>,
    }
}

pub mod ledger {
    use candid::CandidType;
    use ic_ledger_types::BlockIndex;
    use junobuild_shared::types::state::{MissionControlId, Timestamp};
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Payment {
        pub mission_control_id: Option<MissionControlId>,
        pub block_index_payment: BlockIndex,
        pub block_index_refunded: Option<BlockIndex>,
        pub status: PaymentStatus,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum PaymentStatus {
        Acknowledged,
        Completed,
        Refunded,
    }
}

pub mod core {
    #[derive(Debug)]
    pub enum CommitProposalError {
        ProposalNotFound(String),
        ProposalNotOpen(String),
        InvalidSha256(String),
        InvalidType(String),
        CommitAssetsIssue(String),
        PostCommitAssetsIssue(String),
    }
}

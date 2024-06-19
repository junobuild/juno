pub mod state {
    use crate::memory::init_stable_state;
    use crate::storage::types::state::{AssetsStable, ContentChunksStable};
    use crate::types::ledger::Payment;
    use candid::{CandidType, Principal};
    use ic_ledger_types::{BlockIndex, Tokens};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::core::Hash;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Controllers, Timestamp, Version};
    use junobuild_shared::types::state::{MissionControlId, UserId};
    use junobuild_storage::types::state::StorageHeapState;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

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
        pub releases: Releases,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub rates: Rates,
        pub fees: Fees,
        pub storage: StorageHeapState,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MissionControl {
        pub mission_control_id: Option<MissionControlId>,
        pub owner: UserId,
        pub credits: Tokens,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Releases {
        pub mission_control: Wasm,
        pub satellite: Wasm,
        pub orbiter: Wasm,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Wasm {
        pub wasm: Vec<u8>,
        pub version: Option<String>,
    }

    pub type InvitationCode = String;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct InvitationCodeRedeem {
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub redeemed: bool,
        pub user_id: Option<UserId>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Rates {
        pub mission_controls: Rate,
        pub satellites: Rate,
        pub orbiters: Rate,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Rate {
        pub tokens: RateTokens,
        pub config: RateConfig,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct RateTokens {
        pub tokens: u64,
        pub updated_at: Timestamp,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct RateConfig {
        pub time_per_token_ns: u64,
        pub max_tokens: u64,
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
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AssetsUpgradeOptions {
        pub clear_existing_assets: Option<bool>,
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
    use junobuild_shared::types::cronjob::CronJobs;
    use junobuild_storage::types::config::StorageConfig;
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Deserialize)]
    pub enum Segment {
        Satellite,
        MissionControl,
        Orbiter,
    }

    #[derive(CandidType)]
    pub struct LoadRelease {
        pub total: usize,
        pub chunks: usize,
    }

    #[derive(CandidType, Deserialize)]
    pub struct ReleasesVersion {
        pub satellite: Option<String>,
        pub mission_control: Option<String>,
        pub orbiter: Option<String>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct CronJobsArgs {
        pub cron_jobs: CronJobs,
    }

    #[derive(CandidType, Deserialize)]
    pub struct Config {
        pub storage: StorageConfig,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CommitAssetsUpgrade {
        pub proposal_id: ProposalId,
        pub sha256: Hash,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DeleteAssetsUpgrade {
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

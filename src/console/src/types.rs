pub mod state {
    use crate::memory::init_stable_state;
    use crate::types::ledger::Payment;
    use candid::CandidType;
    use ic_ledger_types::{BlockIndex, Tokens};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Controllers, Timestamp};
    use junobuild_shared::types::state::{MissionControlId, UserId};
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type MissionControls = HashMap<UserId, MissionControl>;
    pub type Payments = HashMap<BlockIndex, Payment>;
    pub type InvitationCodes = HashMap<InvitationCode, InvitationCodeRedeem>;

    pub type MissionControlsStable = StableBTreeMap<UserId, MissionControl, Memory>;
    pub type PaymentsStable = StableBTreeMap<BlockIndex, Payment, Memory>;

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
}

pub mod interface {
    use candid::CandidType;
    use junobuild_shared::types::cronjob::CronJobs;
    use serde::Deserialize;

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

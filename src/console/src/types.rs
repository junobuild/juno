pub mod state {
    use crate::types::ledger::Payment;
    use candid::CandidType;
    use ic_ledger_types::{BlockIndex, Tokens};
    use serde::Deserialize;
    use shared::types::interface::{Controllers, MissionControlId, UserId};
    use std::collections::HashMap;

    pub type MissionControls = HashMap<UserId, MissionControl>;
    pub type Payments = HashMap<BlockIndex, Payment>;
    pub type InvitationCodes = HashMap<InvitationCode, InvitationCodeRedeem>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub mission_controls: MissionControls,
        pub payments: Payments,
        pub releases: Releases,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub rates: Rates,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct MissionControl {
        pub mission_control_id: Option<MissionControlId>,
        pub owner: UserId,
        pub credits: Tokens,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Releases {
        pub mission_control: Wasm,
        pub satellite: Wasm,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Wasm {
        pub wasm: Vec<u8>,
        pub version: Option<String>,
    }

    pub type InvitationCode = String;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct InvitationCodeRedeem {
        pub created_at: u64,
        pub updated_at: u64,
        pub redeemed: bool,
        pub user_id: Option<UserId>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Rates {
        pub mission_controls: Rate,
        pub satellites: Rate,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Rate {
        pub tokens: RateTokens,
        pub config: RateConfig,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct RateTokens {
        pub tokens: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct RateConfig {
        pub time_per_token_ns: u64,
        pub max_tokens: u64,
    }
}

pub mod interface {
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize)]
    pub enum Segment {
        Satellite,
        MissionControl,
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
    }
}

pub mod ledger {
    use candid::CandidType;
    use ic_ledger_types::BlockIndex;
    use serde::Deserialize;
    use shared::types::interface::MissionControlId;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Payment {
        pub mission_control_id: Option<MissionControlId>,
        pub block_index_payment: BlockIndex,
        pub block_index_refunded: Option<BlockIndex>,
        pub status: PaymentStatus,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub enum PaymentStatus {
        Acknowledged,
        Completed,
        Refunded,
    }
}

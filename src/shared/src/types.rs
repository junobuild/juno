pub mod state {
    use candid::CandidType;
    use candid::Principal;
    use ic_cdk::api::management_canister::main::CanisterStatusResponse;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type UserId = Principal;
    pub type MissionControlId = Principal;
    pub type ControllerId = Principal;
    pub type SatelliteId = Principal;

    pub type Metadata = HashMap<String, String>;

    pub type Controllers = HashMap<ControllerId, Controller>;

    pub type ArchiveTime = u64;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Controller {
        pub metadata: Metadata,
        pub created_at: u64,
        pub updated_at: u64,
        pub expires_at: Option<u64>,
        pub scope: ControllerScope,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum ControllerScope {
        Write,
        Admin,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SegmentStatus {
        pub id: Principal,
        pub metadata: Option<Metadata>,
        pub status: CanisterStatusResponse,
        pub status_at: u64,
    }

    pub type SegmentStatusResult = Result<SegmentStatus, String>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SegmentsStatuses {
        pub mission_control: SegmentStatusResult,
        pub satellites: Option<Vec<SegmentStatusResult>>,
    }
}

pub mod interface {
    use crate::types::cronjob::CronJobStatusesSatellites;
    use crate::types::state::{ControllerId, ControllerScope, Metadata, MissionControlId, UserId};
    use candid::CandidType;
    use ic_ledger_types::BlockIndex;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize)]
    pub struct CreateSatelliteArgs {
        pub user: UserId,
        pub block_index: Option<BlockIndex>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct GetCreateSatelliteFeeArgs {
        pub user: UserId,
    }

    #[derive(CandidType, Deserialize)]
    pub struct MissionControlArgs {
        pub user: UserId,
    }

    #[derive(CandidType, Deserialize)]
    pub struct SatelliteArgs {
        pub controllers: Vec<ControllerId>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetController {
        pub metadata: Metadata,
        pub expires_at: Option<u64>,
        pub scope: ControllerScope,
    }

    #[derive(CandidType, Deserialize)]
    pub struct SetControllersArgs {
        pub controllers: Vec<ControllerId>,
        pub controller: SetController,
    }

    #[derive(CandidType, Deserialize)]
    pub struct DeleteControllersArgs {
        pub controllers: Vec<ControllerId>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct AssertMissionControlCenterArgs {
        pub user: UserId,
        pub mission_control_id: MissionControlId,
    }

    #[derive(CandidType, Deserialize)]
    pub struct StatusesArgs {
        pub cycles_threshold: Option<u64>,
        pub mission_control_cycles_threshold: Option<u64>,
        pub satellites: CronJobStatusesSatellites,
    }
}

pub mod ledger {
    use candid::CandidType;
    use serde::Deserialize;

    use ic_ledger_types::{Block, BlockIndex, Memo, Operation, Timestamp};

    pub type BlockIndexed = (BlockIndex, Block);
    pub type Blocks = Vec<BlockIndexed>;
    pub type Transactions = Vec<Transaction>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Transaction {
        pub block_index: BlockIndex,
        pub memo: Memo,
        pub operation: Option<Operation>,
        pub timestamp: Timestamp,
    }
}

pub mod ic {
    pub struct WasmArg {
        pub wasm: Vec<u8>,
        pub install_arg: Vec<u8>,
    }
}

pub mod cmc {
    use candid::{CandidType, Principal};
    use ic_ledger_types::BlockIndex;
    use serde::Deserialize;

    pub type Cycles = u128;

    #[derive(CandidType, Deserialize)]
    pub enum NotifyError {
        Refunded {
            reason: String,
            block_index: Option<BlockIndex>,
        },
        InvalidTransaction(String),
        TransactionTooOld(BlockIndex),
        Processing,
        Other {
            error_code: u64,
            error_message: String,
        },
    }

    #[derive(CandidType, Deserialize)]
    pub struct TopUpCanisterArgs {
        pub block_index: BlockIndex,
        pub canister_id: Principal,
    }
}

pub mod cronjob {
    use crate::types::state::{Metadata, SatelliteId};
    use candid::CandidType;
    use serde::Deserialize;
    use std::collections::HashMap;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobs {
        pub metadata: Metadata,
        pub statuses: CronJobStatuses,
    }

    pub type CronJobStatusesSatellites = HashMap<SatelliteId, CronJobStatusesSatelliteConfig>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobStatuses {
        pub enabled: bool,
        pub cycles_threshold: Option<u64>,
        pub mission_control_cycles_threshold: Option<u64>,
        pub satellites: CronJobStatusesSatellites,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobStatusesSatelliteConfig {
        pub enabled: bool,
        pub cycles_threshold: Option<u64>,
    }
}

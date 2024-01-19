pub mod state {
    use candid::Principal;
    use candid::{CandidType, Nat};
    use ic_cdk::api::management_canister::main::CanisterStatusType;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type UserId = Principal;
    pub type MissionControlId = Principal;
    pub type ControllerId = Principal;
    pub type SatelliteId = Principal;
    pub type OrbiterId = Principal;

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
    pub struct SegmentCanisterStatus {
        pub status: CanisterStatusType,
        pub settings: SegmentCanisterSettings,
        pub module_hash: Option<Vec<u8>>,
        pub memory_size: Nat,
        pub cycles: Nat,
        pub idle_cycles_burned_per_day: Nat,
    }

    // Prevent breaking changes in DefiniteCanisterSettings which we do not use
    #[derive(CandidType, Deserialize, Clone)]
    pub struct SegmentCanisterSettings {
        pub controllers: Vec<Principal>,
        pub compute_allocation: Nat,
        pub memory_allocation: Nat,
        pub freezing_threshold: Nat,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SegmentStatus {
        pub id: Principal,
        pub metadata: Option<Metadata>,
        pub status: SegmentCanisterStatus,
        pub status_at: u64,
    }

    pub type SegmentStatusResult = Result<SegmentStatus, String>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SegmentsStatuses {
        pub mission_control: SegmentStatusResult,
        pub satellites: Option<Vec<SegmentStatusResult>>,
        pub orbiters: Option<Vec<SegmentStatusResult>>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct OrbiterSatelliteConfig {
        pub enabled: bool,
        pub created_at: u64,
        pub updated_at: u64,
    }
}

pub mod interface {
    use crate::types::cronjob::CronJobStatusesSegments;
    use crate::types::state::{ControllerId, ControllerScope, Metadata, MissionControlId, UserId};
    use candid::{CandidType, Principal};
    use ic_ledger_types::BlockIndex;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize)]
    pub struct CreateCanisterArgs {
        pub user: UserId,
        pub block_index: Option<BlockIndex>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct GetCreateCanisterFeeArgs {
        pub user: UserId,
    }

    #[derive(CandidType, Deserialize)]
    pub struct MissionControlArgs {
        pub user: UserId,
    }

    #[derive(CandidType, Deserialize)]
    pub struct SegmentArgs {
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
        pub satellites: CronJobStatusesSegments,
        pub orbiters: CronJobStatusesSegments,
    }

    #[derive(CandidType, Deserialize)]
    pub struct DepositCyclesArgs {
        pub destination_id: Principal,
        pub cycles: u128,
    }

    pub type Bytes = usize;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct MemorySize {
        pub heap: Bytes,
        pub stable: Bytes,
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
    use crate::types::state::Metadata;
    use candid::{CandidType, Principal};
    use serde::Deserialize;
    use std::collections::HashMap;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobs {
        pub metadata: Metadata,
        pub statuses: CronJobStatuses,
    }

    pub type CronJobStatusesSegments = HashMap<Principal, CronJobStatusesConfig>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobStatuses {
        pub enabled: bool,
        pub cycles_threshold: Option<u64>,
        pub mission_control_cycles_threshold: Option<u64>,
        pub satellites: CronJobStatusesSegments,
        pub orbiters: CronJobStatusesSegments,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobStatusesConfig {
        pub enabled: bool,
        pub cycles_threshold: Option<u64>,
    }
}

pub mod utils {
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(Default, CandidType, Deserialize, Clone, PartialEq, Eq, Hash)]
    pub struct CalendarDate {
        pub year: i32,
        pub month: u8,
        pub day: u8,
    }
}

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
    pub type Timestamp = u64;

    pub type Version = u64;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Controller {
        pub metadata: Metadata,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub expires_at: Option<Timestamp>,
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
        pub status_at: Timestamp,
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
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }
}

pub mod interface {
    use crate::types::cronjob::CronJobStatusesSegments;
    use crate::types::state::{
        ControllerId, ControllerScope, Metadata, MissionControlId, Timestamp, UserId,
    };
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
        pub expires_at: Option<Timestamp>,
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

pub mod memory {
    use ic_stable_structures::memory_manager::VirtualMemory;
    use ic_stable_structures::DefaultMemoryImpl;

    pub type Memory = VirtualMemory<DefaultMemoryImpl>;
}

pub mod core {
    use std::cmp::Ordering;

    /// Represents a unique identifier or key.
    ///
    /// This type, `Key`, is an alias for `String`, used to represent unique identifiers or keys within the context
    /// of various data structures and operations.
    ///
    /// `Key` is commonly employed as a unique identifier or key in Rust code.
    pub type Key = String;

    /// Represents binary data as a vector of bytes.
    ///
    /// This type, `Blob`, is an alias for `Vec<u8>`, providing a convenient way to represent binary data
    /// as a collection of bytes.
    pub type Blob = Vec<u8>;

    /// Represents the domain name used in various configurations across the satellite.
    ///
    /// This type alias simplifies the reuse of `String` for domain names, providing a clear and
    /// specific semantic meaning when used in structs and function signatures. It is used to
    /// identify domains for authentication, custom domains, and potentially more areas where
    /// domain names are needed.
    ///
    /// # Examples
    ///
    /// Basic usage:
    ///
    /// ```
    /// let main_domain: DomainName = "example.com".to_string();
    /// ```
    pub type DomainName = String;

    pub trait Compare {
        fn cmp_updated_at(&self, other: &Self) -> Ordering;
        fn cmp_created_at(&self, other: &Self) -> Ordering;
    }

    /// Sha256 Digest: 32 bytes
    pub type Hash = [u8; 32];

    pub trait Hashable {
        fn hash(&self) -> Hash;
    }
}

pub mod list {
    use crate::types::core::Key;
    use crate::types::state::UserId;
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListPaginate {
        pub start_after: Option<Key>,
        pub limit: Option<usize>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub enum ListOrderField {
        #[default]
        Keys,
        CreatedAt,
        UpdatedAt,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListOrder {
        pub desc: bool,
        pub field: ListOrderField,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListMatcher {
        pub key: Option<Key>,
        pub description: Option<String>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListParams {
        pub matcher: Option<ListMatcher>,
        pub paginate: Option<ListPaginate>,
        pub order: Option<ListOrder>,
        pub owner: Option<UserId>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListResults<T> {
        pub items: Vec<(Key, T)>,
        pub items_length: usize,
        pub items_page: Option<usize>,
        pub matches_length: usize,
        pub matches_pages: Option<usize>,
    }
}

pub mod domain {
    use candid::CandidType;
    use crate::types::core::DomainName;
    use crate::types::state::{Timestamp, Version};
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type CustomDomains = HashMap<DomainName, CustomDomain>;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CustomDomain {
        pub bn_id: Option<String>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }
}

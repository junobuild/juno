pub mod state {
    use crate::types::monitoring::CyclesBalance;
    use candid::Principal;
    use candid::{CandidType, Nat};
    use ic_cdk::api::management_canister::main::CanisterStatusType;
    use serde::{Deserialize, Serialize};
    use std::cmp::Ordering;
    use std::collections::HashMap;
    use crate::types::core::DomainName;

    pub type UserId = Principal;

    pub type ControllerId = Principal;

    pub type SegmentId = Principal;
    pub type MissionControlId = SegmentId;
    pub type SatelliteId = SegmentId;
    pub type OrbiterId = SegmentId;

    pub type Metadata = HashMap<String, String>;

    pub type Controllers = HashMap<ControllerId, Controller>;

    pub type ArchiveTime = u64;
    pub type Timestamp = u64;

    pub type Version = u64;

    pub trait Timestamped {
        fn created_at(&self) -> Timestamp;
        fn updated_at(&self) -> Timestamp;
        fn cmp_updated_at(&self, other: &Self) -> Ordering;
        fn cmp_created_at(&self, other: &Self) -> Ordering;
    }

    pub trait Versioned {
        fn version(&self) -> Option<Version>;
    }

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

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SegmentCanisterStatus {
        pub status: CanisterStatusType,
        pub settings: SegmentCanisterSettings,
        pub module_hash: Option<Vec<u8>>,
        pub memory_size: Nat,
        pub cycles: Nat,
        pub idle_cycles_burned_per_day: Nat,
    }

    // Prevent breaking changes in DefiniteCanisterSettings which we do not use
    #[deprecated]
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SegmentCanisterSettings {
        pub controllers: Vec<Principal>,
        pub compute_allocation: Nat,
        pub memory_allocation: Nat,
        pub freezing_threshold: Nat,
    }

    #[deprecated]
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SegmentStatus {
        pub id: Principal,
        pub metadata: Option<Metadata>,
        pub status: SegmentCanisterStatus,
        pub status_at: Timestamp,
    }

    #[deprecated]
    pub type SegmentStatusResult = Result<SegmentStatus, String>;

    #[deprecated]
    #[derive(CandidType, Deserialize, Clone)]
    pub struct SegmentsStatuses {
        pub mission_control: SegmentStatusResult,
        pub satellites: Option<Vec<SegmentStatusResult>>,
        pub orbiters: Option<Vec<SegmentStatusResult>>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum SegmentKind {
        Satellite,
        MissionControl,
        Orbiter,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Segment {
        pub id: SegmentId,
        pub kind: SegmentKind,
        pub metadata: Option<Metadata>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct OrbiterSatelliteConfig {
        pub features: Option<OrbiterSatelliteFeatures>,
        pub restricted_origins: Option<Vec<DomainName>>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct OrbiterSatelliteFeatures {
        pub page_views: bool,
        pub track_events: bool,
        pub performance_metrics: bool,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum NotificationKind {
        DepositedCyclesEmail(DepositedCyclesEmailNotification),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DepositedCyclesEmailNotification {
        pub to: String,
        pub deposited_cycles: CyclesBalance,
    }
}

pub mod interface {
    use crate::mgmt::types::cmc::SubnetId;
    use crate::types::core::Bytes;
    use crate::types::state::{
        ControllerId, ControllerScope, Metadata, MissionControlId, NotificationKind, Segment,
        Timestamp, UserId,
    };
    use candid::{CandidType, Principal};
    use ic_ledger_types::BlockIndex;
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Deserialize)]
    pub struct CreateCanisterArgs {
        pub user: UserId,
        pub block_index: Option<BlockIndex>,
        pub subnet_id: Option<SubnetId>,
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
    pub struct DepositCyclesArgs {
        pub destination_id: Principal,
        pub cycles: u128,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct MemorySize {
        pub heap: Bytes,
        pub stable: Bytes,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct NotifyArgs {
        pub user: UserId,
        pub segment: Segment,
        pub kind: NotificationKind,
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
    /// let main_domain: junobuild_shared::types::core::DomainName = "example.com".to_string();
    /// ```
    pub type DomainName = String;

    /// Sha256 Digest: 32 bytes
    pub type Hash = [u8; 32];

    pub trait Hashable {
        fn hash(&self) -> Hash;
    }

    /// A shorthand for example to represents the type of the memory size in bytes.
    pub type Bytes = usize;
}

pub mod list {
    use crate::types::core::Key;
    use crate::types::state::{Timestamp, UserId};
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

    #[derive(CandidType, Deserialize, Clone)]
    pub enum TimestampMatcher {
        Equal(Timestamp),
        GreaterThan(Timestamp),
        LessThan(Timestamp),
        Between(Timestamp, Timestamp),
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListMatcher {
        pub key: Option<Key>,
        pub description: Option<String>,
        pub created_at: Option<TimestampMatcher>,
        pub updated_at: Option<TimestampMatcher>,
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
    use crate::types::core::DomainName;
    use crate::types::state::{Timestamp, Version};
    use candid::CandidType;
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

pub mod config {
    use crate::types::core::Bytes;
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct ConfigMaxMemorySize {
        pub heap: Option<Bytes>,
        pub stable: Option<Bytes>,
    }
}

pub mod monitoring {
    use crate::types::state::Timestamp;
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CyclesBalance {
        pub amount: u128,
        pub timestamp: Timestamp,
    }
}

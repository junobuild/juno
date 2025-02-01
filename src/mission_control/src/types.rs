pub mod state {
    use crate::memory::init_stable_state;
    use candid::{CandidType, Principal};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::monitoring::CyclesBalance;
    use junobuild_shared::types::state::{
        ArchiveTime, Controllers, Metadata, OrbiterId, SegmentId, SegmentStatusResult, Timestamp,
    };
    use junobuild_shared::types::state::{SatelliteId, UserId};
    use serde::{Deserialize, Serialize};
    use std::collections::{BTreeMap, HashMap};

    pub type Satellites = HashMap<SatelliteId, Satellite>;
    pub type Orbiters = HashMap<OrbiterId, Orbiter>;

    #[deprecated(
        since = "0.0.14",
        note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
    )]
    pub type Statuses = BTreeMap<ArchiveTime, SegmentStatusResult>;

    pub type MonitoringHistoryStable =
        StableBTreeMap<MonitoringHistoryKey, MonitoringHistory, Memory>;

    #[derive(Serialize, Deserialize)]
    pub struct State {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        pub heap: HeapState,
    }

    pub struct StableState {
        pub monitoring_history: MonitoringHistoryStable,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        pub user: User,
        pub satellites: Satellites,
        pub controllers: Controllers,
        #[deprecated(
            note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
        )]
        pub archive: Archive,
        pub orbiters: Orbiters,
        pub settings: Option<MissionControlSettings>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct User {
        pub user: Option<UserId>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub metadata: Metadata,
        pub config: Option<Config>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Config {
        pub monitoring: Option<MonitoringConfig>,
    }

    // The configuration of Mission Control, similar to the settings found in a Satellite or Orbiter.
    // This approach allows us to include a specific timestamp.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MissionControlSettings {
        pub monitoring: Option<Monitoring>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MonitoringConfig {
        pub cycles: Option<CyclesMonitoringConfig>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CyclesMonitoringConfig {
        pub notification: Option<DepositedCyclesEmailNotification>,
        pub default_strategy: Option<CyclesMonitoringStrategy>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Satellite {
        pub satellite_id: SatelliteId,
        pub metadata: Metadata,
        pub settings: Option<Settings>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Orbiter {
        pub orbiter_id: OrbiterId,
        pub metadata: Metadata,
        pub settings: Option<Settings>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[deprecated(
        since = "0.0.14",
        note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
    )]
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Archive {
        pub statuses: ArchiveStatuses,
    }

    #[deprecated(
        since = "0.0.14",
        note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
    )]
    pub type ArchiveStatusesSegments = HashMap<Principal, Statuses>;

    #[deprecated(
        since = "0.0.14",
        note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
    )]
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct ArchiveStatuses {
        pub mission_control: Statuses,
        pub satellites: ArchiveStatusesSegments,
        pub orbiters: ArchiveStatusesSegments,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Settings {
        pub monitoring: Option<Monitoring>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Monitoring {
        pub cycles: Option<CyclesMonitoring>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DepositedCyclesEmailNotification {
        pub to: Option<String>,
        pub enabled: bool,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct CyclesMonitoring {
        pub enabled: bool,
        pub strategy: Option<CyclesMonitoringStrategy>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum CyclesMonitoringStrategy {
        BelowThreshold(CyclesThreshold),
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct CyclesThreshold {
        pub min_cycles: u128,
        pub fund_cycles: u128,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct MonitoringHistoryKey {
        pub segment_id: SegmentId,
        pub created_at: Timestamp,
        pub nonce: i32,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MonitoringHistory {
        pub cycles: Option<MonitoringHistoryCycles>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MonitoringHistoryCycles {
        pub cycles: CyclesBalance,
        pub deposited_cycles: Option<CyclesBalance>,
    }
}

pub mod runtime {
    use canfund::FundManager;
    use rand::prelude::StdRng;

    #[derive(Default)]
    pub struct RuntimeState {
        pub rng: Option<StdRng>, // rng = Random Number Generator
        pub fund_manager: Option<FundManager>,
    }
}

pub mod core {
    use crate::types::state::Monitoring;
    use junobuild_shared::types::state::Metadata;

    pub trait Segment<K> {
        fn set_metadata(&self, metadata: &Metadata) -> Self;
    }

    pub trait SettingsMonitoring {
        fn monitoring(&self) -> Option<&Monitoring>;
    }
}

pub mod interface {
    use crate::types::state::CyclesMonitoringStrategy;
    use candid::CandidType;
    use junobuild_shared::mgmt::types::cmc::SubnetId;
    use junobuild_shared::types::state::{OrbiterId, SatelliteId, SegmentId, Timestamp};
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CreateCanisterConfig {
        pub name: Option<String>,
        pub subnet_id: Option<SubnetId>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SegmentsMonitoringStrategy {
        pub ids: Vec<SegmentId>,
        pub strategy: CyclesMonitoringStrategy,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CyclesMonitoringStartConfig {
        pub mission_control_strategy: Option<CyclesMonitoringStrategy>,
        pub satellites_strategy: Option<SegmentsMonitoringStrategy>,
        pub orbiters_strategy: Option<SegmentsMonitoringStrategy>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CyclesMonitoringStopConfig {
        pub try_mission_control: Option<bool>,
        pub satellite_ids: Option<Vec<SatelliteId>>,
        pub orbiter_ids: Option<Vec<OrbiterId>>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MonitoringStartConfig {
        pub cycles_config: Option<CyclesMonitoringStartConfig>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MonitoringStopConfig {
        pub cycles_config: Option<CyclesMonitoringStopConfig>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CyclesMonitoringStatus {
        pub running: bool,
        pub monitored_ids: Vec<SegmentId>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MonitoringStatus {
        pub cycles: Option<CyclesMonitoringStatus>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct GetMonitoringHistory {
        pub segment_id: SegmentId,
        pub from: Option<Timestamp>,
        pub to: Option<Timestamp>,
    }
}

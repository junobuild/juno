pub mod state {
    use candid::{CandidType, Principal};
    use junobuild_shared::types::state::{
        ArchiveTime, Controllers, Metadata, OrbiterId, SegmentStatusResult, Timestamp,
    };
    use junobuild_shared::types::state::{SatelliteId, UserId};
    use serde::{Deserialize, Serialize};
    use std::collections::{BTreeMap, HashMap};

    pub type Satellites = HashMap<SatelliteId, Satellite>;
    pub type Orbiters = HashMap<OrbiterId, Orbiter>;

    pub type Statuses = BTreeMap<ArchiveTime, SegmentStatusResult>;

    #[derive(Default, Serialize, Deserialize)]
    pub struct State {
        pub heap: HeapState,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        pub user: User,
        pub satellites: Satellites,
        pub controllers: Controllers,
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
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct MissionControlSettings {
        pub monitoring: Option<Monitoring>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
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

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Archive {
        pub statuses: ArchiveStatuses,
    }

    pub type ArchiveStatusesSegments = HashMap<Principal, Statuses>;

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
        pub cycles_strategy: Option<CyclesMonitoringStrategy>,
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
}

pub mod runtime {
    use canfund::FundManager;

    #[derive(Default)]
    pub struct RuntimeState {
        pub fund_manager: Option<FundManager>,
    }
}

pub mod core {
    use crate::types::state::Monitoring;
    use junobuild_shared::types::state::Metadata;

    pub trait Segment<K> {
        fn set_metadata(&self, metadata: &Metadata) -> Self;
    }

    pub trait HasMonitoring {
        fn monitoring(&self) -> Option<&Monitoring>;
    }
}

pub mod interface {
    use crate::types::state::CyclesMonitoringStrategy;
    use candid::CandidType;
    use junobuild_shared::mgmt::types::cmc::SubnetId;
    use junobuild_shared::types::state::SegmentId;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CreateCanisterConfig {
        pub name: Option<String>,
        pub subnet_id: Option<SubnetId>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SegmentsMonitoringStrategy {
        pub ids: Vec<SegmentId>,
        pub strategy: CyclesMonitoringStrategy,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CyclesMonitoringConfig {
        pub mission_control_strategy: Option<CyclesMonitoringStrategy>,
        pub satellites_strategy: Option<SegmentsMonitoringStrategy>,
        pub orbiters_strategy: Option<SegmentsMonitoringStrategy>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct MonitoringConfig {
        pub cycles_config: Option<CyclesMonitoringConfig>,
    }
}

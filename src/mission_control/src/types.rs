pub mod state {
    use candid::{CandidType, Deserialize, Principal};
    use junobuild_shared::types::state::{
        ArchiveTime, Controllers, Metadata, OrbiterId, SegmentStatusResult, Timestamp,
    };
    use junobuild_shared::types::state::{SatelliteId, UserId};
    use serde::Serialize;
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
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct User {
        pub user: Option<UserId>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub metadata: Metadata,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Satellite {
        pub satellite_id: SatelliteId,
        pub metadata: Metadata,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Orbiter {
        pub orbiter_id: OrbiterId,
        pub metadata: Metadata,
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
}

pub mod core {
    use junobuild_shared::types::state::Metadata;

    pub trait Segment<K> {
        fn set_metadata(&self, metadata: &Metadata) -> Self;
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use junobuild_shared::mgmt::types::cmc::SubnetId;
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CreateCanisterConfig {
        pub name: Option<String>,
        pub subnet_id: Option<SubnetId>,
    }
}

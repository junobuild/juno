pub mod state {
    use candid::{CandidType, Deserialize, Principal};
    use shared::types::state::{
        ArchiveTime, Controllers, Metadata, OrbiterId, SegmentStatusResult,
    };
    use shared::types::state::{SatelliteId, UserId};
    use std::collections::{BTreeMap, HashMap};

    pub type Satellites = HashMap<SatelliteId, Satellite>;
    pub type Orbiters = HashMap<OrbiterId, Orbiter>;

    pub type Statuses = BTreeMap<ArchiveTime, SegmentStatusResult>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub user: User,
        pub satellites: Satellites,
        pub controllers: Controllers,
        pub archive: Archive,
        pub orbiters: Orbiters,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct User {
        pub user: Option<UserId>,
        pub created_at: u64,
        pub updated_at: u64,
        pub metadata: Metadata,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Satellite {
        pub satellite_id: SatelliteId,
        pub metadata: Metadata,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Orbiter {
        pub orbiter_id: OrbiterId,
        pub metadata: Metadata,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Archive {
        pub statuses: ArchiveStatuses,
    }

    pub type ArchiveStatusesSegments = HashMap<Principal, Statuses>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ArchiveStatuses {
        pub mission_control: Statuses,
        pub satellites: ArchiveStatusesSegments,
        pub orbiters: ArchiveStatusesSegments,
    }
}

pub mod core {
    use shared::types::state::Metadata;

    pub trait Segment<K> {
        fn set_metadata(&self, metadata: &Metadata) -> Self;
    }
}

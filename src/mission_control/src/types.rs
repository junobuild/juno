pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::state::{ArchiveTime, Controllers, Metadata, SegmentStatusResult};
    use shared::types::state::{SatelliteId, UserId};
    use std::collections::{BTreeMap, HashMap};

    pub type Satellites = HashMap<SatelliteId, Satellite>;

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

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Archive {
        pub statuses: ArchiveStatuses,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ArchiveStatuses {
        pub mission_control: Statuses,
        pub satellites: HashMap<SatelliteId, Statuses>,
    }
}

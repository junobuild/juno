pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::state::{Controllers, Metadata};
    use shared::types::state::{SatelliteId, UserId};
    use std::collections::HashMap;

    pub type Satellites = HashMap<SatelliteId, Satellite>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub user: User,
        pub satellites: Satellites,
        pub controllers: Controllers,
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
}

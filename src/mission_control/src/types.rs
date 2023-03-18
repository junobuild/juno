pub mod state {
    use candid::{CandidType, Deserialize, Principal};
    use shared::types::state::Controllers;
    use shared::types::state::UserId;
    use std::collections::HashMap;

    pub type SatelliteId = Principal;
    pub type Satellites = HashMap<SatelliteId, Satellite>;
    pub type Metadata = HashMap<String, String>;

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

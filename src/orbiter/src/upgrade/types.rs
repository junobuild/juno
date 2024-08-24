pub mod upgrade {
    use crate::memory::init_stable_state;
    use crate::types::state::StableState;
    use candid::CandidType;
    use junobuild_shared::types::state::{Controllers, SatelliteId, Timestamp, Version};
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    #[derive(Serialize, Deserialize)]
    pub struct UpgradeState {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        // Indirect stable state: State that lives on the heap, but is saved into stable memory on upgrades.
        pub heap: UpgradeHeapState,
    }

    pub type UpgradeSatelliteConfigs = HashMap<SatelliteId, UpgradeOrbiterSatelliteConfig>;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeHeapState {
        pub controllers: Controllers,
        pub config: UpgradeSatelliteConfigs,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeOrbiterSatelliteConfig {
        pub enabled: bool,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }
}

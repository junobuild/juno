pub mod upgrade {
    use crate::memory::init_stable_state;
    use crate::types::state::{OriginConfigs, StableState};
    use candid::CandidType;
    use serde::{Deserialize, Serialize};
    use shared::types::state::Controllers;

    #[derive(Serialize, Deserialize)]
    pub struct UpgradeState {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        // Indirect stable state: State that lives on the heap, but is saved into stable memory on upgrades.
        pub heap: UpgradeHeapState,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeHeapState {
        pub controllers: Controllers,
        pub origins: OriginConfigs,
    }
}

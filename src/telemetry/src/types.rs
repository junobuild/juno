pub mod state {
    use crate::memory::init_stable_state;
    use crate::types::memory::Memory;
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use serde::{Deserialize, Serialize};
    use shared::types::state::{Controllers, SatelliteId};

    #[derive(Serialize, Deserialize)]
    pub struct State {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        // Indirect stable state: State that lives on the heap, but is saved into stable memory on upgrades.
        pub heap: HeapState,
    }

    #[derive(CandidType, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct StableKey {
        pub satellite_id: SatelliteId,
        pub timestamp: u64,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct PageView {
        // TODO: implement
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct TrackEvent {
        // TODO: implement
    }

    pub type PageViewsStable = StableBTreeMap<StableKey, PageView, Memory>;
    pub type TrackEventsStable = StableBTreeMap<StableKey, TrackEvent, Memory>;

    pub struct StableState {
        pub page_views: PageViewsStable,
        pub track_events: TrackEventsStable,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        pub controllers: Controllers,
    }
}

pub mod memory {
    use ic_stable_structures::memory_manager::VirtualMemory;
    use ic_stable_structures::DefaultMemoryImpl;

    pub type Memory = VirtualMemory<DefaultMemoryImpl>;
}

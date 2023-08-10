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

    pub type Key = String;
    pub type SessionId = String;

    #[derive(CandidType, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct AnalyticKey {
        pub satellite_id: SatelliteId,
        pub key: Key,
        pub session_id: SessionId,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct PageView {
        pub title: String,
        pub href: String,
        pub referrer: Option<String>,
        pub device: PageViewDevice,
        pub user_agent: Option<String>,
        pub time_zone: String,
        pub collected_at: u64,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct PageViewDevice {
        inner_width: u16,
        inner_height: u16,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct TrackEvent {
        // TODO: implement
    }

    pub type PageViewsStable = StableBTreeMap<AnalyticKey, PageView, Memory>;
    pub type TrackEventsStable = StableBTreeMap<AnalyticKey, TrackEvent, Memory>;

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

pub mod interface {
    use crate::types::state::PageViewDevice;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::SatelliteId;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetPageView {
        pub title: String,
        pub href: String,
        pub referrer: Option<String>,
        pub device: PageViewDevice,
        pub user_agent: Option<String>,
        pub time_zone: String,
        pub collected_at: u64,
        pub updated_at: Option<u64>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct GetPageViews {
        pub satellite_id: Option<SatelliteId>,
        pub from: Option<u64>,
        pub to: Option<u64>,
    }
}

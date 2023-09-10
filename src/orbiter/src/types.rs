pub mod state {
    use crate::memory::init_stable_state;
    use crate::types::memory::Memory;
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use serde::{Deserialize, Serialize};
    use shared::types::state::{Controllers, Metadata, SatelliteId};
    use std::collections::HashMap;

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

    pub type PageViewsStableMonth = StableBTreeMap<AnalyticKey, PageView, Memory>;
    pub type TrackEventsStableMonth = StableBTreeMap<AnalyticKey, TrackEvent, Memory>;

    pub type PageViewsStable = Vec<PageViewsStableMonth>;
    pub type TrackEventsStable = Vec<TrackEventsStableMonth>;

    pub struct StableState {
        pub page_views: PageViewsStable,
        pub track_events: TrackEventsStable,
    }

    pub type SatelliteConfigs = HashMap<SatelliteId, SatelliteConfig>;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        pub controllers: Controllers,
        pub config: SatelliteConfigs,
    }

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
        pub inner_width: u16,
        pub inner_height: u16,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct TrackEvent {
        pub name: String,
        pub metadata: Option<Metadata>,
        pub collected_at: u64,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SatelliteConfig {
        pub enabled: bool,
        pub created_at: u64,
        pub updated_at: u64,
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
    use shared::types::state::{Metadata, SatelliteId};

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetPageView {
        pub title: String,
        pub href: String,
        pub referrer: Option<String>,
        pub device: PageViewDevice,
        pub time_zone: String,
        pub user_agent: Option<String>,
        pub collected_at: u64,
        pub updated_at: Option<u64>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetTrackEvent {
        pub name: String,
        pub metadata: Option<Metadata>,
        pub user_agent: Option<String>,
        pub collected_at: u64,
        pub updated_at: Option<u64>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct GetAnalytics {
        pub satellite_id: Option<SatelliteId>,
        pub from: Option<u64>,
        pub to: Option<u64>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetSatelliteConfig {
        pub enabled: bool,
        pub updated_at: Option<u64>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct DelSatelliteConfig {
        pub updated_at: Option<u64>,
    }
}

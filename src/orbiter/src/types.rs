pub mod state {
    use crate::memory::init_stable_state;
    use crate::types::memory::Memory;
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use serde::{Deserialize, Serialize};
    use shared::types::state::{Controllers, Metadata, OrbiterSatelliteConfig, SatelliteId};
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

    pub type PageViewsStable = StableBTreeMap<AnalyticKey, PageView, Memory>;
    pub type TrackEventsStable = StableBTreeMap<AnalyticKey, TrackEvent, Memory>;

    pub type SatellitesPageViewsStable = StableBTreeMap<AnalyticSatelliteKey, AnalyticKey, Memory>;
    pub type SatellitesTrackEventsStable =
        StableBTreeMap<AnalyticSatelliteKey, AnalyticKey, Memory>;

    pub struct StableState {
        pub page_views: PageViewsStable,
        pub track_events: TrackEventsStable,
        pub satellites_page_views: SatellitesPageViewsStable,
        pub satellites_track_events: SatellitesTrackEventsStable,
    }

    pub type SatelliteConfig = OrbiterSatelliteConfig;
    pub type SatelliteConfigs = HashMap<SatelliteId, SatelliteConfig>;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        pub controllers: Controllers,
        pub config: SatelliteConfigs,
    }

    #[derive(CandidType, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct AnalyticKey {
        pub collected_at: u64,
        pub key: Key,
    }

    #[derive(CandidType, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct AnalyticSatelliteKey {
        pub satellite_id: SatelliteId,
        pub collected_at: u64,
        pub key: Key,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct PageView {
        pub title: String,
        pub href: String,
        pub referrer: Option<String>,
        pub device: PageViewDevice,
        pub user_agent: Option<String>,
        pub time_zone: String,
        pub satellite_id: SatelliteId,
        pub session_id: SessionId,
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
        pub satellite_id: SatelliteId,
        pub session_id: SessionId,
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
    use crate::types::state::{PageViewDevice, SessionId};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::{Metadata, SatelliteId};
    use shared::types::utils::CalendarDate;
    use std::collections::HashMap;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetPageView {
        pub title: String,
        pub href: String,
        pub referrer: Option<String>,
        pub device: PageViewDevice,
        pub time_zone: String,
        pub user_agent: Option<String>,
        pub satellite_id: SatelliteId,
        pub session_id: SessionId,
        pub updated_at: Option<u64>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetTrackEvent {
        pub name: String,
        pub metadata: Option<Metadata>,
        pub user_agent: Option<String>,
        pub satellite_id: SatelliteId,
        pub session_id: SessionId,
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

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsMetricsPageViews {
        pub daily_total_page_views: HashMap<CalendarDate, u32>,
        pub unique_sessions: usize,
        pub unique_page_views: usize,
        pub total_page_views: u32,
        pub average_page_views_per_session: f64,
        pub bounce_rate: f64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsTop10PageViews {
        pub referrers: Vec<(String, u32)>,
        pub pages: Vec<(String, u32)>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsDevicesPageViews {
        pub mobile: f64,
        pub desktop: f64,
        pub others: f64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsBrowsersPageViews {
        pub chrome: f64,
        pub opera: f64,
        pub firefox: f64,
        pub safari: f64,
        pub others: f64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsClientsPageViews {
        pub devices: AnalyticsDevicesPageViews,
        pub browsers: AnalyticsBrowsersPageViews,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsTrackEvents {
        pub total: HashMap<String, u32>,
    }
}

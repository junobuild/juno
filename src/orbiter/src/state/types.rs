pub mod state {
    use crate::state::memory::init_stable_state;
    use crate::state::types::memory::{StoredPageView, StoredTrackEvent};
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{
        Controllers, Metadata, OrbiterSatelliteConfig, SatelliteId, Timestamp, Version,
    };
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;
    use crate::state::types::state::analytics::{DailyPageViewsStable, DailySessionViewsStable, SatellitesDailyPageViewsStable, SatellitesDailySessionViewsStable};

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

    pub type PageViewsStable = StableBTreeMap<AnalyticKey, StoredPageView, Memory>;
    pub type TrackEventsStable = StableBTreeMap<AnalyticKey, StoredTrackEvent, Memory>;
    pub type PerformanceMetricsStable = StableBTreeMap<AnalyticKey, PerformanceMetric, Memory>;

    pub type SatellitesPageViewsStable = StableBTreeMap<AnalyticSatelliteKey, AnalyticKey, Memory>;
    pub type SatellitesTrackEventsStable =
        StableBTreeMap<AnalyticSatelliteKey, AnalyticKey, Memory>;
    pub type SatellitesPerformanceMetricsStable =
        StableBTreeMap<AnalyticSatelliteKey, AnalyticKey, Memory>;

    pub struct StableState {
        pub page_views: PageViewsStable,
        pub track_events: TrackEventsStable,
        pub performance_metrics: PerformanceMetricsStable,
        pub satellites_page_views: SatellitesPageViewsStable,
        pub satellites_track_events: SatellitesTrackEventsStable,
        pub satellites_performance_metrics: SatellitesPerformanceMetricsStable,
        
        pub daily_page_views: DailyPageViewsStable,
        pub satellites_daily_page_views: SatellitesDailyPageViewsStable,
        pub daily_session_views: DailySessionViewsStable,
        pub satellites_daily_session_views: SatellitesDailySessionViewsStable,
    }

    pub type SatelliteConfig = OrbiterSatelliteConfig;
    pub type SatelliteConfigs = HashMap<SatelliteId, SatelliteConfig>;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        pub controllers: Controllers,
        pub config: SatelliteConfigs,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct AnalyticKey {
        pub collected_at: Timestamp,
        pub key: Key,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct AnalyticSatelliteKey {
        pub satellite_id: SatelliteId,
        pub collected_at: Timestamp,
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
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
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
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct PerformanceMetric {
        pub href: String,
        pub metric_name: PerformanceMetricName,
        pub data: PerformanceData,
        pub satellite_id: SatelliteId,
        pub session_id: SessionId,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }

    #[allow(clippy::upper_case_acronyms)]
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum PerformanceMetricName {
        CLS,
        FCP,
        INP,
        LCP,
        TTFB,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum PerformanceData {
        WebVitalsMetric(WebVitalsMetric),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct WebVitalsMetric {
        pub value: f64,
        pub delta: f64,
        pub id: String,
        pub navigation_type: Option<NavigationType>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum NavigationType {
        Navigate,
        Reload,
        BackForward,
        BackForwardCache,
        Prerender,
        Restore,
    }
    
    pub mod analytics {
        use std::collections::HashSet;
        use candid::{CandidType, Deserialize};
        use ic_stable_structures::StableBTreeMap;
        use serde::Serialize;
        use junobuild_shared::types::memory::Memory;
        use junobuild_shared::types::state::{SatelliteId, Timestamp, Version};
        use crate::state::types::state::SessionId;

        pub type DailyPageViewsStable = StableBTreeMap<DailyAnalyticKey, DailyPageViews, Memory>;
        pub type SatellitesDailyPageViewsStable = StableBTreeMap<DailyAnalyticSatelliteKey, DailyAnalyticKey, Memory>;
        pub type DailySessionViewsStable = StableBTreeMap<DailySessionsAnalyticKey, DailySessionViews, Memory>;
        pub type SatellitesDailySessionViewsStable = StableBTreeMap<DailySessionsAnalyticSatelliteKey, DailySessionsAnalyticKey, Memory>;

        pub type StartOfDayKey = Timestamp;

        #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
        pub struct DailyAnalyticKey {
            pub start_of_day: Timestamp,
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
        pub struct DailyAnalyticSatelliteKey {
            pub satellite_id: SatelliteId,
            pub start_of_day: Timestamp,
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
        pub struct DailySessionsAnalyticKey {
            pub start_of_day: Timestamp,
            pub session_id: SessionId,
        }
        
        #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
        pub struct DailySessionsAnalyticSatelliteKey {
            pub satellite_id: SatelliteId,
            pub start_of_day: Timestamp,
            pub session_id: SessionId,
        }
        
        #[derive(CandidType, Serialize, Deserialize, Clone)]
        pub struct DailyPageViews {
            pub count: u32,
            pub version: Option<Version>,
        }

        #[derive(CandidType, Serialize, Deserialize, Clone)]
        pub struct DailySessionViews {
            pub count: u32,
            pub hrefs: HashSet<String>,
            pub version: Option<Version>,
        }
        
    }
}

pub mod memory {
    use crate::state::types::state::{PageView, TrackEvent};
    use candid::CandidType;
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum StoredPageView {
        Unbounded(PageView),
        Bounded(PageView),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum StoredTrackEvent {
        Unbounded(TrackEvent),
        Bounded(TrackEvent),
    }
}

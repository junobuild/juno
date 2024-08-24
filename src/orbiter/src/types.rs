pub mod state {
    use crate::memory::init_stable_state;
    use crate::types::memory::{StoredPageView, StoredTrackEvent};
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{
        Controllers, Metadata, OrbiterSatelliteConfig, SatelliteId, Timestamp, Version,
    };
    use serde::{Deserialize, Serialize};
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
}

pub mod memory {
    use crate::types::state::{PageView, TrackEvent};
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

pub mod interface {
    use crate::types::state::{PageViewDevice, PerformanceData, PerformanceMetricName, SessionId};
    use candid::CandidType;
    use junobuild_shared::types::state::{
        Metadata, OrbiterSatelliteFeatures, SatelliteId, Timestamp, Version,
    };
    use junobuild_shared::types::utils::CalendarDate;
    use serde::Deserialize;
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
        #[deprecated(
            since = "0.0.7",
            note = "Support for backwards compatibility. It has been replaced by version for overwrite checks."
        )]
        pub updated_at: Option<Timestamp>,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetTrackEvent {
        pub name: String,
        pub metadata: Option<Metadata>,
        pub user_agent: Option<String>,
        pub satellite_id: SatelliteId,
        pub session_id: SessionId,
        #[deprecated(
            since = "0.0.7",
            note = "Support for backwards compatibility. It has been replaced by version for overwrite checks."
        )]
        pub updated_at: Option<Timestamp>,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetPerformanceMetric {
        pub href: String,
        pub metric_name: PerformanceMetricName,
        pub data: PerformanceData,
        pub user_agent: Option<String>,
        pub satellite_id: SatelliteId,
        pub session_id: SessionId,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct GetAnalytics {
        pub satellite_id: Option<SatelliteId>,
        pub from: Option<Timestamp>,
        pub to: Option<Timestamp>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetSatelliteConfig {
        pub features: Option<OrbiterSatelliteFeatures>,
        pub version: Option<Version>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct DelSatelliteConfig {
        pub version: Option<Version>,
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

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsWebVitalsPerformanceMetrics {
        pub overall: AnalyticsWebVitalsPageMetrics,
        pub pages: Vec<(String, AnalyticsWebVitalsPageMetrics)>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsWebVitalsPageMetrics {
        pub cls: Option<f64>,
        pub fcp: Option<f64>,
        pub inp: Option<f64>,
        pub lcp: Option<f64>,
        pub ttfb: Option<f64>,
    }
}

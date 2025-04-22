pub mod core {
    use ic_http_certification::HttpRequest;

    pub type UpdateHandler<T> = fn(&HttpRequest) -> Result<T, String>;
}

pub mod interface {
    use crate::state::types::state::{
        AnalyticKey, PageViewDevice, PerformanceData, PerformanceMetricName, SessionId,
    };
    use candid::CandidType;
    use junobuild_shared::types::state::{
        Metadata, OrbiterSatelliteFeatures, SatelliteId, Timestamp, Version,
    };
    use junobuild_shared::types::utils::CalendarDate;
    use serde::Deserialize;
    use std::collections::HashMap;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct PageViewPayload {
        pub key: AnalyticKey,
        pub page_view: SetPageView,
    }

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

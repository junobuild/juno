pub mod interface {
    use crate::state::types::state::{
        PageViewClient, PageViewDevice, PerformanceData, PerformanceMetricName, SessionId,
    };
    use candid::CandidType;
    use junobuild_shared::types::core::DomainName;
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
        pub client: Option<PageViewClient>,
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
        pub restricted_origin: Option<DomainName>,
        pub version: Option<Version>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct DelSatelliteConfig {
        pub version: Option<Version>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsMetricsPageViews {
        pub daily_total_page_views: HashMap<CalendarDate, u32>,
        pub total_sessions: usize,
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
    pub struct AnalyticsOperatingSystemsPageViews {
        pub ios: f64,
        pub android: f64,
        pub windows: f64,
        pub macos: f64,
        pub linux: f64,
        pub others: f64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AnalyticsDevicesPageViews {
        pub mobile: f64,
        pub tablet: f64,
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
        pub operating_systems: AnalyticsOperatingSystemsPageViews,
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

    pub mod http {
        use crate::state::types::state::{
            Key, PageViewDevice, PerformanceData, PerformanceMetricName, SessionId,
        };
        use junobuild_shared::types::state::Metadata;
        use junobuild_utils::DocDataBigInt;
        use serde::{Deserialize, Serialize};

        pub type TimestampPayload = DocDataBigInt;
        pub type VersionPayload = Option<DocDataBigInt>;

        // We use textual representation of Principal for performance reason on the client side.
        // This way the frontend can spare the need to bloat the JS bundle.
        pub type PrincipalText = String;
        pub type SatelliteIdText = PrincipalText;

        #[derive(Deserialize)]
        pub struct SetPageViewRequest {
            pub satellite_id: SatelliteIdText,
            pub key: AnalyticKeyPayload,
            pub page_view: SetPageViewPayload,
        }

        #[derive(Deserialize)]
        pub struct SetTrackEventRequest {
            pub satellite_id: SatelliteIdText,
            pub key: AnalyticKeyPayload,
            pub track_event: SetTrackEventPayload,
        }

        #[derive(Deserialize)]
        pub struct SetPerformanceMetricRequest {
            pub satellite_id: SatelliteIdText,
            pub key: AnalyticKeyPayload,
            pub performance_metric: SetPerformanceMetricPayload,
        }

        #[derive(Deserialize)]
        pub struct SetPageViewsRequest {
            pub satellite_id: SatelliteIdText,
            pub page_views: Vec<SetPageViewsRequestEntry>,
        }

        #[derive(Deserialize)]
        pub struct SetPageViewsRequestEntry {
            pub key: AnalyticKeyPayload,
            pub page_view: SetPageViewPayload,
        }

        #[derive(Deserialize)]
        pub struct SetTrackEventsRequest {
            pub satellite_id: SatelliteIdText,
            pub track_events: Vec<SetTrackEventsRequestEntry>,
        }

        #[derive(Deserialize)]
        pub struct SetTrackEventsRequestEntry {
            pub key: AnalyticKeyPayload,
            pub track_event: SetTrackEventPayload,
        }

        #[derive(Deserialize)]
        pub struct SetPerformanceMetricsRequest {
            pub satellite_id: SatelliteIdText,
            pub performance_metrics: Vec<SetPerformanceMetricsRequestEntry>,
        }

        #[derive(Deserialize)]
        pub struct SetPerformanceMetricsRequestEntry {
            pub key: AnalyticKeyPayload,
            pub performance_metric: SetPerformanceMetricPayload,
        }

        #[derive(Deserialize)]
        pub struct AnalyticKeyPayload {
            pub collected_at: TimestampPayload,
            pub key: Key,
        }

        #[derive(Deserialize)]
        pub struct SetPageViewPayload {
            pub title: String,
            pub href: String,
            pub referrer: Option<String>,
            pub device: PageViewDevice,
            pub time_zone: String,
            pub user_agent: Option<String>,
            pub client: Option<PageViewClientPayload>,
            pub session_id: SessionId,
            pub version: VersionPayload,
        }

        #[derive(Deserialize)]
        pub struct SetTrackEventPayload {
            pub name: String,
            pub metadata: Option<Metadata>,
            pub user_agent: Option<String>,
            pub session_id: SessionId,
            pub version: VersionPayload,
        }

        #[derive(Deserialize)]
        pub struct SetPerformanceMetricPayload {
            pub href: String,
            pub metric_name: PerformanceMetricName,
            pub data: PerformanceData,
            pub user_agent: Option<String>,
            pub session_id: SessionId,
            pub version: VersionPayload,
        }

        #[derive(Serialize)]
        pub struct PageViewPayload {
            pub title: String,
            pub href: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            pub referrer: Option<String>,
            pub device: PageViewDevice,
            pub time_zone: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            pub user_agent: Option<String>,
            #[serde(skip_serializing_if = "Option::is_none")]
            pub client: Option<PageViewClientPayload>,
            pub session_id: SessionId,
            pub created_at: TimestampPayload,
            pub updated_at: TimestampPayload,
            #[serde(skip_serializing_if = "Option::is_none")]
            pub version: VersionPayload,
        }

        #[derive(Deserialize, Serialize)]
        pub struct PageViewClientPayload {
            pub browser: String,
            #[serde(rename = "os")]
            pub operating_system: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            pub device: Option<String>,
        }

        #[derive(Serialize)]
        pub struct TrackEventPayload {
            pub name: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            pub metadata: Option<Metadata>,
            pub session_id: SessionId,
            pub created_at: TimestampPayload,
            pub updated_at: TimestampPayload,
            #[serde(skip_serializing_if = "Option::is_none")]
            pub version: VersionPayload,
        }

        #[derive(Serialize)]
        pub struct PerformanceMetricPayload {
            pub href: String,
            pub metric_name: PerformanceMetricName,
            pub data: PerformanceData,
            pub session_id: SessionId,
            pub created_at: TimestampPayload,
            pub updated_at: TimestampPayload,
            #[serde(skip_serializing_if = "Option::is_none")]
            pub version: VersionPayload,
        }
    }
}

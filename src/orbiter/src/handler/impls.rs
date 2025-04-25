use ic_http_certification::StatusCode;
use crate::state::types::state::{AnalyticKey, PageView, PerformanceMetric, TrackEvent};
use crate::types::interface::http::{
    AnalyticKeyPayload, PageViewPayload, PerformanceMetricPayload, SetPageViewPayload,
    SetPerformanceMetricPayload, SetTrackEventPayload, TrackEventPayload,
};
use crate::types::interface::{SetPageView, SetPerformanceMetric, SetTrackEvent};
use junobuild_utils::{DocDataBigInt, DocDataPrincipal};
use crate::http::types::handler::HandledUpdateResult;
use crate::http::types::interface::{ResponseBody, ResponseHeaders};

impl AnalyticKeyPayload {
    pub fn into_domain(self) -> AnalyticKey {
        AnalyticKey {
            collected_at: self.collected_at.value,
            key: self.key,
        }
    }
}

impl SetPageViewPayload {
    pub fn into_domain(self) -> SetPageView {
        SetPageView {
            title: self.title,
            href: self.href,
            referrer: self.referrer,
            device: self.device,
            time_zone: self.time_zone,
            user_agent: self.user_agent,
            satellite_id: self.satellite_id.value,
            session_id: self.session_id,
            updated_at: None,
            version: self.version.map(|version| version.value),
        }
    }
}

impl PageViewPayload {
    pub fn from_domain(page_view: PageView) -> Self {
        Self {
            title: page_view.title,
            href: page_view.href,
            referrer: page_view.referrer,
            device: page_view.device,
            user_agent: page_view.user_agent,
            time_zone: page_view.time_zone,
            satellite_id: DocDataPrincipal {
                value: page_view.satellite_id,
            },
            session_id: page_view.session_id,
            created_at: DocDataBigInt {
                value: page_view.created_at,
            },
            updated_at: DocDataBigInt {
                value: page_view.updated_at,
            },
            version: page_view
                .version
                .map(|version| DocDataBigInt { value: version }),
        }
    }
}

impl SetTrackEventPayload {
    pub fn into_domain(self) -> SetTrackEvent {
        SetTrackEvent {
            name: self.name,
            metadata: self.metadata,
            user_agent: self.user_agent,
            satellite_id: self.satellite_id.value,
            session_id: self.session_id,
            updated_at: None,
            version: self.version.map(|version| version.value),
        }
    }
}

impl TrackEventPayload {
    pub fn from_domain(track_event: TrackEvent) -> Self {
        Self {
            name: track_event.name,
            metadata: track_event.metadata,
            satellite_id: DocDataPrincipal {
                value: track_event.satellite_id,
            },
            session_id: track_event.session_id,
            created_at: DocDataBigInt {
                value: track_event.created_at,
            },
            updated_at: DocDataBigInt {
                value: track_event.updated_at,
            },
            version: track_event
                .version
                .map(|version| DocDataBigInt { value: version }),
        }
    }
}

impl SetPerformanceMetricPayload {
    pub fn into_domain(self) -> SetPerformanceMetric {
        SetPerformanceMetric {
            href: self.href,
            metric_name: self.metric_name,
            data: self.data,
            user_agent: self.user_agent,
            satellite_id: self.satellite_id.value,
            session_id: self.session_id,
            version: self.version.map(|version| version.value),
        }
    }
}

impl PerformanceMetricPayload {
    pub fn from_domain(performance_metric: PerformanceMetric) -> Self {
        Self {
            href: performance_metric.href,
            metric_name: performance_metric.metric_name,
            data: performance_metric.data,
            satellite_id: DocDataPrincipal {
                value: performance_metric.satellite_id,
            },
            session_id: performance_metric.session_id,
            created_at: DocDataBigInt {
                value: performance_metric.created_at,
            },
            updated_at: DocDataBigInt {
                value: performance_metric.updated_at,
            },
            version: performance_metric
                .version
                .map(|version| DocDataBigInt { value: version }),
        }
    }
}

impl HandledUpdateResult {
    pub fn new(
        status_code: StatusCode,
        body: ResponseBody,
        headers: Option<ResponseHeaders>,
    ) -> Self {
        Self {
            status_code,
            body,
            headers,
        }
    }
}

use crate::state::types::state::{
    AnalyticKey, PageView, PageViewClient, PageViewDevice, PerformanceMetric, TrackEvent,
};
use crate::types::interface::http::{
    AnalyticKeyPayload, PageViewClientPayload, PageViewDevicePayload, PageViewPayload,
    PerformanceMetricPayload, SatelliteIdText, SetPageViewPayload, SetPerformanceMetricPayload,
    SetTrackEventPayload, TrackEventPayload,
};
use crate::types::interface::{SetPageView, SetPerformanceMetric, SetTrackEvent};
use candid::types::principal::PrincipalError;
use candid::Principal;
use junobuild_utils::DocDataBigInt;

impl AnalyticKeyPayload {
    pub fn into_domain(self) -> AnalyticKey {
        AnalyticKey {
            collected_at: self.collected_at.value,
            key: self.key,
        }
    }
}

impl SetPageViewPayload {
    pub fn convert_to_setter(
        payload: SetPageViewPayload,
        satellite_id: &SatelliteIdText,
    ) -> Result<SetPageView, PrincipalError> {
        let page_view = SetPageView {
            title: payload.title,
            href: payload.href,
            referrer: payload.referrer,
            device: PageViewDevice::convert_to_setter(payload.device),
            time_zone: payload.time_zone,
            user_agent: payload.user_agent,
            client: payload.client.map(PageViewClient::convert_to_setter),
            satellite_id: Principal::from_text(satellite_id)?,
            session_id: payload.session_id,
            updated_at: None,
            version: payload.version.map(|version| version.value),
        };

        Ok(page_view)
    }
}

impl PageViewClient {
    pub fn convert_to_setter(payload: PageViewClientPayload) -> Self {
        Self {
            browser: payload.browser,
            operating_system: payload.operating_system,
            device: payload.device,
        }
    }
}

impl PageViewDevice {
    pub fn convert_to_setter(payload: PageViewDevicePayload) -> Self {
        Self {
            inner_width: payload.inner_width,
            inner_height: payload.inner_height,
            screen_width: payload.screen_width,
            screen_height: payload.screen_height,
        }
    }
}

impl PageViewPayload {
    pub fn from_domain(page_view: PageView) -> Self {
        Self {
            title: page_view.title,
            href: page_view.href,
            referrer: page_view.referrer,
            device: PageViewDevicePayload::from_domain(page_view.device),
            user_agent: page_view.user_agent,
            client: page_view.client.map(PageViewClientPayload::from_domain),
            time_zone: page_view.time_zone,
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

impl PageViewClientPayload {
    pub fn from_domain(client: PageViewClient) -> Self {
        Self {
            browser: client.browser,
            operating_system: client.operating_system,
            device: client.device,
        }
    }
}

impl PageViewDevicePayload {
    pub fn from_domain(client: PageViewDevice) -> Self {
        Self {
            inner_width: client.inner_width,
            inner_height: client.inner_height,
            screen_width: client.screen_width,
            screen_height: client.screen_height,
        }
    }
}

impl SetTrackEventPayload {
    pub fn convert_to_setter(
        payload: SetTrackEventPayload,
        satellite_id: &SatelliteIdText,
    ) -> Result<SetTrackEvent, PrincipalError> {
        let track_event = SetTrackEvent {
            name: payload.name,
            metadata: payload.metadata,
            user_agent: payload.user_agent,
            satellite_id: Principal::from_text(satellite_id)?,
            session_id: payload.session_id,
            updated_at: None,
            version: payload.version.map(|version| version.value),
        };

        Ok(track_event)
    }
}

impl TrackEventPayload {
    pub fn from_domain(track_event: TrackEvent) -> Self {
        Self {
            name: track_event.name,
            metadata: track_event.metadata,
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
    pub fn convert_to_setter(
        payload: SetPerformanceMetricPayload,
        satellite_id: &SatelliteIdText,
    ) -> Result<SetPerformanceMetric, PrincipalError> {
        let metric = SetPerformanceMetric {
            href: payload.href,
            metric_name: payload.metric_name,
            data: payload.data,
            user_agent: payload.user_agent,
            satellite_id: Principal::from_text(satellite_id)?,
            session_id: payload.session_id,
            version: payload.version.map(|version| version.value),
        };

        Ok(metric)
    }
}

impl PerformanceMetricPayload {
    pub fn from_domain(performance_metric: PerformanceMetric) -> Self {
        Self {
            href: performance_metric.href,
            metric_name: performance_metric.metric_name,
            data: performance_metric.data,
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

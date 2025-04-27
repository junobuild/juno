use crate::types::interface::http::{
    SetPageViewRequest, SetPageViewsRequest, SetPerformanceMetricRequest,
    SetPerformanceMetricsRequest, SetRequest, SetTrackEventRequest, SetTrackEventsRequest,
};

impl SetRequest for SetPageViewRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }

    fn empty_payload(&self) -> bool {
        false
    }
}

impl SetRequest for SetTrackEventRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }

    fn empty_payload(&self) -> bool {
        false
    }
}

impl SetRequest for SetPerformanceMetricRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }

    fn empty_payload(&self) -> bool {
        false
    }
}

impl SetRequest for SetPageViewsRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }

    fn empty_payload(&self) -> bool {
        self.page_views.is_empty()
    }
}

impl SetRequest for SetTrackEventsRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }

    fn empty_payload(&self) -> bool {
        self.track_events.is_empty()
    }
}

impl SetRequest for SetPerformanceMetricsRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }

    fn empty_payload(&self) -> bool {
        self.performance_metrics.is_empty()
    }
}

use crate::types::interface::http::{
    SetPageViewRequest, SetPageViewsRequest, SetPerformanceMetricRequest,
    SetPerformanceMetricsRequest, SetRequest, SetTrackEventRequest, SetTrackEventsRequest,
};

impl SetRequest for SetPageViewRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }
}

impl SetRequest for SetTrackEventRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }
}

impl SetRequest for SetPerformanceMetricRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }
}

impl SetRequest for SetPageViewsRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }
}

impl SetRequest for SetTrackEventsRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }
}

impl SetRequest for SetPerformanceMetricsRequest {
    fn satellite_id(&self) -> &str {
        &self.satellite_id
    }
}

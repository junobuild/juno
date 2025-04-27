use crate::assert::config::assert_performance_metrics_enabled;
use crate::events::helpers::assert_and_insert_performance_metric;
use crate::handler::adapters::assert::assert_request_feature_enabled;
use crate::handler::adapters::response_builder::build_payload_response;
use crate::http::types::handler::HandledUpdateResult;
use crate::http::types::request::HttpRequestBody;
use crate::state::types::state::AnalyticKey;
use crate::types::interface::http::{
    PerformanceMetricPayload, SetPerformanceMetricPayload, SetPerformanceMetricRequest,
    SetPerformanceMetricsRequest, SetPerformanceMetricsRequestEntry,
};
use junobuild_utils::decode_doc_data;

pub fn assert_request_performance_metric(body: &HttpRequestBody) -> Result<(), String> {
    assert_request_feature_enabled::<SetPerformanceMetricRequest>(
        body,
        assert_performance_metrics_enabled,
    )
}

pub fn assert_request_performance_metrics(body: &HttpRequestBody) -> Result<(), String> {
    assert_request_feature_enabled::<SetPerformanceMetricsRequest>(
        body,
        assert_performance_metrics_enabled,
    )
}

pub fn handle_insert_performance_metric(
    body: &HttpRequestBody,
) -> Result<HandledUpdateResult, String> {
    let SetPerformanceMetricRequest {
        key,
        performance_metric,
        satellite_id,
    }: SetPerformanceMetricRequest =
        decode_doc_data::<SetPerformanceMetricRequest>(body).map_err(|e| e.to_string())?;

    let inserted_performance_metric = assert_and_insert_performance_metric(
        key.into_domain(),
        SetPerformanceMetricPayload::convert_to_setter(performance_metric, &satellite_id)
            .map_err(|e| e.to_string())?,
    )?;

    let payload = PerformanceMetricPayload::from_domain(inserted_performance_metric);

    build_payload_response(payload, &satellite_id)
}

pub fn handle_insert_performance_metrics(
    body: &HttpRequestBody,
) -> Result<HandledUpdateResult, String> {
    let performance_metrics: SetPerformanceMetricsRequest =
        decode_doc_data::<SetPerformanceMetricsRequest>(body).map_err(|e| e.to_string())?;

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for SetPerformanceMetricsRequestEntry {
        key,
        performance_metric,
    } in performance_metrics.performance_metrics
    {
        let key_domain = key.into_domain();

        let result = assert_and_insert_performance_metric(
            key_domain.clone(),
            SetPerformanceMetricPayload::convert_to_setter(
                performance_metric,
                &performance_metrics.satellite_id,
            )
            .map_err(|e| e.to_string())?,
        );

        match result {
            Ok(_) => {}
            Err(err) => errors.push((key_domain, err)),
        }
    }

    if !errors.is_empty() {
        let error_string = errors
            .into_iter()
            .map(|(key, err)| format!("{}: {}", key.key, err))
            .collect::<Vec<_>>()
            .join(", ");

        return Err(error_string);
    }

    build_payload_response((), &performance_metrics.satellite_id)
}

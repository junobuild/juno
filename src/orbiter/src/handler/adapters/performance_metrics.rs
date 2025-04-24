use crate::events::helpers::assert_and_insert_performance_metric;
use crate::state::types::state::AnalyticKey;
use crate::types::interface::http::{
    PerformanceMetricPayload, SetPerformanceMetricRequest, SetPerformanceMetricsRequest,
};
use ic_http_certification::HttpRequest;
use junobuild_utils::decode_doc_data;

pub fn handle_insert_performance_metric(
    request: &HttpRequest,
) -> Result<PerformanceMetricPayload, String> {
    let SetPerformanceMetricRequest {
        key,
        performance_metric,
    }: SetPerformanceMetricRequest = decode_doc_data::<SetPerformanceMetricRequest>(request.body())
        .map_err(|e| e.to_string())?;

    let inserted_performance_metric =
        assert_and_insert_performance_metric(key.into_domain(), performance_metric.into_domain())?;

    Ok(PerformanceMetricPayload::from_domain(
        inserted_performance_metric,
    ))
}

pub fn handle_insert_performance_metrics(request: &HttpRequest) -> Result<(), String> {
    let performance_metrics: SetPerformanceMetricsRequest =
        decode_doc_data::<SetPerformanceMetricsRequest>(request.body())
            .map_err(|e| e.to_string())?;

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for SetPerformanceMetricRequest {
        key,
        performance_metric,
    } in performance_metrics
    {
        let key_domain = key.into_domain();

        let result = assert_and_insert_performance_metric(
            key_domain.clone(),
            performance_metric.into_domain(),
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

    Ok(())
}

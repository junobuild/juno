use crate::analytics::analytics_performance_metrics_web_vitals;
use crate::events::helpers::assert_and_insert_performance_metric;
use crate::events::store::get_performance_metrics as get_performance_metrics_store;
use crate::guards::caller_is_controller;
use crate::state::types::state::{AnalyticKey, PerformanceMetric};
use crate::types::interface::{
    AnalyticsWebVitalsPerformanceMetrics, GetAnalytics, SetPerformanceMetric,
};
use ic_cdk_macros::{query, update};

#[update(guard = "caller_is_controller")]
fn set_performance_metric(
    key: AnalyticKey,
    performance_metric: SetPerformanceMetric,
) -> Result<PerformanceMetric, String> {
    assert_and_insert_performance_metric(key, performance_metric)
}

#[update(guard = "caller_is_controller")]
fn set_performance_metrics(
    performance_metrics: Vec<(AnalyticKey, SetPerformanceMetric)>,
) -> Result<(), Vec<(AnalyticKey, String)>> {
    fn insert(key: AnalyticKey, performance_metric: SetPerformanceMetric) -> Result<(), String> {
        assert_and_insert_performance_metric(key, performance_metric)?;

        Ok(())
    }

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for (key, performance_metric) in performance_metrics {
        let result = insert(key.clone(), performance_metric);

        match result {
            Ok(_) => {}
            Err(err) => errors.push((key, err)),
        }
    }

    if !errors.is_empty() {
        return Err(errors);
    }

    Ok(())
}

#[query(guard = "caller_is_controller")]
fn get_performance_metrics(filter: GetAnalytics) -> Vec<(AnalyticKey, PerformanceMetric)> {
    get_performance_metrics_store(&filter)
}

#[query(guard = "caller_is_controller")]
fn get_performance_metrics_analytics_web_vitals(
    filter: GetAnalytics,
) -> AnalyticsWebVitalsPerformanceMetrics {
    let metrics = get_performance_metrics_store(&filter);
    analytics_performance_metrics_web_vitals(&metrics)
}

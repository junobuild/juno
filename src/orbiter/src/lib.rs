mod analytics;
mod assert;
mod config;
mod constants;
mod controllers;
mod events;
mod guards;
mod handler;
mod http;
mod msg;
mod serializers;
mod state;
mod types;

use crate::analytics::{
    analytics_page_views_clients, analytics_page_views_metrics, analytics_page_views_top_10,
    analytics_performance_metrics_web_vitals, analytics_track_events,
};
use crate::assert::config::{
    assert_page_views_enabled, assert_performance_metrics_enabled, assert_track_events_enabled,
};
use crate::config::store::{
    del_satellite_config as del_satellite_config_store, get_satellite_configs,
    set_satellite_config as set_satellite_config_store,
};
use crate::controllers::store::{
    delete_controllers as delete_controllers_store, get_admin_controllers, get_controllers,
    set_controllers as set_controllers_store,
};
use crate::events::helpers::assert_and_insert_page_view;
use crate::events::store::insert_page_view;
use crate::guards::{caller_is_admin_controller, caller_is_controller};
use crate::handler::orbiter::OrbiterHttpRequestHandler;
use crate::http::requests::{on_http_request, on_http_request_update};
use crate::http::upgrade::defer_init_certified_responses;
use crate::types::interface::{
    AnalyticsClientsPageViews, AnalyticsMetricsPageViews, AnalyticsTop10PageViews,
    AnalyticsTrackEvents, AnalyticsWebVitalsPerformanceMetrics, DelSatelliteConfig, GetAnalytics,
    SetPageView, SetPerformanceMetric, SetSatelliteConfig, SetTrackEvent,
};
use ciborium::{from_reader, into_writer};
use events::store::{
    get_page_views as get_page_views_store,
    get_performance_metrics as get_performance_metrics_store, get_satellite_config,
    get_track_events as get_track_events_store, insert_performance_metric, insert_track_event,
};
use ic_cdk::api::call::{arg_data, ArgDecoderConfig};
use ic_cdk::trap;
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_http_certification::{HttpRequest, HttpResponse};
use junobuild_shared::canister::memory_size as canister_memory_size;
use junobuild_shared::constants_shared::MAX_NUMBER_OF_SATELLITE_CONTROLLERS;
use junobuild_shared::controllers::{
    assert_controllers, assert_max_number_of_controllers, init_controllers,
};
use junobuild_shared::mgmt::ic::deposit_cycles as deposit_cycles_shared;
use junobuild_shared::types::interface::{
    DeleteControllersArgs, DepositCyclesArgs, MemorySize, SegmentArgs, SetControllersArgs,
};
use junobuild_shared::types::memory::Memory;
use junobuild_shared::types::state::{ControllerScope, Controllers, SatelliteId};
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};
use state::memory::{get_memory_upgrades, init_stable_state, STATE};
use state::types::state::{
    AnalyticKey, HeapState, PageView, PerformanceMetric, SatelliteConfigs, State, TrackEvent,
};

#[init]
fn init() {
    let call_arg = arg_data::<(Option<SegmentArgs>,)>(ArgDecoderConfig::default()).0;
    let SegmentArgs { controllers } = call_arg.unwrap();

    let heap = HeapState {
        controllers: init_controllers(&controllers),
        ..HeapState::default()
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: init_stable_state(),
            heap,
            ..State::default()
        };
    });

    defer_init_certified_responses();
}

#[pre_upgrade]
fn pre_upgrade() {
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the orbiter in pre_upgrade hook.");

    write_pre_upgrade(&state_bytes, &mut get_memory_upgrades());
}

#[post_upgrade]
fn post_upgrade() {
    let memory: Memory = get_memory_upgrades();
    let state_bytes = read_post_upgrade(&memory);

    let state: State = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the orbiter in post_upgrade hook.");

    STATE.with(|s| *s.borrow_mut() = state);

    defer_init_certified_responses();
}

/// HTTP

#[query]
fn http_request(request: HttpRequest) -> HttpResponse<'static> {
    let handler = OrbiterHttpRequestHandler;
    on_http_request(&request, &handler)
}

#[update]
fn http_request_update(request: HttpRequest) -> HttpResponse<'static> {
    let handler = OrbiterHttpRequestHandler;
    on_http_request_update(&request, &handler)
}

/// Page views

#[deprecated(since = "0.1.0", note = "prefer HTTP POST request")]
#[update]
fn set_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    assert_and_insert_page_view(key, page_view)
}

#[deprecated(since = "0.1.0", note = "prefer HTTP POST request")]
#[update]
fn set_page_views(
    page_views: Vec<(AnalyticKey, SetPageView)>,
) -> Result<(), Vec<(AnalyticKey, String)>> {
    fn insert(key: AnalyticKey, page_view: SetPageView) -> Result<(), String> {
        assert_page_views_enabled(&get_satellite_config(&page_view.satellite_id))?;
        insert_page_view(key, page_view)?;

        Ok(())
    }

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for (key, page_view) in page_views {
        let result = insert(key.clone(), page_view);

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
fn get_page_views(filter: GetAnalytics) -> Vec<(AnalyticKey, PageView)> {
    get_page_views_store(&filter)
}

#[query(guard = "caller_is_controller")]
fn get_page_views_analytics_metrics(filter: GetAnalytics) -> AnalyticsMetricsPageViews {
    let page_views = get_page_views_store(&filter);
    analytics_page_views_metrics(&page_views)
}

#[query(guard = "caller_is_controller")]
fn get_page_views_analytics_top_10(filter: GetAnalytics) -> AnalyticsTop10PageViews {
    let page_views = get_page_views_store(&filter);
    analytics_page_views_top_10(&page_views)
}

#[query(guard = "caller_is_controller")]
fn get_page_views_analytics_clients(filter: GetAnalytics) -> AnalyticsClientsPageViews {
    let page_views = get_page_views_store(&filter);
    analytics_page_views_clients(&page_views)
}

/// Track events

#[deprecated(since = "0.1.0", note = "prefer HTTP POST request")]
#[update]
fn set_track_event(key: AnalyticKey, track_event: SetTrackEvent) -> Result<TrackEvent, String> {
    assert_track_events_enabled(&get_satellite_config(&track_event.satellite_id))?;

    insert_track_event(key, track_event)
}

#[deprecated(since = "0.1.0", note = "prefer HTTP POST request")]
#[update]
fn set_track_events(
    track_events: Vec<(AnalyticKey, SetTrackEvent)>,
) -> Result<(), Vec<(AnalyticKey, String)>> {
    fn insert(key: AnalyticKey, track_event: SetTrackEvent) -> Result<(), String> {
        assert_track_events_enabled(&get_satellite_config(&track_event.satellite_id))?;
        insert_track_event(key, track_event)?;

        Ok(())
    }

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for (key, track_event) in track_events {
        let result = insert(key.clone(), track_event);

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
fn get_track_events(filter: GetAnalytics) -> Vec<(AnalyticKey, TrackEvent)> {
    get_track_events_store(&filter)
}

#[query(guard = "caller_is_controller")]
fn get_track_events_analytics(filter: GetAnalytics) -> AnalyticsTrackEvents {
    let track_events = get_track_events_store(&filter);
    analytics_track_events(&track_events)
}

/// Performance metrics

#[update]
fn set_performance_metric(
    key: AnalyticKey,
    performance_metric: SetPerformanceMetric,
) -> Result<PerformanceMetric, String> {
    assert_performance_metrics_enabled(&get_satellite_config(&performance_metric.satellite_id))?;

    insert_performance_metric(key, performance_metric)
}

#[update]
fn set_performance_metrics(
    performance_metrics: Vec<(AnalyticKey, SetPerformanceMetric)>,
) -> Result<(), Vec<(AnalyticKey, String)>> {
    fn insert(key: AnalyticKey, performance_metric: SetPerformanceMetric) -> Result<(), String> {
        assert_performance_metrics_enabled(&get_satellite_config(
            &performance_metric.satellite_id,
        ))?;
        insert_performance_metric(key, performance_metric)?;

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

///
/// Controllers
///

#[update(guard = "caller_is_admin_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) -> Controllers {
    match controller.scope {
        ControllerScope::Write => {}
        ControllerScope::Admin => {
            let max_controllers = assert_max_number_of_controllers(
                &get_admin_controllers(),
                &controllers,
                MAX_NUMBER_OF_SATELLITE_CONTROLLERS,
            );

            if let Err(err) = max_controllers {
                trap(&err)
            }
        }
    }

    assert_controllers(&controllers).unwrap_or_else(|e| trap(&e));

    set_controllers_store(&controllers, &controller);
    get_controllers()
}

#[update(guard = "caller_is_admin_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) -> Controllers {
    delete_controllers_store(&controllers);
    get_controllers()
}

#[query(guard = "caller_is_admin_controller")]
fn list_controllers() -> Controllers {
    get_controllers()
}

///
/// Origins
///

#[update(guard = "caller_is_admin_controller")]
fn set_satellite_configs(configs: Vec<(SatelliteId, SetSatelliteConfig)>) -> SatelliteConfigs {
    let mut results: SatelliteConfigs = SatelliteConfigs::new();

    for (satellite_id, config) in configs {
        let result =
            set_satellite_config_store(&satellite_id, &config).unwrap_or_else(|e| trap(&e));
        results.insert(satellite_id, result);
    }

    results
}

#[update(guard = "caller_is_admin_controller")]
fn del_satellite_config(satellite_id: SatelliteId, config: DelSatelliteConfig) {
    del_satellite_config_store(&satellite_id, &config).unwrap_or_else(|e| trap(&e))
}

#[query(guard = "caller_is_admin_controller")]
fn list_satellite_configs() -> SatelliteConfigs {
    get_satellite_configs()
}

/// Mgmt

#[update(guard = "caller_is_admin_controller")]
async fn deposit_cycles(args: DepositCyclesArgs) {
    deposit_cycles_shared(args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[query(guard = "caller_is_admin_controller")]
fn memory_size() -> MemorySize {
    canister_memory_size()
}

// Generate did files

export_candid!();

mod analytics;
mod assert;
mod config;
mod constants;
mod controllers;
mod filters;
mod guards;
mod impls;
mod memory;
mod msg;
mod serializers;
mod store;
mod types;

use crate::analytics::{
    analytics_page_views_clients, analytics_page_views_metrics, analytics_page_views_top_10,
    analytics_track_events,
};
use crate::assert::assert_enabled;
use crate::config::store::{
    del_satellite_config as del_satellite_config_store, get_satellite_configs,
    set_satellite_config as set_satellite_config_store,
};
use crate::controllers::store::{
    delete_controllers as delete_controllers_store, get_admin_controllers, get_controllers,
    set_controllers as set_controllers_store,
};
use crate::guards::{caller_is_admin_controller, caller_is_controller};
use crate::memory::{get_memory_upgrades, init_stable_state, STATE};
use crate::store::{
    get_page_views as get_page_views_store, get_track_events as get_track_events_store,
    insert_page_view, insert_track_event,
};
use crate::types::interface::{
    AnalyticsClientsPageViews, AnalyticsMetricsPageViews, AnalyticsTop10PageViews,
    AnalyticsTrackEvents, DelSatelliteConfig, GetAnalytics, SetPageView, SetSatelliteConfig,
    SetTrackEvent,
};
use crate::types::memory::Memory;
use crate::types::state::{AnalyticKey, HeapState, PageView, SatelliteConfigs, State, TrackEvent};
use ciborium::{from_reader, into_writer};
use ic_cdk::api::call::arg_data;
use ic_cdk::trap;
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_stable_structures::writer::Writer;
#[allow(unused)]
use ic_stable_structures::Memory as _;
use shared::canister::memory_size as canister_memory_size;
use shared::constants::MAX_NUMBER_OF_SATELLITE_CONTROLLERS;
use shared::controllers::{
    assert_max_number_of_controllers, assert_no_anonymous_controller, init_controllers,
};
use shared::ic::deposit_cycles as deposit_cycles_shared;
use shared::types::interface::{
    DeleteControllersArgs, DepositCyclesArgs, MemorySize, SegmentArgs, SetControllersArgs,
};
use shared::types::state::{ControllerScope, Controllers, SatelliteId};
use std::mem;

#[init]
fn init() {
    let call_arg = arg_data::<(Option<SegmentArgs>,)>().0;
    let SegmentArgs { controllers } = call_arg.unwrap();

    let heap = HeapState {
        controllers: init_controllers(&controllers),
        ..HeapState::default()
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: init_stable_state(),
            heap,
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    // Serialize the state using CBOR.
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the satellite in pre_upgrade hook.");

    // Write the length of the serialized bytes to memory, followed by the by the bytes themselves.
    let len = state_bytes.len() as u32;
    let mut memory = get_memory_upgrades();
    let mut writer = Writer::new(&mut memory, 0);
    writer.write(&len.to_le_bytes()).unwrap();
    writer.write(&state_bytes).unwrap()
}

#[post_upgrade]
fn post_upgrade() {
    let memory: Memory = get_memory_upgrades();

    // The memory offset is 4 bytes because that's the length we used in pre_upgrade to store the length of the memory data for the upgrade.
    // https://github.com/dfinity/stable-structures/issues/104
    const OFFSET: usize = mem::size_of::<u32>();

    // Read the length of the state bytes.
    let mut state_len_bytes = [0; OFFSET];
    memory.read(0, &mut state_len_bytes);
    let state_len = u32::from_le_bytes(state_len_bytes) as usize;

    // Read the bytes
    let mut state_bytes = vec![0; state_len];
    memory.read(u64::try_from(OFFSET).unwrap(), &mut state_bytes);

    // Deserialize and set the state.
    let state: State = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the satellite in post_upgrade hook.");

    STATE.with(|s| *s.borrow_mut() = state);
}

/// Data

#[update]
fn set_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    assert_enabled(&page_view.satellite_id)?;

    insert_page_view(key, page_view)
}

#[update]
fn set_page_views(
    page_views: Vec<(AnalyticKey, SetPageView)>,
) -> Result<(), Vec<(AnalyticKey, String)>> {
    fn insert(key: AnalyticKey, page_view: SetPageView) -> Result<(), String> {
        assert_enabled(&page_view.satellite_id)?;
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

#[update]
fn set_track_event(key: AnalyticKey, track_event: SetTrackEvent) -> Result<TrackEvent, String> {
    assert_enabled(&track_event.satellite_id)?;

    insert_track_event(key, track_event)
}

#[update]
fn set_track_events(
    track_events: Vec<(AnalyticKey, SetTrackEvent)>,
) -> Result<(), Vec<(AnalyticKey, String)>> {
    fn insert(key: AnalyticKey, track_event: SetTrackEvent) -> Result<(), String> {
        assert_enabled(&track_event.satellite_id)?;
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

    assert_no_anonymous_controller(&controllers).unwrap_or_else(|e| trap(&e));

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

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[query(guard = "caller_is_admin_controller")]
fn memory_size() -> MemorySize {
    canister_memory_size()
}

// Generate did files

export_candid!();

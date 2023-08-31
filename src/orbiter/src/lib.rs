mod assert;
mod config;
mod constants;
mod controllers;
mod guards;
mod impls;
mod memory;
mod msg;
mod serializers;
mod store;
mod types;

use crate::assert::assert_caller_is_authorized;
use crate::config::store::{
    del_origin_config as del_origin_config_store, get_origin_configs as get_origin_configs_store,
    set_origin_config as set_origin_config_store,
};
use crate::controllers::store::{
    delete_controllers as delete_controllers_store, get_admin_controllers, get_controllers,
    set_controllers as set_controllers_store,
};
use crate::guards::caller_is_admin_controller;
use crate::memory::{get_memory_upgrades, init_stable_state, STATE};
use crate::store::{
    get_page_views as get_page_views_store, get_track_events as get_track_events_store,
    insert_page_view, insert_track_event,
};
use crate::types::interface::{
    DelOriginConfig, GetAnalytics, SetOriginConfig, SetPageView, SetTrackEvent,
};
use crate::types::memory::Memory;
use crate::types::state::{
    AnalyticKey, HeapState, OriginConfig, OriginConfigs, PageView, State, TrackEvent,
};
use ciborium::{from_reader, into_writer};
use ic_cdk::api::call::arg_data;
use ic_cdk::trap;
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_stable_structures::writer::Writer;
#[allow(unused)]
use ic_stable_structures::Memory as _;
use shared::constants::MAX_NUMBER_OF_SATELLITE_CONTROLLERS;
use shared::controllers::{assert_max_number_of_controllers, init_controllers};
use shared::types::interface::{DeleteControllersArgs, SegmentArgs, SetControllersArgs};
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
    let state = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the satellite in post_upgrade hook.");
    STATE.with(|s| *s.borrow_mut() = state);
}

/// Data

#[update]
fn set_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    assert_caller_is_authorized(&key.satellite_id)?;

    let result = insert_page_view(key, page_view);

    match result {
        Ok(new_page_view) => Ok(new_page_view),
        Err(error) => trap(&error),
    }
}

#[update]
fn set_page_views(page_views: Vec<(AnalyticKey, SetPageView)>) -> Result<(), String> {
    for (key, page_view) in page_views {
        assert_caller_is_authorized(&key.satellite_id)?;

        insert_page_view(key, page_view).unwrap_or_else(|e| trap(&e));
    }

    Ok(())
}

#[query(guard = "caller_is_admin_controller")]
fn get_page_views(filter: GetAnalytics) -> Vec<(AnalyticKey, PageView)> {
    get_page_views_store(&filter)
}

#[update]
fn set_track_event(key: AnalyticKey, track_event: SetTrackEvent) -> Result<TrackEvent, String> {
    assert_caller_is_authorized(&key.satellite_id)?;

    let result = insert_track_event(key, track_event);

    match result {
        Ok(new_track_event) => Ok(new_track_event),
        Err(error) => trap(&error),
    }
}

#[update]
fn set_track_events(track_events: Vec<(AnalyticKey, SetTrackEvent)>) -> Result<(), String> {
    for (key, track_event) in track_events {
        assert_caller_is_authorized(&key.satellite_id)?;

        insert_track_event(key, track_event).unwrap_or_else(|e| trap(&e));
    }

    Ok(())
}

#[query(guard = "caller_is_admin_controller")]
fn get_track_events(filter: GetAnalytics) -> Vec<(AnalyticKey, TrackEvent)> {
    get_track_events_store(&filter)
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
fn set_origin_config(satellite_id: SatelliteId, config: SetOriginConfig) -> OriginConfig {
    set_origin_config_store(&satellite_id, &config).unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_admin_controller")]
fn del_origin_config(satellite_id: SatelliteId, config: DelOriginConfig) {
    del_origin_config_store(&satellite_id, &config).unwrap_or_else(|e| trap(&e))
}

#[query(guard = "caller_is_admin_controller")]
fn list_origin_configs() -> OriginConfigs {
    get_origin_configs_store()
}

/// Mgmt

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// Generate did files

export_candid!();

use crate::hooks::lifecycle::{
    invoke_on_init, invoke_on_init_sync, invoke_on_post_upgrade, invoke_on_post_upgrade_sync,
};
use crate::memory::internal::{get_memory_for_upgrade, init_stable_state, STATE};
use crate::memory::utils::init_storage_heap_state;
use crate::random::init::defer_init_random_seed;
use crate::storage::certified_assets::upgrade::defer_init_certified_assets;
use crate::types::state::{HeapState, RuntimeState, State};
use ciborium::{from_reader, into_writer};
use ic_cdk::api::call::{arg_data, ArgDecoderConfig};
use junobuild_shared::controllers::init_controllers;
use junobuild_shared::types::interface::SegmentArgs;
use junobuild_shared::types::memory::Memory;
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};
use crate::memory::upgrade::init_juno_collection;

pub fn init() {
    let call_arg = arg_data::<(Option<SegmentArgs>,)>(ArgDecoderConfig::default()).0;
    let SegmentArgs { controllers } = call_arg.unwrap();

    let heap = HeapState {
        controllers: init_controllers(&controllers),
        storage: init_storage_heap_state(),
        ..HeapState::default()
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: init_stable_state(),
            heap,
            runtime: RuntimeState::default(),
        };
    });

    invoke_on_init_sync();

    invoke_on_init();
}

pub fn pre_upgrade() {
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the satellite in pre_upgrade hook.");

    write_pre_upgrade(&state_bytes, &mut get_memory_for_upgrade());
}

pub fn post_upgrade() {
    let memory: Memory = get_memory_for_upgrade();
    let state_bytes = read_post_upgrade(&memory);

    let state = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the satellite in post_upgrade hook.");
    STATE.with(|s| *s.borrow_mut() = state);

    // TODO: To be removed
    init_juno_collection();

    defer_init_certified_assets();
    defer_init_random_seed();

    invoke_on_post_upgrade_sync();

    invoke_on_post_upgrade();
}

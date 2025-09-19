use crate::assets::storage::certified_assets::upgrade::defer_init_certified_assets;
use crate::hooks::lifecycle::{
    invoke_on_init, invoke_on_init_sync, invoke_on_post_upgrade, invoke_on_post_upgrade_sync,
};
use crate::memory::internal::{get_memory_for_upgrade, init_stable_state, STATE};
use crate::memory::utils::init_storage_heap_state;
use crate::random::init::defer_init_random_seed;
use crate::types::state::{HeapState, RuntimeState, State};
use ciborium::{from_reader, into_writer};
use junobuild_shared::controllers::init_admin_controllers;
use junobuild_shared::types::interface::InitSatelliteArgs;
use junobuild_shared::types::memory::Memory;
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};

pub fn init(args: InitSatelliteArgs) {
    let InitSatelliteArgs {
        controllers,
        storage,
    } = args;

    let heap = HeapState {
        controllers: init_admin_controllers(&controllers),
        storage: init_storage_heap_state(&storage),
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

    defer_init_certified_assets();
    defer_init_random_seed();

    invoke_on_post_upgrade_sync();

    invoke_on_post_upgrade();
}

use crate::cdn::certified_assets::upgrade::defer_init_certified_assets;
use crate::cdn::lifecycle::init_cdn_storage_heap_state;
use crate::memory::manager::{get_memory_upgrades, init_stable_state, STATE};
use crate::types::state::{Fees, HeapState, Rates, ReleasesMetadata, State};
use ciborium::{from_reader, into_writer};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use junobuild_shared::controllers::init_admin_controllers;
use junobuild_shared::ic::api::caller;
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};
use std::collections::HashMap;

#[init]
fn init() {
    let manager = caller();

    let heap: HeapState = HeapState {
        mission_controls: HashMap::new(),
        payments: HashMap::new(),
        invitation_codes: HashMap::new(),
        controllers: init_admin_controllers(&[manager]),
        rates: Rates::default(),
        fees: Fees::default(),
        storage: init_cdn_storage_heap_state(),
        releases_metadata: ReleasesMetadata::default(),
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap,
            stable: init_stable_state(),
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the console in pre_upgrade hook.");

    write_pre_upgrade(&state_bytes, &mut get_memory_upgrades());
}

#[post_upgrade]
fn post_upgrade() {
    let memory = get_memory_upgrades();
    let state_bytes = read_post_upgrade(&memory);

    let state: State = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the console in post_upgrade hook.");

    STATE.with(|s| *s.borrow_mut() = state);

    defer_init_certified_assets();
}

use crate::http::upgrade::defer_init_certified_responses;
use crate::state::memory::manager::{get_memory_upgrades, init_stable_state, STATE};
use crate::state::types::state::{HeapState, State};
use ciborium::{from_reader, into_writer};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use junobuild_shared::controllers::init_admin_controllers;
use junobuild_shared::types::interface::SegmentArgs;
use junobuild_shared::types::memory::Memory;
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};

#[init]
fn init(args: SegmentArgs) {
    let SegmentArgs { controllers } = args;

    let heap = HeapState {
        controllers: init_admin_controllers(&controllers),
        ..HeapState::default()
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: init_stable_state(),
            heap,
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

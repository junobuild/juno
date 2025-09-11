use crate::memory::manager::{get_memory_upgrades, init_runtime_state, init_stable_state, STATE};
use crate::random::defer_init_random_seed;
use crate::types::state::{HeapState, State};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use junobuild_shared::controllers::init_admin_controllers;
use junobuild_shared::ic::api::caller;
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};

#[init]
fn init() {
    let manager = caller();

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap: HeapState {
                controllers: init_admin_controllers(&[manager]),
                env: None,
            },
            stable: init_stable_state(),
        };
    });

    init_runtime_state();

    defer_init_random_seed();
}

#[pre_upgrade]
fn pre_upgrade() {
    STATE.with(|s| {
        write_pre_upgrade(&*s.borrow(), &mut get_memory_upgrades())
            .expect("Failed to encode the state of the mission control in pre_upgrade hook.");
    });
}

#[post_upgrade]
fn post_upgrade() {
    let memory = get_memory_upgrades();
    let state = read_post_upgrade(&memory)
        .expect("Failed to decode the state of the observatory in post_upgrade hook.");

    STATE.with(|s| *s.borrow_mut() = state);

    init_runtime_state();

    defer_init_random_seed();
}

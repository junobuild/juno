use crate::memory::manager::{get_memory_upgrades, init_runtime_state, init_stable_state, STATE};
use crate::monitoring::monitor::defer_restart_monitoring;
use crate::random::defer_init_random_seed;
use crate::types::state::{HeapState, State};
use ciborium::{from_reader, into_writer};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use junobuild_shared::types::interface::InitMissionControlArgs;
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};

#[init]
fn init(args: InitMissionControlArgs) {
    let user = args.user;

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap: HeapState::from(&user),
            stable: init_stable_state(),
        };
    });

    init_runtime_state();

    defer_init_random_seed();
}

#[pre_upgrade]
fn pre_upgrade() {
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the mission control in pre_upgrade hook.");

    write_pre_upgrade(&state_bytes, &mut get_memory_upgrades());
}

#[post_upgrade]
fn post_upgrade() {
    let memory = get_memory_upgrades();
    let state_bytes = read_post_upgrade(&memory);

    let state: State = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the mission control in post_upgrade hook.");

    STATE.with(|s| *s.borrow_mut() = state);

    init_runtime_state();

    defer_init_random_seed();

    defer_restart_monitoring();
}

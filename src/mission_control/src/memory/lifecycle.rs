use crate::memory::manager::{get_memory_upgrades, init_runtime_state, init_stable_state, STATE};
use crate::monitoring::monitor::defer_restart_monitoring;
use crate::random::defer_init_random_seed;
use crate::types::state::{HeapState, State};
use crate::upgrade::types::upgrade::UpgradeState;
use ciborium::{from_reader, into_writer};
use ic_cdk::api::call::{arg_data, ArgDecoderConfig};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use junobuild_shared::types::interface::MissionControlArgs;
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};

#[init]
fn init() {
    let call_arg = arg_data::<(Option<MissionControlArgs>,)>(ArgDecoderConfig::default()).0;
    let user = call_arg.unwrap().user;

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

    // TODO: replace UpgradeState by State after release
    let state: UpgradeState = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the mission control in post_upgrade hook.");

    STATE.with(|s| {
        *s.borrow_mut() = State {
            stable: state.stable,
            heap: HeapState::from(&state.heap),
        }
    });

    init_runtime_state();

    defer_init_random_seed();

    defer_restart_monitoring();
}

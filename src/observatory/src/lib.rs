mod console;
mod guards;
mod impls;
mod memory;
mod store;
mod types;
mod upgrade;

use crate::guards::{caller_is_admin_controller, caller_is_not_anonymous};
use crate::memory::{get_memory_upgrades, init_stable_state, STATE};
use crate::store::heap::{delete_controllers, set_controllers as set_controllers_store};
use crate::types::state::{HeapState, State};
use crate::upgrade::types::upgrade::UpgradeStableState;
use ciborium::into_writer;
use ic_cdk::{caller, storage, trap};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use junobuild_shared::controllers::init_controllers;
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use junobuild_shared::upgrade::write_pre_upgrade;
use crate::console::assert_mission_control_center;
use crate::store::stable::insert_notification;
use crate::types::interface::NotifyArgs;

#[init]
fn init() {
    let manager = caller();

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap: HeapState {
                controllers: init_controllers(&[manager]),
            },
            stable: init_stable_state(),
        };
    });
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
    // TODO: remove once stable memory introduced on mainnet
    let (upgrade_stable,): (UpgradeStableState,) = storage::stable_restore().unwrap();

    let heap = HeapState::from(&upgrade_stable);

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap,
            stable: init_stable_state(),
        }
    });

    // TODO: uncomment once stable memory introduced on mainnet
    // let memory: Memory = get_memory_upgrades();
    // let state_bytes = read_post_upgrade(&memory);

    // let state: State = from_reader(&*state_bytes)
    //     .expect("Failed to decode the state of the observatory in post_upgrade hook.");

    // STATE.with(|s| *s.borrow_mut() = state);
}

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) {
    set_controllers_store(&controllers, &controller);
}

#[update(guard = "caller_is_admin_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) {
    delete_controllers(&controllers);
}

// ---------------------------------------------------------
// Notifications
// ---------------------------------------------------------

#[update(guard = "caller_is_not_anonymous")]
async fn notify(notify_args: NotifyArgs) {
    let mission_control_id = caller();

    assert_mission_control_center(&notify_args.user, &mission_control_id)
        .await
        .unwrap_or_else(|e| trap(&e));

    insert_notification(&notify_args.notification);

    // TODO: send. Probably with a timer.
}

// ---------------------------------------------------------
// Mgmt
// ---------------------------------------------------------

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// Generate did files

export_candid!();

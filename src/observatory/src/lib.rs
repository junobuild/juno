mod console;
mod guards;
mod http;
mod impls;
mod memory;
mod notify;
mod random;
mod store;
mod templates;
mod types;

use crate::console::assert_mission_control_center;
use crate::guards::{caller_is_admin_controller, caller_is_not_anonymous};
use crate::http::response::transform_response;
use crate::memory::{get_memory_upgrades, init_runtime_state, init_stable_state, STATE};
use crate::notify::store_and_defer_notification;
use crate::random::defer_init_random_seed;
use crate::store::heap::{
    delete_controllers, get_controllers, set_controllers as set_controllers_store,
    set_env as set_env_store,
};
use crate::store::stable::get_notifications;
use crate::types::interface::{GetNotifications, NotifyStatus};
use crate::types::state::{Env, HeapState, State};
use ciborium::{from_reader, into_writer};
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};
use ic_cdk::{caller, trap};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use junobuild_shared::controllers::init_controllers;
use junobuild_shared::types::interface::{DeleteControllersArgs, NotifyArgs, SetControllersArgs};
use junobuild_shared::types::state::Controllers;
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};

#[init]
fn init() {
    let manager = caller();

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap: HeapState {
                controllers: init_controllers(&[manager]),
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
        .expect("Failed to decode the state of the observatory in post_upgrade hook.");

    STATE.with(|s| *s.borrow_mut() = state);

    init_runtime_state();

    defer_init_random_seed();
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

#[query(guard = "caller_is_admin_controller")]
fn list_controllers() -> Controllers {
    get_controllers()
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

    store_and_defer_notification(&notify_args);
}

#[query(guard = "caller_is_admin_controller")]
fn get_notify_status(filter: GetNotifications) -> NotifyStatus {
    let notifications = get_notifications(&filter);

    NotifyStatus::from_notifications(&notifications)
}

#[update(guard = "caller_is_admin_controller")]
fn ping(notify_args: NotifyArgs) {
    store_and_defer_notification(&notify_args);
}

// ---------------------------------------------------------
// HTTP Outcalls
// ---------------------------------------------------------

#[query(hidden = true)]
fn transform(raw: TransformArgs) -> HttpResponse {
    transform_response(raw)
}

// ---------------------------------------------------------
// Mgmt
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
fn set_env(env: Env) {
    set_env_store(&env);
}

// Generate did files

export_candid!();

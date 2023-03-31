mod guards;
mod store;
mod types;

use crate::guards::caller_is_console;
use crate::store::set_mission_control as set_mission_control_store;
use crate::types::state::{StableState, State};
use candid::{candid_method, export_service};
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk::trap;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use shared::types::interface::ObservatoryAddMissionControlArgs;
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
}

#[init]
fn init() {
    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: StableState {
                mission_controls: HashMap::new(),
            },
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state| stable_save((&state.borrow().stable,)).unwrap());
}

#[post_upgrade]
fn post_upgrade() {
    let (stable,): (StableState,) = stable_restore().unwrap();

    STATE.with(|state| *state.borrow_mut() = State { stable });
}

/// MissionControls

#[candid_method(update)]
#[update(guard = "caller_is_console")]
pub fn set_mission_control(
    ObservatoryAddMissionControlArgs {
        owner,
        mission_control_id,
    }: ObservatoryAddMissionControlArgs,
) {
    set_mission_control_store(&mission_control_id, &owner).unwrap_or_else(|e| trap(e));
}

/// Mgmt

#[candid_method(query)]
#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

///
/// Generate did files
///

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    export_service!();
    __export_service()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn save_candid() {
        use std::env;
        use std::fs::write;
        use std::path::PathBuf;

        let dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let dir = dir
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("src")
            .join("observatory");
        write(dir.join("observatory.did"), export_candid()).expect("Write failed.");
    }
}

mod cron;
mod guards;
mod store;
mod types;

use crate::cron::run_timer;
use crate::guards::caller_is_console;
use crate::store::{add_mission_control as add_mission_control_store, get_transactions};
use crate::types::state::{Cron, StableState, State};
use candid::{candid_method, export_service};
use ic_cdk::{spawn, storage};
use ic_cdk_macros::{heartbeat, init, post_upgrade, pre_upgrade, query, update};
use shared::types::interface::{ListTransactionsArgs, ObservatoryAddMissionControlArgs};
use shared::types::ledger::Transactions;
use shared::version::pkg_version;
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
                transactions: HashMap::new(),
                cron: Cron::default(),
            },
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state| storage::stable_save((&state.borrow().stable,)).unwrap());
}

#[post_upgrade]
fn post_upgrade() {
    let (stable,): (StableState,) = storage::stable_restore().unwrap();

    STATE.with(|state| *state.borrow_mut() = State { stable });
}

/// Transactions

#[candid_method(query)]
#[query]
fn list_transactions(
    ListTransactionsArgs { account_identifier }: ListTransactionsArgs,
) -> Transactions {
    get_transactions(&account_identifier)
}

/// MissionControls

#[candid_method(update)]
#[update(guard = "caller_is_console")]
pub fn add_mission_control(
    ObservatoryAddMissionControlArgs {
        owner,
        mission_control_id,
    }: ObservatoryAddMissionControlArgs,
) {
    add_mission_control_store(&mission_control_id, &owner);
}

/// Cron

/// https://github.com/dfinity/ic/blob/master/rs/rosetta-api/icrc1/index/src/lib.rs

#[heartbeat]
fn global_timer() {
    let future = run_timer();
    spawn(future);
}

/// Mgmt

#[candid_method(query)]
#[query]
fn version() -> String {
    pkg_version()
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

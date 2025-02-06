use crate::constants_internal::WASM_MEMORY_LIMIT;
use crate::constants_shared::CREATE_CANISTER_CYCLES;
use candid::{Nat, Principal};
use ic_cdk::api::management_canister::main::CanisterSettings;

pub fn create_canister_settings(controllers: Vec<Principal>) -> Option<CanisterSettings> {
    Some(CanisterSettings {
        controllers: Some(controllers.clone()),
        compute_allocation: None,
        memory_allocation: None,
        freezing_threshold: None,
        reserved_cycles_limit: None,
        log_visibility: None,
        wasm_memory_limit: Some(Nat::from(WASM_MEMORY_LIMIT)),
    })
}

pub fn create_canister_cycles(cycles: u128) -> u128 {
    CREATE_CANISTER_CYCLES + cycles
}

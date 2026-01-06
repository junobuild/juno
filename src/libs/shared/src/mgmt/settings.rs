use crate::constants::internal::WASM_MEMORY_LIMIT;
use crate::constants::shared::CREATE_RAW_CANISTER_CYCLES;
use crate::mgmt::types::ic::CreateCanisterInitSettingsArg;
use candid::Nat;
use ic_cdk::management_canister::CanisterSettings;

pub fn create_canister_settings(
    CreateCanisterInitSettingsArg {
        controllers,
        freezing_threshold,
    }: &CreateCanisterInitSettingsArg,
) -> Option<CanisterSettings> {
    Some(CanisterSettings {
        controllers: Some(controllers.clone()),
        compute_allocation: None,
        memory_allocation: None,
        freezing_threshold: Some(freezing_threshold.clone()),
        reserved_cycles_limit: None,
        log_visibility: None,
        wasm_memory_limit: Some(Nat::from(WASM_MEMORY_LIMIT)),
        wasm_memory_threshold: None,
        environment_variables: None,
    })
}

pub fn create_canister_cycles(cycles: u128) -> u128 {
    CREATE_RAW_CANISTER_CYCLES + cycles
}

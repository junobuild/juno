use crate::constants::{CREATE_CANISTER_CYCLES, WASM_MEMORY_LIMIT};
use crate::env::CMC;
use crate::factory::types::{CreateCanister, CreateCanisterResult};
use crate::ic::install_code;
use crate::types::ic::WasmArg;
use candid::{Nat, Principal};
use ic_cdk::api::call::{call_with_payment128, CallResult};
use ic_cdk::api::management_canister::main::{CanisterInstallMode, CanisterSettings};

/// Asynchronously creates a new canister and installs provided Wasm code with additional cycles.
///
/// # Arguments
/// - `controllers`: A list of `Principal` IDs to set as controllers of the new canister.
/// - `wasm_arg`: Wasm binary and arguments to install in the new canister (`WasmArg` struct).
/// - `cycles`: Additional cycles to deposit during canister creation on top of `CREATE_CANISTER_CYCLES`.
///
/// # Returns
/// - `Ok(Principal)`: On success, returns the `Principal` ID of the newly created canister.
/// - `Err(String)`: On failure, returns an error message.
pub async fn cmc_create_canister_install_code(
    controllers: Vec<Principal>,
    wasm_arg: &WasmArg,
    cycles: u128,
) -> Result<Principal, String> {
    let cmc = Principal::from_text(CMC).unwrap();

    let create_canister_arg = CreateCanister {
        subnet_type: None,
        subnet_selection: None,
        settings: Some(CanisterSettings {
            controllers: Some(controllers.clone()),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
            reserved_cycles_limit: None,
            log_visibility: None,
            wasm_memory_limit: Some(Nat::from(WASM_MEMORY_LIMIT)),
        }),
    };

    let result: CallResult<(CreateCanisterResult,)> = call_with_payment128(
        cmc,
        "create_canister",
        (create_canister_arg,),
        CREATE_CANISTER_CYCLES + cycles,
    )
    .await;

    match result {
        Err((_, message)) => Err(["Failed to call CMC to create canister.", &message].join(" - ")),
        Ok((result,)) => match result {
            Err(err) => Err(format!("Failed to create canister - {}", err)),
            Ok(canister_id) => {
                let install =
                    install_code(canister_id, wasm_arg, CanisterInstallMode::Install).await;

                match install {
                    Err(_) => Err("Failed to install code in canister.".to_string()),
                    Ok(_) => Ok(canister_id),
                }
            }
        },
    }
}

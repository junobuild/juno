use crate::errors::{
    JUNO_ERROR_CANISTER_CREATE_FAILED, JUNO_ERROR_CANISTER_INSTALL_CODE_FAILED,
    JUNO_ERROR_CYCLES_DEPOSIT_BALANCE_LOW, JUNO_ERROR_CYCLES_DEPOSIT_FAILED,
    JUNO_ERROR_SEGMENT_DELETE_FAILED, JUNO_ERROR_SEGMENT_STOP_FAILED,
};
use crate::mgmt::settings::{create_canister_cycles, create_canister_settings};
use crate::mgmt::types::ic::{CreateCanisterInitSettingsArg, WasmArg};
use crate::types::interface::DepositCyclesArgs;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::api::canister_balance128;
use ic_cdk::api::management_canister::main::{
    create_canister, delete_canister, deposit_cycles as ic_deposit_cycles,
    install_code as ic_install_code, stop_canister, update_settings, CanisterId, CanisterIdRecord,
    CanisterInstallMode, CanisterSettings, CreateCanisterArgument, InstallCodeArgument,
    UpdateSettingsArgument,
};

/// Asynchronously creates a new canister and installs provided Wasm code with additional cycles.
///
/// # Arguments
/// - `create_settings_arg`: The custom settings to apply to spinup the canister.
/// - `wasm_arg`: Wasm binary and arguments to install in the new canister (`WasmArg` struct).
/// - `cycles`: Additional cycles to deposit during canister creation on top of `CREATE_CANISTER_CYCLES`.
///
/// # Returns
/// - `Ok(Principal)`: On success, returns the `Principal` ID of the newly created canister.
/// - `Err(String)`: On failure, returns an error message.
pub async fn create_canister_install_code(
    create_settings_arg: &CreateCanisterInitSettingsArg,
    wasm_arg: &WasmArg,
    cycles: u128,
) -> Result<Principal, String> {
    let record = create_canister(
        CreateCanisterArgument {
            settings: create_canister_settings(create_settings_arg),
        },
        create_canister_cycles(cycles),
    )
    .await;

    match record {
        Err((_, message)) => Err(format!(
            "{} ({})",
            JUNO_ERROR_CANISTER_CREATE_FAILED, &message
        )),
        Ok(record) => {
            let canister_id = record.0.canister_id;

            let install = install_code(canister_id, wasm_arg, CanisterInstallMode::Install).await;

            match install {
                Err(_) => Err(JUNO_ERROR_CANISTER_INSTALL_CODE_FAILED.to_string()),
                Ok(_) => Ok(canister_id),
            }
        }
    }
}

/// Asynchronously installs code on a specified canister.
///
/// # Arguments
/// - `canister_id`: `Principal` ID of the target canister.
/// - `wasm_arg`: Contains the Wasm module and installation arguments.
/// - `mode`: Installation mode defined by `CanisterInstallMode`.
///
/// # Returns
/// - A `CallResult<()>` indicating success or failure.
pub async fn install_code(
    canister_id: Principal,
    WasmArg { wasm, install_arg }: &WasmArg,
    mode: CanisterInstallMode,
) -> CallResult<()> {
    let arg = InstallCodeArgument {
        mode,
        canister_id,
        wasm_module: wasm.clone(),
        arg: install_arg.clone(),
    };

    ic_install_code(arg).await
}

/// Asynchronously updates the controller list of a specified canister.
///
/// # Arguments
/// - `canister_id`: `Principal` ID of the target canister.
/// - `controllers`: New list of `Principal` IDs to set as controllers.
///
/// # Returns
/// - A `CallResult<()>` indicating success or failure.
pub async fn update_canister_controllers(
    canister_id: Principal,
    controllers: Vec<Principal>,
) -> CallResult<()> {
    // Not including a setting in the settings record means not changing that field.
    // In other words, setting wasm_memory_limit to None here means keeping the actual value of wasm_memory_limit.
    let arg = UpdateSettingsArgument {
        canister_id,
        settings: CanisterSettings {
            controllers: Some(controllers),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
            reserved_cycles_limit: None,
            log_visibility: None,
            wasm_memory_limit: None,
        },
    };

    update_settings(arg).await
}

/// Deposits cycles into a specified canister from the calling canister's balance.
///
/// # Arguments
/// - `args`: `DepositCyclesArgs` struct containing the destination canister ID and cycle amount.
///
/// # Returns
/// - `Ok(())`: On successful deposit.
/// - `Err(String)`: If the balance is insufficient or on failure to deposit.
pub async fn deposit_cycles(
    DepositCyclesArgs {
        destination_id,
        cycles,
    }: DepositCyclesArgs,
) -> Result<(), String> {
    let balance = canister_balance128();

    if balance < cycles {
        return Err(format!(
            "{} (balance {}, {} to deposit)",
            JUNO_ERROR_CYCLES_DEPOSIT_BALANCE_LOW, balance, cycles
        ));
    }

    let result = ic_deposit_cycles(
        CanisterIdRecord {
            canister_id: destination_id,
        },
        cycles,
    )
    .await;

    match result {
        Err((_, message)) => Err(format!(
            "{} ({})",
            JUNO_ERROR_CYCLES_DEPOSIT_FAILED, &message
        )),
        Ok(_) => Ok(()),
    }
}

/// Stops the execution of a specified segment (canister).
///
/// # Arguments
/// - `canister_id`: The `CanisterId` of the canister to stop.
///
/// # Returns
/// - `Ok(())`: If the canister is successfully stopped.
/// - `Err(String)`: On failure, returns an error message.
pub async fn stop_segment(canister_id: CanisterId) -> Result<(), String> {
    let result = stop_canister(CanisterIdRecord { canister_id }).await;

    match result {
        Err((_, message)) => Err(format!("{} ({})", JUNO_ERROR_SEGMENT_STOP_FAILED, &message)),
        Ok(_) => Ok(()),
    }
}

/// Deletes a specified segment (canister).
///
/// # Arguments
/// - `canister_id`: The `CanisterId` of the canister to delete.
///
/// # Returns
/// - `Ok(())`: If the canister is successfully deleted.
/// - `Err(String)`: On failure, returns an error message.
pub async fn delete_segment(canister_id: CanisterId) -> Result<(), String> {
    let result = delete_canister(CanisterIdRecord { canister_id }).await;

    match result {
        Err((_, message)) => Err(format!(
            "{} ({})",
            JUNO_ERROR_SEGMENT_DELETE_FAILED, &message
        )),
        Ok(_) => Ok(()),
    }
}

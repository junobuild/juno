use crate::constants::CREATE_CANISTER_CYCLES;
use crate::types::ic::WasmArg;
use crate::types::interface::DepositCyclesArgs;
use crate::types::state::{
    SegmentCanisterSettings, SegmentCanisterStatus, SegmentStatus, SegmentStatusResult,
};
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::api::management_canister::main::{
    canister_status as ic_canister_status, create_canister, delete_canister,
    deposit_cycles as ic_deposit_cycles, install_code as ic_install_code, stop_canister,
    update_settings, CanisterId, CanisterIdRecord, CanisterInstallMode, CanisterSettings,
    CreateCanisterArgument, InstallCodeArgument, UpdateSettingsArgument,
};
use ic_cdk::api::{canister_balance128, time};

pub async fn create_canister_install_code(
    controllers: Vec<Principal>,
    wasm_arg: &WasmArg,
    cycles: u128,
) -> Result<Principal, String> {
    let record = create_canister(
        CreateCanisterArgument {
            settings: Some(CanisterSettings {
                controllers: Some(controllers.clone()),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
            }),
        },
        CREATE_CANISTER_CYCLES + cycles,
    )
    .await;

    match record {
        Err((_, message)) => Err(["Failed to create canister.", &message].join(" - ")),
        Ok(record) => {
            let canister_id = record.0.canister_id;

            let install = install_code(canister_id, wasm_arg, CanisterInstallMode::Install).await;

            match install {
                Err(_) => Err("Failed to install code in canister.".to_string()),
                Ok(_) => Ok(canister_id),
            }
        }
    }
}

async fn install_code(
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

pub async fn update_canister_controllers(
    canister_id: Principal,
    controllers: Vec<Principal>,
) -> CallResult<()> {
    let arg = UpdateSettingsArgument {
        canister_id,
        settings: CanisterSettings {
            controllers: Some(controllers),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
            reserved_cycles_limit: None,
        },
    };

    update_settings(arg).await
}

pub async fn segment_status(canister_id: CanisterId) -> SegmentStatusResult {
    let status = ic_canister_status(CanisterIdRecord { canister_id }).await;

    match status {
        Ok((canister_status,)) => {
            let settings: SegmentCanisterSettings = SegmentCanisterSettings {
                controllers: canister_status.settings.controllers,
                compute_allocation: canister_status.settings.compute_allocation,
                memory_allocation: canister_status.settings.memory_allocation,
                freezing_threshold: canister_status.settings.freezing_threshold,
            };

            Ok(SegmentStatus {
                id: canister_id,
                metadata: None,
                status: SegmentCanisterStatus {
                    status: canister_status.status,
                    settings,
                    module_hash: canister_status.module_hash,
                    memory_size: canister_status.memory_size,
                    cycles: canister_status.cycles,
                    idle_cycles_burned_per_day: canister_status.idle_cycles_burned_per_day,
                },
                status_at: time(),
            })
        }
        Err((_, message)) => Err(["Failed to get canister status: ".to_string(), message].join("")),
    }
}

pub async fn deposit_cycles(
    DepositCyclesArgs {
        destination_id,
        cycles,
    }: DepositCyclesArgs,
) -> Result<(), String> {
    let balance = canister_balance128();

    if balance < cycles {
        return Err(format!(
            "Balance ({}) is lower than the amount of cycles {} to deposit.",
            balance, cycles
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
        Err((_, message)) => Err(["Deposit cycles failed.", &message].join(" - ")),
        Ok(_) => Ok(()),
    }
}

pub async fn stop_segment(canister_id: CanisterId) -> Result<(), String> {
    let result = stop_canister(CanisterIdRecord { canister_id }).await;

    match result {
        Err((_, message)) => Err(["Cannot stop segment.", &message].join(" - ")),
        Ok(_) => Ok(()),
    }
}

pub async fn delete_segment(canister_id: CanisterId) -> Result<(), String> {
    let result = delete_canister(CanisterIdRecord { canister_id }).await;

    match result {
        Err((_, message)) => Err(["Cannot delete segment.", &message].join(" - ")),
        Ok(_) => Ok(()),
    }
}

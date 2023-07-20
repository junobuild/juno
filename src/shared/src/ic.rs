use crate::constants::CREATE_CANISTER_CYCLES;
use crate::types::ic::WasmArg;
use crate::types::state::{SegmentStatus, SegmentStatusResult};
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::api::management_canister::main::{
    canister_status as ic_canister_status, create_canister, install_code as ic_install_code,
    update_settings, CanisterId, CanisterIdRecord, CanisterInstallMode, CanisterSettings,
    CreateCanisterArgument, InstallCodeArgument, UpdateSettingsArgument,
};
use ic_cdk::api::time;

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
        },
    };

    update_settings(arg).await
}

pub async fn segment_status(canister_id: CanisterId) -> SegmentStatusResult {
    let status = ic_canister_status(CanisterIdRecord { canister_id }).await;

    match status {
        Ok((status,)) => Ok(SegmentStatus {
            id: canister_id,
            metadata: None,
            status,
            status_at: time(),
        }),
        Err((_, message)) => Err(["Failed to get canister status: ".to_string(), message].join("")),
    }
}

use crate::constants::{
    CREATE_CANISTER_CYCLES, IC_TRANSACTION_FEE_ICP, MEMO_CANISTER_TOP_UP, WASM_MEMORY_LIMIT,
};
use crate::env::CMC;
use crate::ledger::icp::transfer_payment;
use crate::mgmt::ic::install_code;
use crate::mgmt::types::cmc::{
    CreateCanister, CreateCanisterResult, Cycles, NotifyError, SubnetId, SubnetSelection,
    TopUpCanisterArgs,
};
use crate::mgmt::types::ic::WasmArg;
use candid::{Nat, Principal};
use ic_cdk::api::call::{call_with_payment128, CallResult};
use ic_cdk::api::management_canister::main::{CanisterId, CanisterInstallMode, CanisterSettings};
use ic_cdk::call;
use ic_ledger_types::{Subaccount, Tokens};

pub async fn top_up_canister(canister_id: &CanisterId, amount: &Tokens) -> Result<(), String> {
    // We need to hold back 1 transaction fee for the 'send' and also 1 for the 'notify'
    let send_amount = Tokens::from_e8s(amount.e8s() - (2 * IC_TRANSACTION_FEE_ICP.e8s()));

    let cmc = Principal::from_text(CMC).unwrap();

    let to_sub_account: Subaccount = convert_principal_to_sub_account(canister_id.as_slice());

    let block_index = transfer_payment(
        &cmc,
        &to_sub_account,
        MEMO_CANISTER_TOP_UP,
        send_amount,
        IC_TRANSACTION_FEE_ICP,
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .map_err(|e| format!("ledger transfer error {:?}", e))?;

    let args = TopUpCanisterArgs {
        block_index,
        canister_id: *canister_id,
    };

    let result: CallResult<(Result<Cycles, NotifyError>,)> =
        call(cmc, "notify_top_up", (args,)).await;

    match result {
        Err((_, message)) => {
            // If the topup fails in the Cmc canister, it refunds the caller.
            // let was_refunded = matches!(error, NotifyError::Refunded { .. });
            Err(["Top-up failed.", &message].join(" - "))
        }
        Ok(_) => Ok(()),
    }
}

fn convert_principal_to_sub_account(principal_id: &[u8]) -> Subaccount {
    let mut bytes = [0u8; 32];
    bytes[0] = principal_id.len().try_into().unwrap();
    bytes[1..1 + principal_id.len()].copy_from_slice(principal_id);
    Subaccount(bytes)
}

/// Asynchronously creates a new canister and installs the provided Wasm code with additional cycles.
///
/// # Arguments
/// - `controllers`: A list of `Principal` IDs to set as controllers of the new canister.
/// - `wasm_arg`: Wasm binary and arguments to install in the new canister (`WasmArg` struct).
/// - `cycles`: Additional cycles to deposit during canister creation on top of `CREATE_CANISTER_CYCLES`.
/// - `subnet_id`: The `SubnetId` where the canister should be created.
///
/// # Returns
/// - `Ok(Principal)`: On success, returns the `Principal` ID of the newly created canister.
/// - `Err(String)`: On failure, returns an error message.
pub async fn cmc_create_canister_install_code(
    controllers: Vec<Principal>,
    wasm_arg: &WasmArg,
    cycles: u128,
    subnet_id: &SubnetId,
) -> Result<Principal, String> {
    let cmc = Principal::from_text(CMC).unwrap();

    let create_canister_arg = CreateCanister {
        subnet_type: None,
        subnet_selection: Some(SubnetSelection::Subnet { subnet: *subnet_id }),
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
            Err(err) => Err(format!("Failed to create canister with CMC - {}", err)),
            Ok(canister_id) => {
                let install =
                    install_code(canister_id, wasm_arg, CanisterInstallMode::Install).await;

                match install {
                    Err(_) => {
                        Err("Failed to install code in canister created with CMC.".to_string())
                    }
                    Ok(_) => Ok(canister_id),
                }
            }
        },
    }
}

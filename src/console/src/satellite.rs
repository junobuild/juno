use crate::constants::SATELLITE_CREATION_FEE_ICP;
use crate::controllers::remove_console_controller_from_satellite;
use crate::store::{
    get_existing_mission_control, has_credits, increment_satellites_rate, insert_new_payment,
    is_known_payment, update_payment_completed, update_payment_refunded, use_credits,
};
use crate::types::ledger::Payment;
use crate::wasm::satellite_wasm_arg;
use candid::Principal;
use ic_ledger_types::BlockIndex;
use shared::constants::{
    CREATE_SATELLITE_CYCLES, IC_TRANSACTION_FEE_ICP, MEMO_SATELLITE_CREATE_REFUND,
};
use shared::ic::create_canister_install_code;
use shared::ledger::{
    find_payment, principal_to_account_identifier, transfer_payment, SUB_ACCOUNT,
};
use shared::types::interface::{CreateSatelliteArgs, MissionControlId, UserId};

pub async fn create_satellite(
    console: Principal,
    caller: Principal,
    CreateSatelliteArgs { user, block_index }: CreateSatelliteArgs,
) -> Result<Principal, String> {
    // User should have a mission control center
    let mission_control = get_existing_mission_control(&user, &caller)?;

    match mission_control.mission_control_id {
        None => Err("No mission control center found.".to_string()),
        Some(mission_control_id) => {
            if has_credits(&user, &mission_control_id) {
                // Guard too many requests
                increment_satellites_rate()?;

                return create_satellite_with_credits(&console, &mission_control_id, &user).await;
            }

            create_satellite_with_payment(
                &console,
                &caller,
                &mission_control_id,
                CreateSatelliteArgs { user, block_index },
            )
            .await
        }
    }
}

async fn create_satellite_with_credits(
    console: &Principal,
    mission_control_id: &MissionControlId,
    user: &UserId,
) -> Result<Principal, String> {
    // Create the satellite
    let create_canister_result = create_satellite_wasm(console, mission_control_id, user).await;

    match create_canister_result {
        Err(_) => Err("Satellite creation with credits failed.".to_string()),
        Ok(satellite_id) => {
            // Satellite is created we can use the credits
            let credits = use_credits(user);

            match credits {
                Err(e) => Err(e.to_string()),
                Ok(_) => Ok(satellite_id),
            }
        }
    }
}

async fn create_satellite_with_payment(
    console: &Principal,
    caller: &Principal,
    mission_control_id: &MissionControlId,
    CreateSatelliteArgs { user, block_index }: CreateSatelliteArgs,
) -> Result<Principal, String> {
    let mission_control_account_identifier = principal_to_account_identifier(caller, &SUB_ACCOUNT);
    let console_account_identifier = principal_to_account_identifier(console, &SUB_ACCOUNT);

    if block_index.is_none() {
        return Err("No block index provided to verify payment.".to_string());
    }

    // User should have processed a payment from the mission control center
    let mission_control_payment_block_index: BlockIndex = block_index.unwrap();
    let block = find_payment(
        mission_control_account_identifier,
        console_account_identifier,
        SATELLITE_CREATION_FEE_ICP,
        mission_control_payment_block_index,
    )
    .await;

    match block {
        None => Err([
            "No valid payment found to create satellite.",
            &format!(" Mission control: {}", mission_control_account_identifier),
            &format!(" Console: {}", console_account_identifier),
            &format!(" Amount: {}", SATELLITE_CREATION_FEE_ICP),
            &format!(" Block index: {}", block_index.unwrap()),
        ]
        .join("")),
        Some(_) => {
            if is_known_payment(&mission_control_payment_block_index) {
                return Err("Payment has been or is being processed.".to_string());
            }

            // We acknowledge the new payment
            insert_new_payment(&user, &mission_control_payment_block_index)?;

            // Create the satellite
            let create_canister_result =
                create_satellite_wasm(console, mission_control_id, &user).await;

            match create_canister_result {
                Err(error) => {
                    refund_satellite_creation(
                        mission_control_id,
                        &mission_control_payment_block_index,
                    )
                    .await?;

                    Err([
                        "Satellite creation failed. Mission control center has been refunded.",
                        &error,
                    ]
                    .join(" - "))
                }
                Ok(satellite_id) => {
                    // Satellite is created we can update the payment has being processed
                    update_payment_completed(&mission_control_payment_block_index)?;

                    Ok(satellite_id)
                }
            }
        }
    }
}

async fn create_satellite_wasm(
    console: &Principal,
    mission_control_id: &MissionControlId,
    user: &UserId,
) -> Result<Principal, String> {
    let wasm_arg = satellite_wasm_arg(user, mission_control_id);
    let result = create_canister_install_code(
        Vec::from([*console, *mission_control_id, *user]),
        &wasm_arg,
        CREATE_SATELLITE_CYCLES,
    )
    .await;

    match result {
        Err(error) => Err(error),
        Ok(satellite_id) => {
            remove_console_controller_from_satellite(&satellite_id, user, mission_control_id)
                .await?;
            Ok(satellite_id)
        }
    }
}

async fn refund_satellite_creation(
    mission_control_id: &MissionControlId,
    mission_control_payment_block_index: &BlockIndex,
) -> Result<Payment, String> {
    // We refund the satellite creation fee minus the ic fee - i.e. user pays the fee
    let refund_amount = SATELLITE_CREATION_FEE_ICP - IC_TRANSACTION_FEE_ICP;

    // Refund on error
    let refund_block_index = transfer_payment(
        mission_control_id,
        &SUB_ACCOUNT,
        MEMO_SATELLITE_CREATE_REFUND,
        refund_amount,
        IC_TRANSACTION_FEE_ICP,
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .map_err(|e| format!("ledger transfer error {:?}", e))?;

    // We record the refund in the payment list
    update_payment_refunded(mission_control_payment_block_index, &refund_block_index)
        .map_err(|e| format!("Insert refund transaction error {:?}", e))
}

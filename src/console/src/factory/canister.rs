use crate::accounts::{
    credits::{has_mission_control_and_credits, use_credits},
    get_account_with_existing_mission_control,
};
use crate::factory::services::ledger::{refund_payment, verify_payment};
use crate::store::stable::{
    insert_new_payment, is_known_payment, update_payment_completed, update_payment_refunded,
};
use crate::types::ledger::Payment;
use candid::Principal;
use ic_ledger_types::{BlockIndex, Tokens};
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::types::interface::CreateCanisterArgs;
use junobuild_shared::types::state::{MissionControlId, UserId};
use std::future::Future;

pub async fn create_canister<F, Fut>(
    create: F,
    increment_rate: &dyn Fn() -> Result<(), String>,
    get_fee: &dyn Fn() -> Tokens,
    caller: Principal,
    CreateCanisterArgs {
        user,
        block_index,
        subnet_id,
    }: CreateCanisterArgs,
) -> Result<Principal, String>
where
    F: FnOnce(MissionControlId, UserId, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    // User should have a mission control center
    let mission_control = get_account_with_existing_mission_control(&user, &caller)?;

    match mission_control.mission_control_id {
        None => Err("No mission control center found.".to_string()),
        Some(mission_control_id) => {
            let fee = get_fee();

            if has_mission_control_and_credits(&user, &mission_control_id, &fee) {
                // Guard too many requests
                increment_rate()?;

                return create_canister_with_credits(create, mission_control_id, user, subnet_id)
                    .await;
            }

            create_canister_with_payment(
                create,
                caller,
                mission_control_id,
                CreateCanisterArgs {
                    user,
                    block_index,
                    subnet_id,
                },
                fee,
            )
            .await
        }
    }
}

async fn create_canister_with_credits<F, Fut>(
    create: F,
    mission_control_id: MissionControlId,
    user: UserId,
    subnet_id: Option<SubnetId>,
) -> Result<Principal, String>
where
    F: FnOnce(MissionControlId, UserId, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    // Create the satellite
    let create_canister_result = create(mission_control_id, user, subnet_id).await;

    match create_canister_result {
        Err(_) => Err("Segment creation with credits failed.".to_string()),
        Ok(satellite_id) => {
            // Satellite is created we can use the credits
            let credits = use_credits(&user);

            match credits {
                Err(e) => Err(e.to_string()),
                Ok(_) => Ok(satellite_id),
            }
        }
    }
}

async fn create_canister_with_payment<F, Fut>(
    create: F,
    caller: Principal,
    mission_control_id: MissionControlId,
    CreateCanisterArgs {
        user,
        block_index,
        subnet_id,
    }: CreateCanisterArgs,
    fee: Tokens,
) -> Result<Principal, String>
where
    F: FnOnce(MissionControlId, UserId, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    if block_index.is_none() {
        return Err("No block index provided to verify payment.".to_string());
    }

    // User should have processed a payment from the mission control center
    let mission_control_payment_block_index: BlockIndex = block_index.unwrap();
    let _ = verify_payment(&caller, &mission_control_payment_block_index, fee).await?;

    if is_known_payment(&mission_control_payment_block_index) {
        return Err("Payment has been or is being processed.".to_string());
    }

    // We acknowledge the new payment
    insert_new_payment(&user, &mission_control_payment_block_index)?;

    // Create the canister (satellite or orbiter)
    let create_canister_result = create(mission_control_id, user, subnet_id).await;

    match create_canister_result {
        Err(error) => {
            refund_satellite_creation(
                &mission_control_id,
                &mission_control_payment_block_index,
                fee,
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

async fn refund_satellite_creation(
    mission_control_id: &MissionControlId,
    mission_control_payment_block_index: &BlockIndex,
    fee: Tokens,
) -> Result<Payment, String> {
    let refund_block_index = refund_payment(mission_control_id, fee).await?;

    // We record the refund in the payment list
    update_payment_refunded(mission_control_payment_block_index, &refund_block_index)
        .map_err(|e| format!("Insert refund transaction error {e:?}"))
}

use crate::accounts::credits::{has_credits, use_credits};
use crate::accounts::get_account_with_existing_mission_control;
use crate::factory::services::ledger::{refund_payment, verify_payment};
use crate::factory::types::{CanisterCreator, CreateCanisterArgs};
use crate::store::stable::{
    insert_new_payment, is_known_payment, update_payment_completed, update_payment_refunded,
};
use crate::types::ledger::Payment;
use candid::Principal;
use ic_ledger_types::{BlockIndex, Tokens};
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::types::state::UserId;
use std::future::Future;

pub async fn create_canister<F, Fut>(
    create: F,
    increment_rate: &dyn Fn() -> Result<(), String>,
    get_fee: &dyn Fn() -> Tokens,
    caller: Principal,
    user: UserId,
    args: CreateCanisterArgs,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    // User should have a mission control center
    let account = get_account_with_existing_mission_control(&user, &caller)?;

    match account.mission_control_id {
        None => Err("No mission control center found.".to_string()),
        Some(mission_control_id) => {
            let creator: CanisterCreator =
                CanisterCreator::MissionControl((mission_control_id, account.owner));

            let fee = get_fee();

            if has_credits(&account, &fee) {
                // Guard too many requests
                increment_rate()?;

                return create_canister_with_credits(create, creator, args).await;
            }

            create_canister_with_payment(create, creator, args, fee).await
        }
    }
}

async fn create_canister_with_credits<F, Fut>(
    create: F,
    creator: CanisterCreator,
    CreateCanisterArgs { subnet_id, .. }: CreateCanisterArgs,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    let account_owner = creator.account_owner().clone();

    // Create the satellite
    let create_canister_result = create(creator, subnet_id).await;

    match create_canister_result {
        Err(_) => Err("Segment creation with credits failed.".to_string()),
        Ok(satellite_id) => {
            // Satellite or orbiter is created we can use the credits
            let credits = use_credits(&account_owner);

            match credits {
                Err(e) => Err(e.to_string()),
                Ok(_) => Ok(satellite_id),
            }
        }
    }
}

async fn create_canister_with_payment<F, Fut>(
    create: F,
    creator: CanisterCreator,
    CreateCanisterArgs {
        block_index,
        subnet_id,
    }: CreateCanisterArgs,
    fee: Tokens,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    let purchaser = creator.purchaser().clone();

    if block_index.is_none() {
        return Err("No block index provided to verify payment.".to_string());
    }

    // User should have processed a payment from the mission control center
    let purchaser_payment_block_index: BlockIndex = block_index.unwrap();
    let _ = verify_payment(&purchaser, &purchaser_payment_block_index, fee).await?;

    if is_known_payment(&purchaser_payment_block_index) {
        return Err("Payment has been or is being processed.".to_string());
    }

    // We acknowledge the new payment
    insert_new_payment(&purchaser, &purchaser_payment_block_index)?;

    // Create the canister (satellite or orbiter)
    let create_canister_result = create(creator, subnet_id).await;

    match create_canister_result {
        Err(error) => {
            refund_canister_creation(&purchaser, &purchaser_payment_block_index, fee).await?;

            Err(["Canister creation failed. Buyer has been refunded.", &error].join(" - "))
        }
        Ok(satellite_id) => {
            // Satellite or orbiter is created, we can update the payment has being processed
            update_payment_completed(&purchaser_payment_block_index)?;

            Ok(satellite_id)
        }
    }
}

async fn refund_canister_creation(
    purchaser: &Principal,
    purchaser_payment_block_index: &BlockIndex,
    fee: Tokens,
) -> Result<Payment, String> {
    let refund_block_index = refund_payment(purchaser, fee).await?;

    // We record the refund in the payment list
    update_payment_refunded(purchaser_payment_block_index, &refund_block_index)
        .map_err(|e| format!("Insert refund transaction error {e:?}"))
}
